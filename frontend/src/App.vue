<script setup>
import { computed, onMounted, ref } from 'vue'
import { cities, stores } from './data/stores'
import { company } from './data/company'

const navItems = [
  { path: '/', key: 'homeNav' },
  { path: '/career', key: 'careerNav' },
  { path: '/privacy', key: 'privacyNav' }
]

const route = ref(normalizeRoute(window.location.hash))
const lang = ref('ru')
const selectedCity = ref('Уральск')
const showAllStores = ref(false)
const expandedVacancy = ref(null)
const mapConfigs = {
  Уральск: {
    src: 'https://www.openstreetmap.org/export/embed.html?bbox=51.325%2C51.178%2C51.426%2C51.255&layer=mapnik',
    bounds: { north: 51.255, south: 51.178, west: 51.325, east: 51.426 }
  },
  Аксай: {
    src: 'https://www.openstreetmap.org/export/embed.html?bbox=52.985%2C51.162%2C53.012%2C51.181&layer=mapnik',
    bounds: { north: 51.181, south: 51.162, west: 52.985, east: 53.012 }
  },
  Атырау: {
    src: 'https://www.openstreetmap.org/export/embed.html?bbox=51.84%2C47.07%2C52.02%2C47.15&layer=mapnik',
    bounds: { north: 47.15, south: 47.07, west: 51.84, east: 52.02 }
  }
}

function normalizeRoute(hash) {
  const value = hash.replace('#', '') || '/'
  return navItems.some((item) => item.path === value) ? value : '/'
}

function go(path) {
  window.location.hash = path
  route.value = path
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToAddresses() {
  const section = document.querySelector('#addresses-block')
  if (route.value !== '/') {
    go('/')
    window.setTimeout(() => section?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  } else {
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  window.addEventListener('hashchange', () => {
    route.value = normalizeRoute(window.location.hash)
  })
})

const currentStores = computed(() => stores.filter((store) => store.city === selectedCity.value))
const displayedStores = computed(() => (showAllStores.value ? currentStores.value : currentStores.value.slice(0, 6)))
const hasHiddenStores = computed(() => currentStores.value.length > 6)
const mappedStores = computed(() =>
  stores.filter((store) => store.city === selectedCity.value && store.coords)
)
const selectedMap = computed(() => mapConfigs[selectedCity.value] ?? mapConfigs['Уральск'])
const t = computed(() => translations[lang.value])

function selectCity(city) {
  selectedCity.value = city
  showAllStores.value = false
}

function toggleVacancy(title) {
  expandedVacancy.value = expandedVacancy.value === title ? null : title
}

function pinStyle(store) {
  const bounds = selectedMap.value.bounds
  const x = ((store.coords.lon - bounds.west) / (bounds.east - bounds.west)) * 100
  const y = ((bounds.north - store.coords.lat) / (bounds.north - bounds.south)) * 100

  return {
    left: `${Math.max(4, Math.min(96, x))}%`,
    top: `${Math.max(5, Math.min(92, y))}%`
  }
}

const cityLabels = {
  ru: { Уральск: 'Уральск', Аксай: 'Аксай', Атырау: 'Атырау' },
  kz: { Уральск: 'Орал', Аксай: 'Ақсай', Атырау: 'Атырау' }
}

const translations = {
  ru: {
    homeNav: 'Главная',
    careerNav: 'Карьера',
    privacyNav: 'Политика',
    eyebrow: 'Супермаркеты у дома',
    heroTitle: 'Все на каждый день.',
    heroLead:
      'Пешеход - сеть супермаркетов в Западном Казахстане с товарами для дома, свежими продуктами и привычным сервисом рядом с покупателем.',
    findStore: 'Найти магазин',
    workWithUs: 'Работать у нас',
    aboutKicker: 'О нас',
    aboutTitle: 'Магазины для быстрых покупок и семейной корзины.',
    aboutText:
      'Пешеход - это магазины рядом с домом, куда удобно зайти после работы, перед семейным ужином или за большим недельным набором продуктов. Мы делаем ставку на понятный ассортимент, свежие категории, аккуратную выкладку и быстрый сервис без лишней суеты. В магазинах можно собрать базовую корзину, купить продукты к празднику, выбрать товары для детей, дома и ежедневного ухода. А мобильное приложение помогает заранее посмотреть ассортимент, оформить заказ и сэкономить время.',
    appKicker: 'Мобильное приложение',
    appTitle: 'Скачайте приложение для покупок без лишних шагов.',
    appText:
      'Здесь можно будет разместить B2C-приложение: кнопки магазинов, QR-код, короткое описание и ссылку для клиентов.',
    appStrong: 'Каталог, акции и заказ в приложении',
    appSmall: 'Скоро здесь появятся ссылки на App Store и Google Play.',
    addressesKicker: 'Наши адреса',
    addressesTitle: 'Магазины по городам',
    schedule: 'График',
    email: 'Почта',
    open2gis: 'Открыть в 2ГИС',
    showAll: 'Показать все',
    showLess: 'Свернуть',
    mapKicker: 'Карта',
    mapTitle: 'Магазины на карте',
    mapText:
      'Бесплатная OpenStreetMap без API-ключа. Зеленые точки показывают магазины выбранного города, а в карточках есть прямые ссылки на 2ГИС.',
    careerKicker: 'Карьера',
    careerTitle: 'Карьера в Пешеходе',
    careerLead: 'Откликайтесь на открытые позиции или отправляйте резюме в кадровый резерв.',
    resumeText: 'Резюме можно отправить на почту',
    expandVacancy: 'Раскрыть',
    collapseVacancy: 'Свернуть',
    privacyKicker: 'Документы',
    privacyTitle: 'Политика конфиденциальности',
    privacyDate: 'Редакция от 30 апреля 2026 года.',
    policy: [
      ['1. Общие положения', 'Настоящая политика описывает, как сеть супермаркетов Пешеход обрабатывает персональные данные пользователей сайта и мобильного приложения.'],
      ['2. Какие данные могут обрабатываться', 'Мы можем получать имя, номер телефона, адрес электронной почты, адрес доставки, историю обращений, технические данные устройства и сведения, необходимые для оформления заказа или обратной связи.'],
      ['3. Цели обработки', 'Данные используются для регистрации, обработки заказов, поддержки пользователей, улучшения сервиса, отправки уведомлений и соблюдения требований законодательства.'],
      ['4. Передача данных', 'Данные не продаются третьим лицам. Передача возможна только сервисным подрядчикам, платежным, логистическим и техническим партнерам, если это нужно для оказания услуги.'],
      ['5. Хранение и защита', 'Мы применяем организационные и технические меры защиты и храним данные не дольше, чем это требуется для целей обработки.'],
      ['6. Обращения пользователей', `По вопросам обработки персональных данных можно написать на ${company.email}.`]
    ],
    stats: [
      { value: '22+', label: 'филиала в Западном Казахстане' },
      { value: '3 000+', label: 'товаров на каждый день' },
      { value: '08:00-23:00', label: 'расширенный график части магазинов' }
    ],
    vacancies: [
      { title: 'Продавец-кассир', city: 'Уральск / Аксай', schedule: 'Сменный график', description: 'Работа с покупателями, кассовая дисциплина, выкладка товара и порядок в торговом зале.', details: 'Обязанности: консультация покупателей, работа на кассе, контроль наличия ценников, выкладка товара, участие в приемке и поддержание чистоты рабочей зоны. Важно быть внимательным, вежливым и готовым работать в активном темпе магазина.' },
      { title: 'Товаровед', city: 'Уральск', schedule: '5/2', description: 'Приемка товара, контроль сроков годности, поставщики и внутренние остатки.', details: 'Обязанности: прием товара по документам, контроль качества и сроков годности, взаимодействие с поставщиками, учет остатков, списания, инвентаризации и помощь команде магазина в поддержании правильного товарного запаса.' },
      { title: 'Администратор магазина', city: 'Уральск / Аксай', schedule: 'Сменный график', description: 'Организация смены, стандарты сервиса, помощь команде и операционные задачи.', details: 'Обязанности: координация сотрудников на смене, контроль кассовой зоны и торгового зала, решение обращений покупателей, соблюдение стандартов сети, контроль выкладки, чистоты и готовности магазина к рабочему дню.' },
      { title: 'Кладовщик', city: 'Уральск', schedule: 'Сменный график', description: 'Разгрузка, размещение и учет товаров на складе магазина.', details: 'Обязанности: прием и размещение товара на складе, подготовка товара к выдаче в зал, поддержание порядка в складской зоне, участие в инвентаризациях и соблюдение правил хранения продукции.' }
    ]
  },
  kz: {
    homeNav: 'Басты бет',
    careerNav: 'Мансап',
    privacyNav: 'Құпиялылық',
    eyebrow: 'Үй жанындағы супермаркеттер',
    heroTitle: 'Күн сайын қажеттінің бәрі.',
    heroLead:
      'Пешеход - Батыс Қазақстандағы үйге, отбасыға және күнделікті сатып алуға арналған тауарлары бар супермаркеттер желісі.',
    findStore: 'Дүкенді табу',
    workWithUs: 'Бізбен жұмыс істеу',
    aboutKicker: 'Біз туралы',
    aboutTitle: 'Жылдам сатып алуға және отбасылық себетке арналған дүкендер.',
    aboutText:
      'Пешеход - жұмыстан кейін, отбасылық кешкі ас алдында немесе апталық азық-түлік алу үшін кіруге ыңғайлы үй жанындағы дүкендер. Біз түсінікті ассортиментке, жаңа өнім санаттарына, ұқыпты сөрелерге және жылдам қызмет көрсетуге мән береміз. Дүкендерден негізгі азық-түлікті, мерекеге арналған өнімдерді, балаларға, үйге және күнделікті күтімге қажет тауарларды табуға болады. Ал мобильді қосымша ассортиментті алдын ала көруге, тапсырыс беруге және уақыт үнемдеуге көмектеседі.',
    appKicker: 'Мобильді қосымша',
    appTitle: 'Сатып алуды жеңілдететін қосымшаны жүктеңіз.',
    appText:
      'Бұл жерде B2C қосымшасына арналған App Store және Google Play батырмаларын, QR-кодты және клиенттерге қысқа сипаттаманы орналастыруға болады.',
    appStrong: 'Каталог, акциялар және тапсырыс қосымшада',
    appSmall: 'Жақында App Store және Google Play сілтемелері қосылады.',
    addressesKicker: 'Мекенжайлар',
    addressesTitle: 'Қалалар бойынша дүкендер',
    schedule: 'Жұмыс уақыты',
    email: 'Пошта',
    open2gis: '2ГИС-те ашу',
    showAll: 'Барлығын көрсету',
    showLess: 'Жасыру',
    mapKicker: 'Карта',
    mapTitle: 'Дүкендер картада',
    mapText:
      'API-кілтсіз тегін OpenStreetMap қолданылады. Жасыл нүктелер таңдалған қаладағы дүкендерді көрсетеді, ал карточкаларда 2ГИС сілтемелері бар.',
    careerKicker: 'Мансап',
    careerTitle: 'Пешеходтағы мансап',
    careerLead: 'Ашық вакансияларға өтініш беріңіз немесе түйіндемеңізді кадрлық резервке жіберіңіз.',
    resumeText: 'Түйіндемені мына поштаға жіберуге болады',
    expandVacancy: 'Ашу',
    collapseVacancy: 'Жасыру',
    privacyKicker: 'Құжаттар',
    privacyTitle: 'Құпиялылық саясаты',
    privacyDate: 'Редакция: 2026 жылғы 30 сәуір.',
    policy: [
      ['1. Жалпы ережелер', 'Бұл саясат Пешеход супермаркеттер желісінің сайт және мобильді қосымша пайдаланушыларының дербес деректерін қалай өңдейтінін сипаттайды.'],
      ['2. Қандай деректер өңделуі мүмкін', 'Біз аты-жөнді, телефон нөмірін, электрондық поштаны, жеткізу мекенжайын, өтініштер тарихын, құрылғының техникалық деректерін және тапсырыс немесе кері байланыс үшін қажет мәліметтерді ала аламыз.'],
      ['3. Өңдеу мақсаттары', 'Деректер тіркеу, тапсырыстарды өңдеу, пайдаланушыларды қолдау, сервисті жақсарту, хабарламалар жіберу және заң талаптарын сақтау үшін қолданылады.'],
      ['4. Деректерді беру', 'Деректер үшінші тұлғаларға сатылмайды. Қызмет көрсету үшін қажет болған жағдайда ғана сервистік мердігерлерге, төлем, логистика және техникалық серіктестерге берілуі мүмкін.'],
      ['5. Сақтау және қорғау', 'Біз ұйымдастырушылық және техникалық қорғау шараларын қолданамыз және деректерді өңдеу мақсаттары үшін қажет мерзімнен артық сақтамаймыз.'],
      ['6. Пайдаланушы өтініштері', `Дербес деректерді өңдеу бойынша сұрақтарды ${company.email} поштасына жіберуге болады.`]
    ],
    stats: [
      { value: '22+', label: 'Батыс Қазақстандағы филиал' },
      { value: '3 000+', label: 'күнделікті қажет тауар' },
      { value: '08:00-23:00', label: 'кейбір дүкендердің ұзартылған кестесі' }
    ],
    vacancies: [
      { title: 'Сатушы-кассир', city: 'Орал / Ақсай', schedule: 'Ауысымды кесте', description: 'Сатып алушылармен жұмыс, касса, тауарларды орналастыру және залдағы тәртіп.', details: 'Міндеттері: сатып алушыларға кеңес беру, кассада жұмыс істеу, баға белгілерін бақылау, тауарларды сөреге қою, қабылдауға қатысу және жұмыс аймағын таза ұстау. Ұқыптылық, сыпайылық және белсенді қарқынға дайындық маңызды.' },
      { title: 'Тауартанушы', city: 'Орал', schedule: '5/2', description: 'Тауар қабылдау, жарамдылық мерзімі, жеткізушілер және қалдықтар.', details: 'Міндеттері: тауарды құжат бойынша қабылдау, сапа мен жарамдылық мерзімін бақылау, жеткізушілермен жұмыс, қалдықтарды есепке алу, есептен шығару, түгендеу және дүкен қорын дұрыс деңгейде ұстауға көмектесу.' },
      { title: 'Дүкен әкімшісі', city: 'Орал / Ақсай', schedule: 'Ауысымды кесте', description: 'Ауысымды ұйымдастыру, сервис стандарттары және операциялық міндеттер.', details: 'Міндеттері: ауысымдағы қызметкерлерді үйлестіру, касса аймағы мен сауда залын бақылау, сатып алушылар өтініштерін шешу, желі стандарттарын сақтау, сөрелердің, тазалықтың және дүкен дайындығының бақылауы.' },
      { title: 'Қоймашы', city: 'Орал', schedule: 'Ауысымды кесте', description: 'Тауарларды түсіру, қоймаға орналастыру және есепке алу.', details: 'Міндеттері: тауарды қабылдау және қоймаға орналастыру, залға шығаруға дайындау, қойма аймағында тәртіп сақтау, түгендеуге қатысу және сақтау ережелерін орындау.' }
    ]
  }
}
</script>

<template>
  <div class="site-shell">
    <header class="topbar">
      <button class="brand" type="button" @click="go('/')">
        <img src="/logo-peshekhod-wordmark.jpg" alt="Пешеход" />
      </button>

      <nav class="nav" aria-label="Основная навигация">
        <button
          v-for="item in navItems"
          :key="item.path"
          type="button"
          :class="{ active: route === item.path }"
          @click="go(item.path)"
        >
          {{ t[item.key] }}
        </button>
      </nav>

      <div class="language-switch" aria-label="Выбор языка">
        <button type="button" :class="{ active: lang === 'ru' }" @click="lang = 'ru'">RU</button>
        <button type="button" :class="{ active: lang === 'kz' }" @click="lang = 'kz'">KZ</button>
      </div>
    </header>

    <main>
      <section v-if="route === '/'" class="page home-page">
        <div class="hero">
          <div class="hero-copy">
            <p class="eyebrow">{{ t.eyebrow }}</p>
            <h1>{{ t.heroTitle }}</h1>
            <p class="lead">{{ t.heroLead }}</p>
            <div class="hero-actions">
              <button class="primary-action" type="button" @click="scrollToAddresses">{{ t.findStore }}</button>
              <button class="secondary-action" type="button" @click="go('/career')">{{ t.workWithUs }}</button>
            </div>
          </div>

          <div class="hero-card">
            <img src="/logo-peshekhod-circle.png?v=2" alt="" />
          </div>
        </div>

        <div class="stats-grid">
          <article v-for="stat in t.stats" :key="stat.label" class="stat-card">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </article>
        </div>

        <section class="split-section">
          <div>
            <p class="section-kicker">{{ t.aboutKicker }}</p>
            <h2>{{ t.aboutTitle }}</h2>
          </div>
          <p>{{ t.aboutText }}</p>
        </section>

        <section class="app-band">
          <div class="phone-preview">
            <div class="phone-screen" aria-label="Скриншот мобильного приложения Пешеход"></div>
          </div>
          <div class="app-copy">
            <p class="section-kicker">{{ t.appKicker }}</p>
            <h2>{{ t.appTitle }}</h2>
            <p>{{ t.appText }}</p>
            <div class="store-buttons" aria-label="Ссылки на приложение">
              <a :href="company.appStoreUrl">App Store</a>
              <a :href="company.googlePlayUrl">Google Play</a>
            </div>
          </div>
        </section>

        <section id="addresses-block" class="addresses-block">
          <div class="section-head">
            <div>
              <p class="section-kicker">{{ t.addressesKicker }}</p>
              <h2>{{ t.addressesTitle }}</h2>
            </div>
          </div>

          <div class="city-tabs" role="tablist" aria-label="Города">
            <button
              v-for="city in cities"
              :key="city"
              type="button"
              :class="{ active: selectedCity === city }"
              @click="selectCity(city)"
            >
              {{ cityLabels[lang][city] }}
            </button>
          </div>

          <div class="store-grid">
            <article v-for="store in displayedStores" :key="store.address" class="store-card">
              <span>{{ cityLabels[lang][store.city] }}</span>
              <h2>{{ store.name }}</h2>
              <p>{{ store.address }}</p>
              <dl>
                <div>
                  <dt>{{ t.schedule }}</dt>
                  <dd>{{ store.hours }}</dd>
                </div>
                <div v-if="store.email">
                  <dt>{{ t.email }}</dt>
                  <dd>{{ store.email }}</dd>
                </div>
              </dl>
              <a :href="store.mapUrl" target="_blank" rel="noreferrer">{{ t.open2gis }}</a>
            </article>
          </div>

          <button
            v-if="hasHiddenStores"
            class="show-all-button"
            type="button"
            @click="showAllStores = !showAllStores"
          >
            {{ showAllStores ? t.showLess : t.showAll }}
          </button>

          <section class="map-section">
            <div>
              <p class="section-kicker">{{ t.mapKicker }}</p>
              <h2>{{ t.mapTitle }}</h2>
              <p>{{ t.mapText }}</p>
            </div>
            <div class="map-frame">
              <iframe title="Карта магазинов Пешеход" :src="selectedMap.src" loading="lazy"></iframe>
              <template v-if="mappedStores.length">
                <a
                  v-for="store in mappedStores"
                  :key="store.address"
                  class="map-pin"
                  :style="pinStyle(store)"
                  :href="store.mapUrl"
                  target="_blank"
                  rel="noreferrer"
                  :aria-label="`${store.name}, ${store.address}`"
                  :title="`${store.name}: ${store.address}`"
                >
                  <span>{{ store.name }}</span>
                </a>
              </template>
            </div>
          </section>
        </section>
      </section>

      <section v-else-if="route === '/career'" class="page career-page">
        <div class="page-title">
          <p class="eyebrow">{{ t.careerKicker }}</p>
          <h1>{{ t.careerTitle }}</h1>
          <p class="lead">{{ t.careerLead }}</p>
        </div>

        <div class="vacancy-list">
          <article v-for="vacancy in t.vacancies" :key="vacancy.title" class="vacancy-card">
            <div>
              <span>{{ vacancy.city }}</span>
              <h2>{{ vacancy.title }}</h2>
              <p>{{ vacancy.description }}</p>
              <p v-if="expandedVacancy === vacancy.title" class="vacancy-details">
                {{ vacancy.details }}
              </p>
            </div>
            <div class="vacancy-actions">
              <strong>{{ vacancy.schedule }}</strong>
              <button type="button" @click="toggleVacancy(vacancy.title)">
                {{ expandedVacancy === vacancy.title ? t.collapseVacancy : t.expandVacancy }}
              </button>
            </div>
          </article>
        </div>

        <section class="contact-band">
          <p>{{ t.resumeText }}</p>
          <a :href="`mailto:${company.careerEmail}`">{{ company.careerEmail }}</a>
        </section>
      </section>

      <section v-else class="page privacy-page">
        <div class="page-title">
          <p class="eyebrow">{{ t.privacyKicker }}</p>
          <h1>{{ t.privacyTitle }}</h1>
          <p class="lead">{{ t.privacyDate }}</p>
        </div>

        <article class="policy">
          <template v-for="section in t.policy" :key="section[0]">
            <h2>{{ section[0] }}</h2>
            <p>{{ section[1] }}</p>
          </template>
        </article>
      </section>
    </main>

    <footer class="footer">
      <div>
        <img src="/logo-peshekhod-wordmark.jpg" alt="" />
        <p>{{ company.officeAddress }}</p>
        <a :href="`mailto:${company.email}`">{{ company.email }}</a>
      </div>
      <div class="footer-links">
        <button type="button" @click="go('/privacy')">{{ t.privacyTitle }}</button>
        <a class="instagram-link" :href="company.instagram" target="_blank" rel="noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5"></rect>
            <circle cx="12" cy="12" r="4"></circle>
            <circle cx="17.5" cy="6.5" r="1.2"></circle>
          </svg>
        </a>
      </div>
    </footer>
  </div>
</template>
