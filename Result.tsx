import { Link, useLocation, useNavigate } from "react-router";
import { ShieldAlert, Flame, Droplets, Bomb, Radiation, AlertCircle, CheckCircle, XCircle, User, Phone, Save, RotateCcw, Droplet, Heart, Mountain, Wind, CloudSnow, Sun, Car, Building, Skull, AlertTriangle, Siren, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state || { threat: "fire" };

  // Завантажити дані профілю з localStorage
  const [profileData, setProfileData] = useState({
    name: "",
    bloodType: "",
    allergies: "",
    chronicDiseases: "",
    medications: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: ""
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
  }, []);

  const threats = {
    // Природні катастрофи
    flood: {
      name: "ПОВІНЬ",
      icon: Droplets,
      color: "bg-blue-600",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    earthquake: {
      name: "ЗЕМЛЕТРУС",
      icon: Mountain,
      color: "bg-orange-600",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    hurricane: {
      name: "УРАГАН / ШТОРМ",
      icon: Wind,
      color: "bg-gray-600",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    wildfire: {
      name: "ЛІСОВА ПОЖЕЖА",
      icon: Flame,
      color: "bg-red-600",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    landslide: {
      name: "ЗСУВ ҐРУНТУ",
      icon: Mountain,
      color: "bg-yellow-700",
      riskLevel: "середній",
      riskColor: "bg-yellow-100 text-yellow-900 border-yellow-300"
    },
    snow: {
      name: "СИЛЬНИЙ СНІГ / ОЖЕЛЕДИЦЯ",
      icon: CloudSnow,
      color: "bg-cyan-600",
      riskLevel: "середній",
      riskColor: "bg-yellow-100 text-yellow-900 border-yellow-300"
    },
    heatwave: {
      name: "ПОСУХА / СПЕКА",
      icon: Sun,
      color: "bg-amber-600",
      riskLevel: "середній",
      riskColor: "bg-yellow-100 text-yellow-900 border-yellow-300"
    },
    // Техногенні катастрофи
    fire: {
      name: "ПОЖЕЖА В БУДІВЛІ",
      icon: Flame,
      color: "bg-red-600",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    explosion: {
      name: "ВИБУХ",
      icon: Bomb,
      color: "bg-orange-600",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    chemical: {
      name: "ХІМІЧНА АВАРІЯ",
      icon: Skull,
      color: "bg-purple-600",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    radiation: {
      name: "РАДІАЦІЙНА АВАРІЯ",
      icon: Radiation,
      color: "bg-yellow-600",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    transport: {
      name: "АВАРІЯ НА ТРАНСПОРТІ",
      icon: Car,
      color: "bg-blue-700",
      riskLevel: "середній",
      riskColor: "bg-yellow-100 text-yellow-900 border-yellow-300"
    },
    collapse: {
      name: "ОБВАЛ БУДІВЛІ",
      icon: Building,
      color: "bg-gray-700",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    // Воєнні загрози
    shelling: {
      name: "ОБСТРІЛ",
      icon: Bomb,
      color: "bg-red-700",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    "air-raid": {
      name: "ПОВІТРЯНА ТРИВОГА",
      icon: Siren,
      color: "bg-orange-700",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    blast: {
      name: "ВИБУХ",
      icon: AlertTriangle,
      color: "bg-yellow-700",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    mine: {
      name: "МІННА НЕБЕЗПЕКА",
      icon: AlertTriangle,
      color: "bg-purple-700",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    evacuation: {
      name: "УКРИТТЯ / ЕВАКУАЦІЯ",
      icon: ShieldAlert,
      color: "bg-blue-700",
      riskLevel: "середній",
      riskColor: "bg-yellow-100 text-yellow-900 border-yellow-300"
    },
    // Медичні надзвичайні ситуації
    outbreak: {
      name: "СПАЛАХ ІНФЕКЦІЙНОГО ЗАХВОРЮВАННЯ",
      icon: AlertCircle,
      color: "bg-red-700",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    poisoning: {
      name: "МАСОВЕ ОТРУЄННЯ",
      icon: Skull,
      color: "bg-purple-700",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    epidemic: {
      name: "ЕПІДЕМІЯ",
      icon: Activity,
      color: "bg-orange-700",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    },
    pandemic: {
      name: "ПАНДЕМІЯ",
      icon: Heart,
      color: "bg-blue-800",
      riskLevel: "високий",
      riskColor: "bg-red-100 text-red-900 border-red-300"
    }
  };

  const currentThreat = threats[data.threat as keyof typeof threats] || threats.fire;
  const Icon = currentThreat.icon;

  const recommendations = {
    // Природні катастрофи
    flood: {
      doNow: [
        "Піднімітесь на вищі поверхи",
        "Вимкніть електрику та газ",
        "Візьміть запас питної води",
        "Зв'яжіться з рятувальниками 101",
        "Не підходьте до води"
      ],
      take: [
        "Документи в водонепроникній упаковці",
        "Запас питної води та їжі на 3 дні",
        "Ліхтарик та батарейки",
        "Теплий одяг",
        "Мобільний телефон та зарядний пристрій",
        "Необхідні ліки"
      ],
      dontDo: [
        "Не заходьте у воду",
        "Не їдьте затопленими дорогами",
        "Не торкайтесь електроприладів мокрими руками",
        "Не залишайтесь у підвалі при підтопленні"
      ]
    },
    earthquake: {
      doNow: [
        "Сховайтесь під міцний стіл або в дверному прорізі",
        "Тримайтесь подалі від вікон",
        "Не користуйтесь ліфтом",
        "Після поштовхів виходьте на вулицю",
        "Очікуйте повторних поштовхів"
      ],
      take: [
        "Документи",
        "Ліхтарик",
        "Запас води",
        "Аптечка",
        "Мобільний телефон",
        "Теплий одяг"
      ],
      dontDo: [
        "Не вибігайте під час поштовхів",
        "Не користуйтесь ліфтом",
        "Не підходьте до пошкоджених будівель",
        "Не запалюйте вогонь"
      ]
    },
    hurricane: {
      doNow: [
        "Зачиніть усі вікна та двері",
        "Відійдіть від вікон",
        "Залишайтесь у центральній частині будинку",
        "Підготуйте запас їжі та води",
        "Слухайте оновлення погоди"
      ],
      take: [
        "Документи",
        "Запас води та їжі на 3-5 днів",
        "Ліхтарик та батарейки",
        "Радіоприймач",
        "Аптечка",
        "Мобільний телефон"
      ],
      dontDo: [
        "Не виходьте на вулицю під час урагану",
        "Не відкривайте вікна",
        "Не стійте біля великих дерев",
        "Не користуйтесь електроприладами"
      ]
    },
    wildfire: {
      doNow: [
        "Евакуюйтесь негайно",
        "Закрийте всі вікна та двері",
        "Захистіть дихальні шляхи вологою тканиною",
        "Вимкніть газ та електрику",
        "Рухайтесь перпендикулярно до напрямку вогню"
      ],
      take: [
        "Документи",
        "Воду",
        "Вологі рушники",
        "Мобільний телефон",
        "Аптечка",
        "Ліхтарик"
      ],
      dontDo: [
        "Не намагайтесь гасити самостійно",
        "Не ховайтесь у підвалі",
        "Не йдіть назустріч вогню",
        "Не паркуйте автомобіль біля дерев"
      ]
    },
    landslide: {
      doNow: [
        "Негайно покиньте небезпечну зону",
        "Рухайтесь вгору або в сторони від зсуву",
        "Попередьте сусідів",
        "Зв'яжіться з рятувальниками",
        "Не повертайтесь додому до дозволу"
      ],
      take: [
        "Документи",
        "Мобільний телефон",
        "Воду",
        "Теплий одяг",
        "Ліхтарик",
        "Аптечка"
      ],
      dontDo: [
        "Не залишайтесь в будинку",
        "Не намагайтесь переїхати зону зсуву",
        "Не повертайтесь за речами",
        "Не ігноруйте попередження"
      ]
    },
    snow: {
      doNow: [
        "Залишайтесь вдома, якщо можливо",
        "Підготуйте запас їжі та води",
        "Перевірте опалення",
        "Зарядіть телефон та ліхтарики",
        "Слухайте оновлення погоди"
      ],
      take: [
        "Теплий одяг та ковдри",
        "Запас їжі та гарячих напоїв",
        "Ліхтарик та свічки",
        "Батарейки",
        "Аптечка",
        "Мобільний телефон"
      ],
      dontDo: [
        "Не виходьте без потреби",
        "Не їдьте автомобілем у снігопад",
        "Не залишайте працюючим електрообігрівач без нагляду",
        "Не виснажуйте організм переохолодженням"
      ]
    },
    heatwave: {
      doNow: [
        "Залишайтесь у прохолодному приміщенні",
        "Пийте багато води",
        "Уникайте фізичних навантажень",
        "Закрийте вікна від сонця",
        "Перевіряйте стан літніх людей"
      ],
      take: [
        "Запас питної води",
        "Легкий одяг",
        "Головний убір",
        "Сонцезахисний крем",
        "Аптечка",
        "Вентилятор або кондиціонер"
      ],
      dontDo: [
        "Не залишайтесь на сонці тривалий час",
        "Не займайтесь спортом у спеку",
        "Не залишайте дітей та тварин у автомобілі",
        "Не пийте алкоголь"
      ]
    },
    // Техногенні катастрофи
    fire: {
      doNow: [
        "Негайно покиньте приміщення",
        "Закрийте двері, але не замикайте на ключ",
        "Рухайтесь низько, ближче до підлоги",
        "Не користуйтесь ліфтом",
        "Викличте рятувальників 101"
      ],
      take: [
        "Документи та гроші",
        "Мобільний телефон",
        "Ліки (якщо є час)",
        "Вологу тканину для захисту дихання"
      ],
      dontDo: [
        "Не повертайтесь за речами",
        "Не відкривайте двері, якщо вони гарячі",
        "Не користуйтесь ліфтом",
        "Не стрибайте з вікон вище 2 поверху"
      ]
    },
    explosion: {
      doNow: [
        "Лягте на підлогу, закрийте голову руками",
        "Відкрийте рот для вирівнювання тиску",
        "Відійдіть від вікон та скла",
        "Вимкніть газ та електрику",
        "Покиньте будівлю після вибуху"
      ],
      take: [
        "Документи",
        "Мобільний телефон",
        "Аптечка",
        "Вода",
        "Ліхтарик"
      ],
      dontDo: [
        "Не користуйтесь відкритим вогнем",
        "Не торкайтесь пошкоджених електропроводів",
        "Не повертайтесь в будівлю без дозволу",
        "Не натискайте вимикачі світла"
      ]
    },
    chemical: {
      doNow: [
        "Закрийте всі вікна та двері",
        "Вимкніть вентиляцію та кондиціонер",
        "Захистіть дихальні шляхи вологою тканиною",
        "Перейдіть у найвіддаленішу від джерела кімнату",
        "Очікуйте вказівок служб порятунку"
      ],
      take: [
        "Вологі рушники для захисту дихання",
        "Запас води та їжі",
        "Необхідні ліки",
        "Документи",
        "Радіоприймач на батарейках"
      ],
      dontDo: [
        "Не виходьте на вулицю без захисту",
        "Не відкривайте вікна",
        "Не їжте продукти, які були на відкритому повітрі",
        "Не торкайтесь підозрілих рідин"
      ]
    },
    radiation: {
      doNow: [
        "Сховайтесь у підвалі або центральній кімнаті",
        "Закрийте всі вікна та двері",
        "Вимкніть вентиляцію",
        "Приймайте йодид калію за вказівкою",
        "Слухайте офіційні повідомлення"
      ],
      take: [
        "Запас води та консервів",
        "Радіоприймач",
        "Документи",
        "Ліки",
        "Йодид калію",
        "Батарейки"
      ],
      dontDo: [
        "Не виходьте на вулицю",
        "Не їжте свіжі продукти з вулиці",
        "Не пийте воду з відкритих джерел",
        "Не ігноруйте офіційні попередження"
      ]
    },
    transport: {
      doNow: [
        "Зупиніть транспорт безпечно",
        "Увімкніть аварійні сигнали",
        "Викличте швидку та поліцію",
        "Надайте першу допомогу постраждалим",
        "Не переміщуйте важко травмованих"
      ],
      take: [
        "Аптечка",
        "Вогнегасник",
        "Аварійний знак",
        "Документи",
        "Мобільний телефон"
      ],
      dontDo: [
        "Не залишайте місце ДТП",
        "Не палійте біля пошкодженого авто",
        "Не переміщуйте постраждалих без потреби",
        "Не давайте воду при підозрі на внутрішню травму"
      ]
    },
    collapse: {
      doNow: [
        "Негайно покиньте будівлю",
        "Попередьте інших людей",
        "Викличте рятувальників 101",
        "Допоможіть евакуюватись людям з обмеженими можливостями",
        "Не повертайтесь в будівлю"
      ],
      take: [
        "Документи",
        "Мобільний телефон",
        "Ліки",
        "Ліхтарик",
        "Вода"
      ],
      dontDo: [
        "Не користуйтесь ліфтом",
        "Не повертайтесь за речами",
        "Не заходьте у пошкоджену будівлю",
        "Не стійте біля будівлі"
      ]
    },
    // Воєнні загрози
    shelling: {
      doNow: [
        "Негайно шукайте укриття",
        "Лягте на підлогу подалі від вікон",
        "Закрийте вікна та двері",
        "Вимкніть газ та електрику",
        "Не виходьте до відбою тривоги"
      ],
      take: [
        "Тривожну валізу",
        "Документи",
        "Воду та перекус",
        "Ліки",
        "Ліхтарик",
        "Мобільний телефон"
      ],
      dontDo: [
        "Не залишайтесь біля вікон",
        "Не виходьте на вулицю під час обстрілу",
        "Не підходьте до уражених ділянок",
        "Не торкайтесь невідомих предметів"
      ]
    },
    "air-raid": {
      doNow: [
        "Негайно йдіть до укриття",
        "Візьміть тривожну валізу",
        "Допоможіть літнім людям та дітям",
        "Залишайтесь в укритті до відбою",
        "Слухайте офіційні повідомлення"
      ],
      take: [
        "Документи",
        "Вода та їжа",
        "Ліки",
        "Пауербанк",
        "Теплий одяг",
        "Ліхтарик"
      ],
      dontDo: [
        "Не ігноруйте сигнал тривоги",
        "Не залишайтесь на вулиці",
        "Не користуйтесь ліфтом",
        "Не фотографуйте військові об'єкти"
      ]
    },
    blast: {
      doNow: [
        "Негайно лягте на землю",
        "Закрийте голову руками",
        "Відкрийте рот",
        "Відповзайте від місця вибуху",
        "Перевірте себе на травми"
      ],
      take: [
        "Аптечка",
        "Мобільний телефон",
        "Вода",
        "Документи"
      ],
      dontDo: [
        "Не наближайтесь до місця вибуху",
        "Не торкайтесь підозрілих предметів",
        "Не палійте",
        "Не користуйтесь мобільним біля невідомих пристроїв"
      ]
    },
    mine: {
      doNow: [
        "Зупиніться негайно",
        "Не рухайтесь далі",
        "Позначте небезпечне місце",
        "Викличте сапернів 101",
        "Попередьте інших людей"
      ],
      take: [
        "Мобільний телефон",
        "Яскраву тканину для позначення",
        "Документи"
      ],
      dontDo: [
        "Не торкайтесь підозрілих предметів",
        "Не йдіть невідомими шляхами",
        "Не збирайте незнайомі речі",
        "Не відхиляйтесь від розмінованих доріг"
      ]
    },
    evacuation: {
      doNow: [
        "Зберіть тривожну валізу",
        "Візьміть документи та гроші",
        "Вимкніть газ, воду, електрику",
        "Замкніть двері та вікна",
        "Слухайте інструкції влади"
      ],
      take: [
        "Документи (паспорт, свідоцтва)",
        "Гроші та банківські картки",
        "Ліки та аптечка",
        "Вода та їжа на 3 дні",
        "Теплий одяг та білизна",
        "Мобільний телефон та зарядка",
        "Важливі речі (фото, цінності)"
      ],
      dontDo: [
        "Не затримуйтесь надовго",
        "Не берійте зайві речі",
        "Не їдьте в заборонених напрямках",
        "Не ігноруйте офіційні вказівки"
      ]
    },
    // Медичні надзвичайні ситуації
    outbreak: {
      doNow: [
        "Обмежте контакти з людьми",
        "Носіть маску в громадських місцях",
        "Часто мийте руки",
        "Дезінфікуйте поверхні",
        "Звертайтесь до лікаря при симптомах"
      ],
      take: [
        "Медичні маски та рукавички",
        "Дезінфікуючі засоби",
        "Термометр",
        "Ліки від температури",
        "Запас їжі",
        "Вода"
      ],
      dontDo: [
        "Не ігноруйте симптоми",
        "Не відвідуйте людні місця при хворобі",
        "Не займайтесь самолікуванням",
        "Не поширюйте панічні чутки"
      ]
    },
    poisoning: {
      doNow: [
        "Викличте швидку 103",
        "Не їжте та не пийте далі",
        "Викличте блювоту (якщо свідомий)",
        "Випийте активоване вугілля",
        "Зберіть зразок їжі/речовини"
      ],
      take: [
        "Активоване вугілля",
        "Вода",
        "Зразок їжі/речовини",
        "Список з'їдених продуктів",
        "Документи"
      ],
      dontDo: [
        "Не викликайте блювоту при отруєнні кислотами",
        "Не давайте знеболюючі",
        "Не займайтесь самолікуванням",
        "Не приховуйте факт отруєння"
      ]
    },
    epidemic: {
      doNow: [
        "Дотримуйтесь карантину",
        "Носіть засоби захисту",
        "Вакцинуйтесь за можливості",
        "Слідкуйте за офіційними повідомленнями",
        "Ізолюйтесь при симптомах"
      ],
      take: [
        "Медичні маски",
        "Антисептики",
        "Термометр",
        "Ліки",
        "Запас продуктів",
        "Засоби гігієни"
      ],
      dontDo: [
        "Не відвідуйте людні місця",
        "Не контактуйте з хворими",
        "Не відмовляйтесь від вакцинації",
        "Не панікуйте"
      ]
    },
    pandemic: {
      doNow: [
        "Дотримуйтесь усіх обмежень",
        "Працюйте віддалено, якщо можливо",
        "Запасіться необхідним на тривалий час",
        "Вакцинуйтесь",
        "Слідкуйте за здоров'ям"
      ],
      take: [
        "Засоби індивідуального захисту",
        "Дезінфікуючі засоби",
        "Запас ліків на 3 місяці",
        "Продукти довгого зберігання",
        "Засоби гігієни",
        "Аптечка"
      ],
      dontDo: [
        "Не ігноруйте карантинні заходи",
        "Не виїжджайте без потреби",
        "Не відмовляйтесь від медичної допомоги",
        "Не поширюйте дезінформацію"
      ]
    }
  };

  const current = recommendations[data.threat as keyof typeof recommendations] || recommendations.fire;

  const personalTips = [];
  if (data.hasChildren) personalTips.push("Підготуйте дітей до евакуації, візьміть іграшку для заспокоєння");
  if (data.hasPets) personalTips.push("Візьміть переноску для тварин, не залишайте їх");
  if (data.hasHealthIssues) personalTips.push("Обов'язково візьміть ліки та медичні документи");
  if (data.hasTransport) personalTips.push("Використовуйте транспорт для швидкої евакуації");
  if (data.location) personalTips.push(`Локація: ${data.location} - слідкуйте за місцевими повідомленнями`);

  const handleSave = () => {
    alert("Рекомендації збережено!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-blue-900" />
            <h1 className="text-2xl font-bold text-blue-900">SafeWay</h1>
          </Link>
          <Link to="/profile" className="px-6 py-2 text-blue-900 hover:bg-gray-100 rounded-lg transition-colors">
            Профіль
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Threat Header */}
          <div className={`${currentThreat.color} text-white rounded-2xl shadow-xl p-8 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Icon className="w-16 h-16" />
                <h2 className="text-5xl font-bold">{currentThreat.name}</h2>
              </div>
              <div className={`px-6 py-3 ${currentThreat.riskColor} rounded-xl border-2 font-bold text-lg`}>
                Рівень ризику: {currentThreat.riskLevel}
              </div>
            </div>
          </div>

          {/* Do Now */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-7 h-7 text-red-600" />
              <h3 className="text-2xl font-bold text-gray-900">Що робити зараз</h3>
            </div>
            <ul className="space-y-3">
              {current.doNow.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-lg">
                  <span className="w-8 h-8 bg-red-100 text-red-900 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-gray-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Take With You */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-900">Що взяти з собою</h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.take.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg text-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don't Do */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-7 h-7 text-red-600" />
              <h3 className="text-2xl font-bold text-gray-900">Чого НЕ робити</h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.dontDo.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg text-lg">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-gray-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Personal Recommendations */}
          {personalTips.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-7 h-7 text-blue-900" />
                <h3 className="text-2xl font-bold text-blue-900">Персональні рекомендації</h3>
              </div>
              <ul className="space-y-2">
                {personalTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-lg text-blue-900">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medical Information */}
          {profileData.name ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-7 h-7 text-red-600" />
                <h3 className="text-2xl font-bold text-gray-900">Ваша медична інформація</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Ім'я</div>
                  <div className="font-bold text-gray-900">{profileData.name}</div>
                </div>

                {profileData.bloodType && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-red-600" />
                      Група крові
                    </div>
                    <div className="font-bold text-red-900">{profileData.bloodType}</div>
                  </div>
                )}
              </div>

              {(profileData.allergies || profileData.chronicDiseases || profileData.medications) && (
                <div className="space-y-3 mb-4">
                  {profileData.allergies && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded">
                      <div className="text-sm font-semibold text-red-900 mb-1">⚠️ Алергії</div>
                      <div className="text-red-800">{profileData.allergies}</div>
                    </div>
                  )}

                  {profileData.chronicDiseases && (
                    <div className="p-4 bg-amber-50 border-l-4 border-amber-600 rounded">
                      <div className="text-sm font-semibold text-amber-900 mb-1">Хронічні захворювання</div>
                      <div className="text-amber-800">{profileData.chronicDiseases}</div>
                    </div>
                  )}

                  {profileData.medications && (
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                      <div className="text-sm font-semibold text-blue-900 mb-1">💊 Ліки</div>
                      <div className="text-blue-800">{profileData.medications}</div>
                    </div>
                  )}
                </div>
              )}

              {profileData.emergencyName && (
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-5 h-5 text-green-700" />
                    <div className="text-sm font-semibold text-green-900">Екстрений контакт</div>
                  </div>
                  <div className="font-bold text-green-900">
                    {profileData.emergencyName} ({profileData.emergencyRelation})
                  </div>
                  <a
                    href={`tel:${profileData.emergencyPhone}`}
                    className="text-green-700 font-semibold hover:underline"
                  >
                    {profileData.emergencyPhone}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-6 h-6 text-blue-900" />
                <h3 className="text-xl font-bold text-blue-900">Заповніть профіль</h3>
              </div>
              <p className="text-blue-900 mb-4">
                Додайте медичну інформацію у вашому профілі, щоб отримувати персоналізовані рекомендації та швидку допомогу в надзвичайних ситуаціях.
              </p>
              <Link
                to="/profile"
                className="inline-block px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors"
              >
                Перейти до профілю
              </Link>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="tel:112"
              className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2 text-lg"
            >
              <Phone className="w-6 h-6" />
              🚨 Екстрений виклик
            </a>
            <button
              onClick={handleSave}
              className="px-6 py-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Зберегти
            </button>
            <button
              onClick={() => navigate("/data")}
              className="px-6 py-4 bg-white hover:bg-gray-50 text-blue-900 border-2 border-blue-900 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Спробувати ще раз
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
