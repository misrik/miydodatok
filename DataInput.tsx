import { Link, useNavigate, useLocation } from "react-router";
import { ShieldAlert, User, Cloud, Factory, Siren, Flame, Droplets, Mountain, Wind, CloudSnow, Sun, Skull, Car, Building, Bomb, Radiation, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface City {
  name: string;
  country: string;
  displayName: string;
}

export function DataInput() {
  const navigate = useNavigate();
  const locationState = useLocation();
  const [threat, setThreat] = useState("");
  const [location, setLocation] = useState("");
  const [hasChildren, setHasChildren] = useState(false);
  const [hasPets, setHasPets] = useState(false);
  const [hasHealthIssues, setHasHealthIssues] = useState(false);
  const [hasTransport, setHasTransport] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const ukrainianCities = [
    "Київ", "Харків", "Одеса", "Дніпро", "Донецьк", "Запоріжжя", "Львів", "Кривий Ріг",
    "Миколаїв", "Маріуполь", "Луганськ", "Вінниця", "Макіївка", "Сімферополь", "Херсон",
    "Полтава", "Чернігів", "Черкаси", "Суми", "Житомир", "Хмельницький", "Чернівці",
    "Горлівка", "Рівне", "Кам'янське", "Кропивницький", "Івано-Франківськ", "Кременчук",
    "Тернопіль", "Луцьк", "Біла Церква", "Краматорськ", "Мелітополь", "Керч", "Нікополь",
    "Ужгород", "Бердянськ", "Слов'янськ", "Алчевськ", "Павлоград", "Сєвєродонецьк",
    "Євпаторія", "Лисичанськ", "Кам'янець-Подільський", "Бровари", "Дрогобич", "Коломия",
    "Ялта", "Ковель", "Умань", "Мукачево", "Конотоп", "Бориспіль", "Бучач", "Буча",
    "Ірпінь", "Фастів", "Шостка", "Коростень", "Прилуки", "Нововолинськ", "Куликівка"
  ];

  useEffect(() => {
    if (locationState.state?.threat) {
      setThreat(locationState.state.threat);
    }
  }, [locationState.state]);

  useEffect(() => {
    const searchCities = () => {
      if (location.length < 2) {
        setCitySuggestions([]);
        setShowCitySuggestions(false);
        return;
      }

      setIsLoadingCities(true);

      // Локальний пошук в статичному списку українських міст
      const localMatches = ukrainianCities
        .filter(city => city.toLowerCase().includes(location.toLowerCase()))
        .map(city => ({
          name: city,
          country: 'Україна',
          displayName: `${city}, Україна`
        }))
        .slice(0, 10);

      setCitySuggestions(localMatches);
      setShowCitySuggestions(localMatches.length > 0);
      setIsLoadingCities(false);
    };

    const timeoutId = setTimeout(searchCities, 300);
    return () => clearTimeout(timeoutId);
  }, [location]);

  const categories = [
    { id: "natural", name: "Природні катастрофи", icon: Cloud, color: "bg-blue-50 border-blue-300 hover:bg-blue-100", iconColor: "text-blue-600" },
    { id: "technological", name: "Техногенні катастрофи", icon: Factory, color: "bg-orange-50 border-orange-300 hover:bg-orange-100", iconColor: "text-orange-600" },
    { id: "military", name: "Воєнна категорія", icon: Siren, color: "bg-red-50 border-red-300 hover:bg-red-100", iconColor: "text-red-600" },
  ];

  const threatNames: Record<string, { name: string; icon: any }> = {
    flood: { name: "Повінь", icon: Droplets },
    earthquake: { name: "Землетрус", icon: Mountain },
    hurricane: { name: "Ураган / шторм", icon: Wind },
    wildfire: { name: "Лісова пожежа", icon: Flame },
    landslide: { name: "Зсув ґрунту", icon: Mountain },
    snow: { name: "Сильний сніг / ожеледиця", icon: CloudSnow },
    heatwave: { name: "Посуха / спека", icon: Sun },
    fire: { name: "Пожежа в будівлі", icon: Flame },
    explosion: { name: "Вибух", icon: Bomb },
    chemical: { name: "Хімічна аварія", icon: Skull },
    radiation: { name: "Радіаційна аварія", icon: Radiation },
    transport: { name: "Аварія на транспорті", icon: Car },
    collapse: { name: "Обвал будівлі", icon: Building },
    shelling: { name: "Обстріл", icon: Bomb },
    "air-raid": { name: "Повітряна тривога", icon: Siren },
    blast: { name: "Вибух", icon: AlertTriangle },
    mine: { name: "Мінна небезпека", icon: AlertTriangle },
    evacuation: { name: "Укриття / евакуація", icon: ShieldAlert }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!threat) return;
    navigate("/result", { state: { threat, location, hasChildren, hasPets, hasHealthIssues, hasTransport } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-blue-900" />
            <h1 className="text-2xl font-bold text-blue-900">SafeWay</h1>
          </Link>
          <Link to="/login" className="px-6 py-2 text-blue-900 hover:bg-gray-100 rounded-lg transition-colors">
            Увійти
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Інструкції</h2>
            <p className="text-xl text-gray-600">
              Оберіть тип надзвичайної ситуації для перегляду детальних інструкцій
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {instructions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={`/category-selection`}
                  className={`${item.color} p-6 rounded-2xl border-2 transition-all shadow-lg text-left group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="w-12 h-12" />
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
                  <p className="text-base opacity-80">{item.description}</p>
                </Link>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Загальні рекомендації</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-900 mt-1">•</span>
                <span>Зберігайте спокій та не панікуйте</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-900 mt-1">•</span>
                <span>Слухайте офіційні джерела інформації</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-900 mt-1">•</span>
                <span>Завжди майте тривожну валізу напоготові</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-900 mt-1">•</span>
                <span>Знайте шляхи евакуації зі свого будинку</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-900 mt-1">•</span>
                <span>Тримайте телефон завжди зарядженим</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
