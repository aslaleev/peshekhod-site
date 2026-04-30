package kz.peshekhod.site;

import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "https://*.vercel.app"})
public class SiteController {
    @GetMapping("/company")
    public Company company() {
        return new Company(
            "Пешеход",
            "Сеть супермаркетов \"Пешеходъ\"",
            "090004, ЗКО, г. Уральск, пр-т Абулхаир Хана, 2/11",
            "info@chance.kz",
            "hr@peshekhod.kz",
            "https://www.instagram.com/peshehod_uralsk/"
        );
    }

    @GetMapping("/stores")
    public List<Store> stores() {
        return List.of(
            new Store("Уральск", "ТД Квант", "ул. Сырыма Датова, 28/2", "09:00-23:00", "phh.kvant@mail.ru"),
            new Store("Уральск", "ТД Орал", "проспект Абулхаир Хана, 179", "09:00-23:00", "phh.oral@mail.ru"),
            new Store("Уральск", "Автовокзал / Hazar Market", "ул. Сырыма Датова, 4г", "08:00-23:00", "phh.avtovokzal@mail.ru"),
            new Store("Уральск", "Курмангазы", "ул. Курмангазы, 109", "09:00-23:00", null),
            new Store("Уральск", "Курмангазы 164", "ул. Курмангазы, 164", "09:00-23:00", null),
            new Store("Уральск", "Жумагалиева", "ул. Кайрата Жумагалиева, 16Б", "09:00-22:00", null),
            new Store("Уральск", "Досмухамедова", "ул. Досмухамедова, 48/2", "08:00-21:00", null),
            new Store("Уральск", "Есенжанова", "ул. Есенжанова, 34", "09:00-23:00", null),
            new Store("Уральск", "Абая", "проспект Абая, 115", "09:00-23:00", null),
            new Store("Уральск", "Ескалиева", "ул. Ескалиева, 305", "09:00-22:00", null),
            new Store("Уральск", "Мухита", "ул. Мухита, 98", "09:00-23:00", null),
            new Store("Уральск", "Кунаева", "ул. Кунаева, 1", "09:00-23:00", null),
            new Store("Уральск", "Зачаганск", "ул. Жангир хана, 37/6", "09:00-23:00", null),
            new Store("Уральск", "Кеменгер", "ул. Кеменгер, 41а", "09:00-23:00", null),
            new Store("Уральск", "Конкина", "ул. Конкина, 2/11", "09:00-22:00", null),
            new Store("Аксай", "5-й микрорайон", "5-й микрорайон, 21/1", "08:00-23:00", null),
            new Store("Атырау", "Скоро открытие", "Адрес будет объявлен перед запуском магазина", "Скоро", null)
        );
    }

    @GetMapping("/vacancies")
    public List<Vacancy> vacancies() {
        return List.of(
            new Vacancy("Продавец-кассир", "Уральск / Аксай", "Сменный график"),
            new Vacancy("Товаровед", "Уральск", "5/2"),
            new Vacancy("Администратор магазина", "Уральск / Аксай", "Сменный график"),
            new Vacancy("Кладовщик", "Уральск", "Сменный график")
        );
    }

    public record Company(String name, String legalName, String officeAddress, String email, String careerEmail, String instagram) {}

    public record Store(String city, String name, String address, String hours, String email) {}

    public record Vacancy(String title, String city, String schedule) {}
}
