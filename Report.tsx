import { Link, useNavigate } from "react-router";
import { ShieldAlert, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

interface Address {
  id: string;
  city: string;
  street: string;
  apartment: string;
  additional: string;
}

export function Report() {
  const navigate = useNavigate();
  
  // Перевірка авторизації
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate("/login");
    }
  }, [navigate]);

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [details, setDetails] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [numberOfChildren, setNumberOfChildren] = useState("");
  const [numberOfPets, setNumberOfPets] = useState("");
  const [needsHelp, setNeedsHelp] = useState(false);
  const [disasterType, setDisasterType] = useState("");
  const [specificDisaster, setSpecificDisaster] = useState("");
  const [otherDisaster, setOtherDisaster] = useState("");
  const [helpTypes, setHelpTypes] = useState<string[]>([]);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Load saved addresses from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      if (profile.addresses) {
        setSavedAddresses(profile.addresses);
      }
    }
  }, []);

  // Handle saved address selection
  const handleSavedAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setCountry("Україна"); // Припускаємо що збережені адреси в Україні
      setCity(selectedAddress.city);
      setCityInput(selectedAddress.city);
      setStreet(selectedAddress.street);
      setDetails(selectedAddress.apartment + (selectedAddress.additional ? `, ${selectedAddress.additional}` : ""));
    }
  };

  const countries = [
    "Україна", "США", "Великобританія", "Німеччина", "Франція", "Італія",
    "Іспанія", "Польща", "Канада", "Австралія", "Японія", "Китай", "Індія",
    "Бразилія", "Мексика", "Аргентина", "Туреччина", "Греція", "Нідерланди"
  ];

  // Статичний список українських міст для кращого пошуку
  const ukrainianCities = [
    "Київ", "Харків", "Одеса", "Дніпро", "Донецьк", "Запоріжжя", "Львів", "Кривий Ріг",
    "Миколаїв", "Маріуполь", "Луганськ", "Вінниця", "Макіївка", "Сімферополь", "Херсон",
    "Полтава", "Чернігів", "Черкаси", "Суми", "Житомир", "Хмельницький", "Чернівці",
    "Горлівка", "Рівне", "Кам'янське", "Кропивницький", "Івано-Франківськ", "Кременчук",
    "Тернопіль", "Луцьк", "Біла Церква", "Краматорськ", "Мелітополь", "Керч", "Нікополь",
    "Ужгород", "Бердянськ", "Слов'янськ", "Алчевськ", "Павлоград", "Сєвєродонецьк",
    "Євпаторія", "Лисичанськ", "Кам'янець-Подільський", "Бровари", "Дрогобич", "Коломия",
    "Ялта", "Ковель", "Умань", "Мукачево", "Конотоп", "Бориспіль", "Бучач", "Буча",
    "Ірпінь", "Фастів", "Шостка", "Коростень", "Чернівці", "Прилуки", "Нововолинськ"
  ];

  const disasterTypes = [
    { value: "natural", label: "Природна катастрофа" },
    { value: "technological", label: "Техногенна катастрофа" },
    { value: "military", label: "Воєнна загроза" },
    { value: "medical", label: "Медична надзвичайна ситуація" }
  ];

  const specificDisasters: Record<string, string[]> = {
    natural: ["Повінь", "Землетрус", "Ураган / шторм", "Лісова пожежа", "Зсув ґрунту", "Сильний сніг / ожеледиця", "Посуха / спека"],
    technological: ["Пожежа в будівлі", "Вибух", "Хімічна аварія", "Радіаційна аварія", "Аварія на транспорті", "Обвал будівлі"],
    military: ["Обстріл", "Повітряна тривога", "Вибух", "Мінна небезпека", "Укриття / евакуація"],
    medical: ["Спалах інфекційного захворювання", "Масове отруєння", "Епідемія", "Пандемія"]
  };

  const helpTypeOptions = [
    { value: "medical", label: "Медична допомога" },
    { value: "psychological", label: "Психологічна допомога" },
    { value: "evacuation", label: "Допомога з евакуацією" },
    { value: "shelter", label: "Потрібне укриття" },
    { value: "food", label: "Харчування та вода" },
    { value: "mobility", label: "У разі неможливості самостійно пересуватися" },
    { value: "other", label: "Інше" }
  ];

  useEffect(() => {
    const searchCities = () => {
      if (cityInput.length < 2) {
        setCitySuggestions([]);
        setShowCitySuggestions(false);
        return;
      }

      setIsLoadingCities(true);

      // Локальний пошук в статичному списку
      let allCities: string[] = [];

      if (country === "Україна") {
        const localMatches = ukrainianCities
          .filter(city => city.toLowerCase().includes(cityInput.toLowerCase()))
          .map(city => `${city}, Україна`);
        allCities = [...localMatches];
      }

      setCitySuggestions(allCities.slice(0, 15));
      setShowCitySuggestions(allCities.length > 0);
      setIsLoadingCities(false);
    };

    const timeoutId = setTimeout(searchCities, 400);
    return () => clearTimeout(timeoutId);
  }, [cityInput, country]);

  // Допоміжна функція для отримання коду країни
  const getCountryCode = (countryName: string): string => {
    const countryCodes: Record<string, string> = {
      'Україна': 'ua',
      'США': 'us',
      'Великобританія': 'gb',
      'Німеччина': 'de',
      'Франція': 'fr',
      'Італія': 'it',
      'Іспанія': 'es',
      'Польща': 'pl',
      'Канада': 'ca',
      'Австралія': 'au',
      'Японія': 'jp',
      'Китай': 'cn',
      'Індія': 'in',
      'Бразилія': 'br',
      'Мексика': 'mx',
      'Аргентина': 'ar',
      'Туреччина': 'tr',
      'Греція': 'gr',
      'Нідерланди': 'nl'
    };
    return countryCodes[countryName] || '';
  };

  const toggleHelpType = (type: string) => {
    setHelpTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalDisaster = specificDisaster === "other" ? otherDisaster : specificDisaster;

    // Дозволяємо використовувати введене місто, навіть якщо воно не обране зі списку
    const finalCity = city || cityInput;

    const reportData = {
      country,
      city: finalCity,
      street,
      details,
      numberOfPeople,
      numberOfChildren,
      numberOfPets,
      needsHelp,
      disasterType,
      specificDisaster: finalDisaster,
      helpTypes
    };

    navigate("/email-confirm", { state: reportData });
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Повідомити про небезпеку</h2>
            <p className="text-gray-600">Заповніть форму для отримання допомоги</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Disaster Type */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Тип катастрофи</h3>
              <div className="space-y-4">
                <div className="relative">
                  <select
                    value={disasterType}
                    onChange={(e) => {
                      setDisasterType(e.target.value);
                      setSpecificDisaster("");
                      setOtherDisaster("");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all appearance-none bg-white"
                    required
                  >
                    <option value="">Оберіть категорію</option>
                    {disasterTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                {disasterType && specificDisasters[disasterType] && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Конкретний тип
                    </label>
                    <div className="space-y-2">
                      {specificDisasters[disasterType].map((disaster, idx) => (
                        <label
                          key={idx}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                            specificDisaster === disaster
                              ? "bg-blue-50 border-blue-300"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="specificDisaster"
                            value={disaster}
                            checked={specificDisaster === disaster}
                            onChange={(e) => {
                              setSpecificDisaster(e.target.value);
                              setOtherDisaster("");
                            }}
                            className="w-4 h-4 text-blue-900"
                            required
                          />
                          <span className="text-gray-900">{disaster}</span>
                        </label>
                      ))}
                      <label
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          specificDisaster === "other"
                            ? "bg-blue-50 border-blue-300"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="specificDisaster"
                          value="other"
                          checked={specificDisaster === "other"}
                          onChange={(e) => setSpecificDisaster(e.target.value)}
                          className="w-4 h-4 text-blue-900"
                        />
                        <span className="text-gray-900 font-medium">Інше</span>
                      </label>
                    </div>

                    {specificDisaster === "other" && (
                      <input
                        type="text"
                        value={otherDisaster}
                        onChange={(e) => setOtherDisaster(e.target.value)}
                        placeholder="Вкажіть тип катастрофи"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all mt-3"
                        required
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Адреса</h3>

              {/* Saved Address Checkbox */}
              {savedAddresses.length > 0 && (
                <div className="mb-4">
                  <label className="flex items-center gap-3 p-3 border-2 border-purple-300 bg-purple-50 rounded-lg cursor-pointer transition-colors hover:bg-purple-100">
                    <input
                      type="checkbox"
                      checked={useSavedAddress}
                      onChange={(e) => {
                        setUseSavedAddress(e.target.checked);
                        if (!e.target.checked) {
                          setSelectedAddressId("");
                          setCountry("");
                          setCity("");
                          setCityInput("");
                          setStreet("");
                          setDetails("");
                        }
                      }}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                    />
                    <span className="font-semibold text-purple-900">Використати збережену адресу</span>
                  </label>

                  {useSavedAddress && (
                    <div className="mt-3 relative">
                      <select
                        value={selectedAddressId}
                        onChange={(e) => handleSavedAddressChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all appearance-none bg-white"
                        required={useSavedAddress}
                      >
                        <option value="">Оберіть адресу</option>
                        {savedAddresses.map((address, index) => (
                          <option key={address.id} value={address.id}>
                            Адреса {index + 1}: {address.city}, {address.street}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {/* Country */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Країна
                  </label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setCity("");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all appearance-none bg-white"
                    required
                  >
                    <option value="">Оберіть країну</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-11 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                {/* City */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Місто <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={city || cityInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCityInput(value);
                      setCity("");
                      if (value.length >= 2) {
                        setShowCitySuggestions(true);
                      }
                    }}
                    onFocus={() => {
                      if (cityInput.length >= 2 && citySuggestions.length > 0 && !city) {
                        setShowCitySuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Затримка щоб встигнути натиснути на елемент списку
                      setTimeout(() => setShowCitySuggestions(false), 200);
                    }}
                    placeholder="Введіть назву міста..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                    required
                  />
                  {isLoadingCities && (
                    <div className="absolute right-4 top-11">
                      <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {showCitySuggestions && citySuggestions.length > 0 && !city && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-blue-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                      <div className="sticky top-0 p-3 bg-blue-50 border-b border-blue-200 text-sm font-medium text-blue-900">
                        Знайдено: {citySuggestions.length}
                      </div>
                      {citySuggestions.map((cityName, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCity(cityName);
                            setCityInput(cityName);
                            setShowCitySuggestions(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 focus:bg-blue-100"
                        >
                          {cityName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Street */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Вулиця
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Назва вулиці"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Деталі адреси
                  </label>
                  <input
                    type="text"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Будинок, квартира, поверх тощо"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Додаткова інформація</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Кількість людей
                  </label>
                  <input
                    type="number"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Кількість дітей
                  </label>
                  <input
                    type="number"
                    value={numberOfChildren}
                    onChange={(e) => setNumberOfChildren(e.target.value)}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Кількість тварин
                  </label>
                  <input
                    type="number"
                    value={numberOfPets}
                    onChange={(e) => setNumberOfPets(e.target.value)}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border-2 border-red-300 bg-red-50 rounded-lg cursor-pointer transition-colors hover:bg-red-100">
                    <input
                      type="checkbox"
                      checked={needsHelp}
                      onChange={(e) => {
                        setNeedsHelp(e.target.checked);
                        if (!e.target.checked) setHelpTypes([]);
                      }}
                      className="w-6 h-6 text-red-600 border-gray-300 rounded focus:ring-red-600"
                    />
                    <span className="font-semibold text-red-900 text-lg">Потрібна допомога</span>
                  </label>

                  {needsHelp && (
                    <div className="pl-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Тип необхідної допомоги:</p>
                      {helpTypeOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={helpTypes.includes(option.value)}
                            onChange={() => toggleHelpType(option.value)}
                            className="w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
                          />
                          <span className="text-gray-900">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg text-lg"
            >
              Повідомити про небезпеку
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}