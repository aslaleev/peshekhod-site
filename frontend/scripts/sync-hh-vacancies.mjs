import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const employerId = '9696435'
const searchUrl = `https://uralsk.hh.kz/search/vacancy?employer_id=${employerId}&area=40&from=employerPage`
const userAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile Safari/604.1'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.resolve(__dirname, '../src/data/vacancies.json')

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': userAgent,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8'
    }
  })

  if (!response.ok) {
    throw new Error(`HH request failed: ${response.status} ${response.statusText} for ${url}`)
  }

  return response.text()
}

function decodeHtml(value = '') {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&#160;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function extractInitialState(html) {
  const match = html.match(/<template[^>]*id="HH-Lux-InitialState"[^>]*>([\s\S]*?)<\/template>/)

  if (!match) {
    throw new Error('HH initial state was not found')
  }

  return JSON.parse(decodeHtml(match[1]))
}

function extractElementHtml(html, dataQa) {
  const start = html.search(new RegExp(`<([a-z0-9]+)[^>]*data-qa=["']${dataQa}["'][^>]*>`, 'i'))

  if (start === -1) {
    return ''
  }

  const open = html.slice(start).match(/^<([a-z0-9]+)/i)
  const tag = open?.[1]

  if (!tag) {
    return ''
  }

  const tagPattern = new RegExp(`</?${tag}\\b[^>]*>`, 'gi')
  tagPattern.lastIndex = start

  let depth = 0
  let end = start
  let match

  while ((match = tagPattern.exec(html))) {
    const isClose = match[0].startsWith('</')
    depth += isClose ? -1 : 1

    if (depth === 0) {
      end = tagPattern.lastIndex
      break
    }
  }

  return html.slice(start, end)
}

function htmlToParagraphs(html) {
  return decodeHtml(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|h2|h3|div)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function formatMoney(value) {
  return new Intl.NumberFormat('ru-RU').format(value)
}

function formatSalary(compensation) {
  if (!compensation) {
    return 'з/п не указана'
  }

  const { from, to, gross } = compensation
  const taxText = gross ? 'до вычета налогов' : 'на руки'

  if (from && to) {
    return `${formatMoney(from)} - ${formatMoney(to)} ₸ за месяц, ${taxText}`
  }

  if (from) {
    return `от ${formatMoney(from)} ₸ за месяц, ${taxText}`
  }

  if (to) {
    return `до ${formatMoney(to)} ₸ за месяц, ${taxText}`
  }

  return 'з/п не указана'
}

function formatExperience(value) {
  const labels = {
    noExperience: 'Без опыта',
    between1And3: 'Опыт 1-3 года',
    between3And6: 'Опыт 3-6 лет',
    moreThan6: 'Опыт более 6 лет'
  }

  return labels[value] ?? 'Опыт не указан'
}

function formatSchedule(vacancy) {
  const parts = []

  if (vacancy.employment?.['@type'] === 'FULL' || vacancy.employmentForm === 'FULL') {
    parts.push('Полная занятость')
  }

  const days = vacancy.workScheduleByDays?.[0]?.workScheduleByDaysElement?.[0]
  const hours = vacancy.workingHours?.[0]?.workingHoursElement?.[0]

  if (days === 'FIVE_ON_TWO_OFF') {
    parts.push('5/2')
  }

  if (hours === 'HOURS_8') {
    parts.push('8 часов')
  }

  const frequency = vacancy.compensation?.frequency

  if (frequency === 'MONTHLY') {
    parts.push('выплаты раз в месяц')
  } else if (frequency === 'TWICE_PER_MONTH') {
    parts.push('выплаты два раза в месяц')
  } else if (frequency === 'WEEKLY') {
    parts.push('выплаты раз в неделю')
  }

  return parts.join(', ') || 'График не указан'
}

function compactDescription(paragraphs) {
  const firstUseful = paragraphs.find((paragraph) => !/^обязанности:?$/i.test(paragraph))

  if (!firstUseful) {
    return 'Актуальная вакансия компании Пешеход.'
  }

  return firstUseful.length > 180 ? `${firstUseful.slice(0, 177).trim()}...` : firstUseful
}

async function getVacancyDetails(url) {
  try {
    const html = await fetchText(url)
    const descriptionHtml = extractElementHtml(html, 'vacancy-description')
    const paragraphs = htmlToParagraphs(descriptionHtml).filter(
      (paragraph) => !['Обязанности:', 'Требования:', 'Условия:'].includes(paragraph)
    )

    return {
      description: compactDescription(paragraphs),
      details: paragraphs.slice(0, 8)
    }
  } catch (error) {
    console.warn(`Could not load vacancy details from ${url}: ${error.message}`)
    return {
      description: 'Актуальная вакансия компании Пешеход.',
      details: ['Подробное описание доступно на странице вакансии HH.']
    }
  }
}

async function main() {
  const html = await fetchText(searchUrl)
  const state = extractInitialState(html)
  const vacancies = state.vacancySearchResult?.vacancies ?? []

  if (vacancies.length === 0) {
    throw new Error('HH returned zero vacancies; keeping current site data is safer than overwriting it')
  }

  const items = await Promise.all(
    vacancies.map(async (vacancy) => {
      const sourceUrl = vacancy.links?.desktop ?? `https://uralsk.hh.kz/vacancy/${vacancy.vacancyId}`
      const detail = await getVacancyDetails(sourceUrl)

      return {
        id: String(vacancy.vacancyId),
        title: vacancy.name,
        city: vacancy.area?.name ?? '',
        salary: formatSalary(vacancy.compensation),
        experience: formatExperience(vacancy.workExperience),
        schedule: formatSchedule(vacancy),
        address: vacancy.address?.displayName ?? vacancy.area?.name ?? '',
        sourceUrl,
        description: detail.description,
        details: detail.details,
        publishedAt: vacancy.publicationTime?.$ ?? vacancy.creationTime ?? null,
        changedAt: vacancy.lastChangeTime?.$ ?? null
      }
    })
  )

  const latestChangedAt = items
    .map((item) => item.changedAt ?? item.publishedAt)
    .filter(Boolean)
    .sort()
    .at(-1)

  const payload = {
    updatedAt: latestChangedAt ?? new Date().toISOString(),
    sourceUrl: searchUrl,
    items
  }

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(`Synced ${items.length} HH vacancies to ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
