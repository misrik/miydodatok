import { Link, useNavigate } from "react-router";
import { ShieldAlert, User, Mail, Phone, Droplet, Calendar, AlertCircle, Heart, LogOut, Edit2, Save, MapPin, Plus, Trash2, Baby, PawPrint } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../utils/supabase/client";

interface Location {
  hromada: string;
  rayon: string;
  region: string;
}

interface Child {
  id: string;
  name: string;
  birthDate: string;
  bloodType: string;
  allergies: string;
  medications: string;
  notes: string;
}

interface Pet {
  id: string;
  species: string;
  gender: string;
  birthYear: string;
  conditions: string;
  specialNeeds: string;
  notes: string;
}

interface Address {
  id: string;
  city: string;
  street: string;
  apartment: string;
  additional: string;
}

export function Profile() {
  const navigate = useNavigate();
  
  // Перевірка авторизації
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate("/login");
    }
  }, [navigate]);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Personal Info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [region, setRegion] = useState("");

  // Location fields (new system)
  const [hromada, setHromada] = useState("");
  const [rayon, setRayon] = useState("");
  const [oblast, setOblast] = useState("");
  
  // Locations data from endpoint
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState("");
  
  // Hromada autocomplete
  const [hromadaInput, setHromadaInput] = useState("");
  const [showHromadaSuggestions, setShowHromadaSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);

  // Children
  const [children, setChildren] = useState<Child[]>([]);

  // Pets
  const [pets, setPets] = useState<Pet[]>([]);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressCityInputs, setAddressCityInputs] = useState<Record<string, string>>({});
  const [addressCitySuggestions, setAddressCitySuggestions] = useState<Record<string, string[]>>({});
  const [showAddressCitySuggestions, setShowAddressCitySuggestions] = useState<Record<string, boolean>>({});

  // Region search
  const [regionInput, setRegionInput] = useState("");
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
  const [filteredRegions, setFilteredRegions] = useState<string[]>([]);

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Не вказано");
  const [emergencyRelationOther, setEmergencyRelationOther] = useState("");

  const relationOptions = [
    "Не вказано",
    "Дружина",
    "Чоловік",
    "Мама",
    "Тато",
    "Брат",
    "Сестра",
    "Син",
    "Дочка",
    "Друг/Подруга",
    "Інше"
  ];

  // Medical Info
  const [allergies, setAllergies] = useState("");
  const [chronicDiseases, setChronicDiseases] = useState("");
  const [medications, setMedications] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Functions for children
  const addChild = () => {
    const newChild: Child = {
      id: Date.now().toString(),
      name: "",
      birthDate: "",
      bloodType: "",
      allergies: "",
      medications: "",
      notes: ""
    };
    setChildren([...children, newChild]);
  };

  const removeChild = (id: string) => {
    setChildren(children.filter(child => child.id !== id));
  };

  const updateChild = (id: string, field: keyof Child, value: string) => {
    setChildren(children.map(child =>
      child.id === id ? { ...child, [field]: value } : child
    ));
  };

  // Functions for pets
  const addPet = () => {
    const newPet: Pet = {
      id: Date.now().toString(),
      species: "",
      gender: "Самець",
      birthYear: new Date().getFullYear().toString(),
      conditions: "",
      specialNeeds: "",
      notes: ""
    };
    setPets([...pets, newPet]);
  };

  const removePet = (id: string) => {
    setPets(pets.filter(pet => pet.id !== id));
  };

  const updatePet = (id: string, field: keyof Pet, value: string) => {
    setPets(pets.map(pet =>
      pet.id === id ? { ...pet, [field]: value } : pet
    ));
  };

  // Functions for addresses
  const addAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      city: "",
      street: "",
      apartment: "",
      additional: ""
    };
    setAddresses([...addresses, newAddress]);
    setAddressCityInputs(prev => ({ ...prev, [newAddress.id]: "" }));
  };

  const removeAddress = (id: string) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  const updateAddress = (id: string, field: keyof Address, value: string) => {
    setAddresses(addresses.map(address =>
      address.id === id ? { ...address, [field]: value } : address
    ));
  };

  // Function to search cities for address
  const searchCitiesForAddress = (addressId: string, searchTerm: string) => {
    if (searchTerm.length < 2) {
      setAddressCitySuggestions(prev => ({ ...prev, [addressId]: [] }));
      setShowAddressCitySuggestions(prev => ({ ...prev, [addressId]: false }));
      return;
    }

    // Локальний пошук в статичному списку
    const localMatches = ukrainianCities
      .filter(city => city.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(city => {
        // Додаємо назву області якщо це можливо визначити
        if (city === "Куликівка") return `${city}, Чернігівська область`;
        return city;
      });

    if (localMatches.length > 0) {
      setAddressCitySuggestions(prev => ({ ...prev, [addressId]: localMatches.slice(0, 15) }));
      setShowAddressCitySuggestions(prev => ({ ...prev, [addressId]: true }));
    } else {
      setAddressCitySuggestions(prev => ({ ...prev, [addressId]: [] }));
      setShowAddressCitySuggestions(prev => ({ ...prev, [addressId]: false }));
    }
  };

  const ukraineRegions = [
    "Київ",
    "Київська область",
    "Вінницька область",
    "Волинська область",
    "Дніпропетровська область",
    "Донецька область",
    "Житомирська область",
    "Закарпатська область",
    "Запорізька область",
    "Івано-Франківська область",
    "Кіровоградська область",
    "Луганська область",
    "Львівська область",
    "Миколаївська область",
    "Одеська область",
    "Полтавська область",
    "Рівненська область",
    "Сумська область",
    "Тернопільська область",
    "Харківська область",
    "Херсонська область",
    "Хмельницька область",
    "Черкаська область",
    "Чернівецька область",
    "Чернігівська область",
    "АР Крим"
  ];

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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleSave = async () => {
    const authToken = localStorage.getItem('authToken');

    // Зберегти область в localStorage для використання в Alert (backward compatibility)
    // Якщо є нові поля, використовуємо oblast, інакше старе поле region
    const regionToSave = oblast || region;
    localStorage.setItem("userRegion", regionToSave);

    // Підготовка даних профілю
    const profileData = {
      name,
      email,
      birthDate,
      bloodType,
      region: regionToSave, // For backward compatibility
      hromada,
      rayon,
      oblast,
      emergencyName,
      emergencyPhone,
      emergencyEmail,
      emergencyRelation: emergencyRelation === "Інше" ? emergencyRelationOther : emergencyRelation,
      allergies,
      chronicDiseases,
      medications,
      specialNeeds,
      children,
      pets,
      addresses
    };

    // Зберегти в localStorage для offline режиму
    localStorage.setItem("userProfile", JSON.stringify(profileData));

    // Якщо є токен, зберегти на бекенді
    if (authToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(profileData)
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Profile saved to backend:', data);
          setIsEditing(false);
          alert("Профіль збережено!");
        } else {
          const error = await response.json();
          console.error('Failed to save profile to backend:', error);
          alert("Профіль збережено локально, але не вдалося синхронізувати з сервером");
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Error saving profile to backend:', error);
        alert("Профіль збережено локально, але не вдалося синхронізувати з сервером");
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
      alert("Профіль збережено!");
    }
  };

  // Завантажити locations з endpoint
  useEffect(() => {
    const fetchLocations = async () => {
      setLocationsLoading(true);
      setLocationsError("");
      
      try {
        const response = await fetch('https://vysfpcckuddqcmfneoov.supabase.co/functions/v1/get-locations');
        
        if (response.ok) {
          const data = await response.json();
          if (data.locations && Array.isArray(data.locations)) {
            setLocations(data.locations);
          } else {
            setLocationsError("Не вдалося завантажити список громад. Спробуйте пізніше.");
          }
        } else {
          setLocationsError("Не вдалося завантажити список громад. Спробуйте пізніше.");
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocationsError("Не вдалося завантажити список громад. Спробуйте пізніше.");
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Завантажити дані профілю з бекенду при першому рендері
  useEffect(() => {
    const fetchProfile = async () => {
      const authToken = localStorage.getItem('authToken');

      // Спочатку перевіряємо localStorage для offline режиму
      const savedRegion = localStorage.getItem("userRegion");
      
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile.name) setName(profile.name);
        if (profile.email) setEmail(profile.email);
        if (profile.birthDate) setBirthDate(profile.birthDate || "");
        if (profile.bloodType) setBloodType(profile.bloodType);
        
        // Load new location fields if available
        if (profile.hromada) {
          setHromada(profile.hromada);
          setHromadaInput(profile.hromada);
        }
        if (profile.rayon) setRayon(profile.rayon);
        if (profile.oblast) setOblast(profile.oblast);
        
        // Load old region field for backward compatibility
        if (!profile.oblast && (profile.region || savedRegion)) {
          const oldRegion = profile.region || savedRegion || "";
          setRegion(oldRegion);
          setOblast(oldRegion);
        }
        
        if (profile.emergencyName) setEmergencyName(profile.emergencyName || "");
        if (profile.emergencyPhone) setEmergencyPhone(profile.emergencyPhone || "");
        if (profile.emergencyEmail) setEmergencyEmail(profile.emergencyEmail || "");
        if (profile.emergencyRelation) {
          if (relationOptions.includes(profile.emergencyRelation)) {
            setEmergencyRelation(profile.emergencyRelation);
          } else {
            setEmergencyRelation("Інше");
            setEmergencyRelationOther(profile.emergencyRelation);
          }
        }
        if (profile.allergies) setAllergies(profile.allergies || "");
        if (profile.chronicDiseases) setChronicDiseases(profile.chronicDiseases || "");
        if (profile.medications) setMedications(profile.medications || "");
        if (profile.specialNeeds) setSpecialNeeds(profile.specialNeeds || "");
        if (profile.children) setChildren(profile.children);
        if (profile.pets) setPets(profile.pets);
        if (profile.addresses) {
          setAddresses(profile.addresses);
          // Ініціалізуємо inputs для міст
          const cityInputs: Record<string, string> = {};
          profile.addresses.forEach((addr: Address) => {
            cityInputs[addr.id] = addr.city;
          });
          setAddressCityInputs(cityInputs);
        }
      } else if (savedRegion) {
        // If no profile but we have old savedRegion
        setRegion(savedRegion);
        setOblast(savedRegion);
      }

      // Якщо є токен, завантажуємо з бекенду
      if (authToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (response.ok) {
            const profile = await response.json();
            if (profile.name) setName(profile.name);
            if (profile.email) setEmail(profile.email);
            if (profile.birthDate) setBirthDate(profile.birthDate || "");
            if (profile.bloodType !== undefined) setBloodType(profile.bloodType || "");
            
            // Load new location fields if available
            if (profile.hromada) {
              setHromada(profile.hromada);
              setHromadaInput(profile.hromada);
            }
            if (profile.rayon) setRayon(profile.rayon);
            if (profile.oblast) setOblast(profile.oblast);
            
            // Load old region field for backward compatibility
            if (!profile.oblast && profile.region) {
              setRegion(profile.region || "");
              setOblast(profile.region || "");
            }
            
            if (profile.emergencyName) setEmergencyName(profile.emergencyName || "");
            if (profile.emergencyPhone) setEmergencyPhone(profile.emergencyPhone || "");
            if (profile.emergencyEmail) setEmergencyEmail(profile.emergencyEmail || "");
            if (profile.emergencyRelation) {
              if (relationOptions.includes(profile.emergencyRelation)) {
                setEmergencyRelation(profile.emergencyRelation);
              } else {
                setEmergencyRelation("Інше");
                setEmergencyRelationOther(profile.emergencyRelation);
              }
            }
            if (profile.allergies) setAllergies(profile.allergies || "");
            if (profile.chronicDiseases) setChronicDiseases(profile.chronicDiseases || "");
            if (profile.medications) setMedications(profile.medications || "");
            if (profile.specialNeeds) setSpecialNeeds(profile.specialNeeds || "");
            if (profile.children) setChildren(profile.children || []);
            if (profile.pets) setPets(profile.pets || []);
            if (profile.addresses) {
              setAddresses(profile.addresses || []);
              // Ініціалізуємо inputs для міст
              const cityInputs: Record<string, string> = {};
              profile.addresses.forEach((addr: Address) => {
                cityInputs[addr.id] = addr.city;
              });
              setAddressCityInputs(cityInputs);
            }

            // Зберігаємо також в localStorage для offline режиму
            localStorage.setItem("userProfile", JSON.stringify(profile));
            const regionToSave = profile.oblast || profile.region || "";
            if (regionToSave) {
              localStorage.setItem("userRegion", regionToSave);
            }
          } else {
            console.error('Failed to fetch profile from backend:', response.status);
          }
        } catch (error) {
          console.error('Error fetching profile from backend:', error);
        }
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (regionInput.length > 0) {
      const filtered = ukraineRegions.filter(r =>
        r.toLowerCase().includes(regionInput.toLowerCase())
      );
      setFilteredRegions(filtered);
    } else {
      setFilteredRegions([]);
    }
  }, [regionInput]);

  // Filter locations based on hromadaInput
  useEffect(() => {
    if (hromadaInput.length >= 2) {
      const query = hromadaInput.toLowerCase();
      
      // Function to determine priority of a location relative to query
      const getPriority = (loc: Location): number => {
        const hromadaLower = loc.hromada.toLowerCase();
        const rayonLower = loc.rayon.toLowerCase();
        const regionLower = loc.region.toLowerCase();
        const isCityHromada = hromadaLower.includes("міська громада");
        
        // 0 — hromada точно дорівнює query
        if (hromadaLower === query) return 0;
        
        // 1 — hromada починається з query і містить "міська громада"
        if (hromadaLower.startsWith(query) && isCityHromada) return 1;
        
        // 2 — hromada починається з query
        if (hromadaLower.startsWith(query)) return 2;
        
        // 3 — hromada містить query і містить "міська громада"
        if (hromadaLower.includes(query) && isCityHromada) return 3;
        
        // 4 — hromada містить query
        if (hromadaLower.includes(query)) return 4;
        
        // 5 — rayon починається з query
        if (rayonLower.startsWith(query)) return 5;
        
        // 6 — rayon містить query
        if (rayonLower.includes(query)) return 6;
        
        // 7 — region починається з query
        if (regionLower.startsWith(query)) return 7;
        
        // 8 — region містить query
        if (regionLower.includes(query)) return 8;
        
        // Doesn't match
        return 9999;
      };
      
      // Filter and sort by relevance
      const matchedLocations = locations
        .map(loc => ({ loc, priority: getPriority(loc) }))
        .filter(item => item.priority < 9999)
        .sort((a, b) => {
          // Sort by priority first
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          // Within same priority, sort alphabetically by hromada
          return a.loc.hromada.localeCompare(b.loc.hromada, 'uk');
        })
        .slice(0, 10) // Maximum 10 suggestions
        .map(item => item.loc);
      
      console.log("Suggestions for query", query, matchedLocations.map(s => s.hromada));
      
      setFilteredLocations(matchedLocations);
    } else {
      setFilteredLocations([]);
    }
  }, [hromadaInput, locations]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-blue-900" />
            <h1 className="text-2xl font-bold text-blue-900">SafeWay</h1>
          </Link>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-6 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Вийти
            </button>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 text-blue-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Увійти
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="sticky top-0 z-30 bg-gray-50 pb-4 mb-4">
            <div className="flex items-center justify-between pt-4">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Профіль</h2>
                <p className="text-gray-600">Особиста та медична інформація</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Edit2 className="w-5 h-5" />
                  Редагувати
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  Зберегти
                </button>
              )}
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-6 h-6 text-blue-900" />
              <h3 className="text-2xl font-bold text-gray-900">Особиста інформація</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Повне ім'я</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                ) : (
                  <div className={`p-3 bg-gray-50 rounded-lg font-semibold ${!name ? 'text-gray-500' : ''}`}>{name || "Не вказано"}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                ) : (
                  <div className={`p-3 bg-gray-50 rounded-lg font-semibold ${!email ? 'text-gray-500' : ''}`}>{email || "Не вказано"}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Дата народження</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  ) : (
                    <div className={`p-3 bg-gray-50 rounded-lg font-semibold flex items-center gap-2 ${!birthDate ? 'text-gray-500' : ''}`}>
                      <Calendar className="w-5 h-5 text-gray-600" />
                      {birthDate ? new Date(birthDate).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Не вказано'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Група крові</label>
                  {isEditing ? (
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                    >
                      <option value="">Не вказано</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <div className={`p-3 rounded-lg font-bold flex items-center gap-2 ${bloodType ? 'bg-red-50 text-red-900' : 'bg-gray-50 text-gray-500'}`}>
                      <Droplet className="w-5 h-5" />
                      {bloodType || "Не вказано"}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Громада</label>
                  {isEditing ? (
                    <div className="relative">
                      {locationsError ? (
                        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-sm">
                          {locationsError}
                        </div>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={hromadaInput}
                            onChange={(e) => {
                              setHromadaInput(e.target.value);
                              if (e.target.value.length < 2) {
                                setHromada("");
                                setRayon("");
                                setOblast("");
                              }
                              setShowHromadaSuggestions(true);
                            }}
                            onFocus={() => {
                              if (hromadaInput.length >= 2 && filteredLocations.length > 0) {
                                setShowHromadaSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setShowHromadaSuggestions(false), 200);
                            }}
                            placeholder="Почніть вводити назву громади (мінімум 2 символи)..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                            disabled={locationsLoading}
                          />
                          {locationsLoading && (
                            <div className="absolute right-3 top-3 text-gray-400">
                              Завантаження...
                            </div>
                          )}
                          {showHromadaSuggestions && filteredLocations.length > 0 && hromadaInput.length >= 2 && (
                            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-blue-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                              <div className="sticky top-0 p-2 bg-blue-50 border-b border-blue-200 text-sm font-medium text-blue-900">
                                Знайдено: {filteredLocations.length}
                              </div>
                              {filteredLocations.map((loc, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setHromada(loc.hromada);
                                    setHromadaInput(loc.hromada);
                                    setRayon(loc.rayon);
                                    setOblast(loc.region);
                                    setShowHromadaSuggestions(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{loc.hromada}</div>
                                  <div className="text-sm text-gray-600">
                                    {loc.rayon}, {loc.region}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg font-semibold flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      {hromada || oblast || region || "Не вказано"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Район</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={rayon}
                      readOnly
                      placeholder="Автоматично заповнюється після вибору громади"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg font-semibold">
                      {rayon || "Не вказано"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Область</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={oblast}
                      readOnly
                      placeholder="Автоматично заповнюється після вибору громади"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg font-semibold">
                      {oblast || region || "Не вказано"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-6 h-6 text-red-600" />
              <h3 className="text-2xl font-bold text-gray-900">Екстрений контакт</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ім'я контакту</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                ) : (
                  <div className={`p-3 bg-gray-50 rounded-lg font-semibold ${!emergencyName ? 'text-gray-500' : ''}`}>{emergencyName || "Не вказано"}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={emergencyEmail}
                    onChange={(e) => setEmergencyEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                ) : (
                  <div className={`p-3 bg-gray-50 rounded-lg font-semibold ${!emergencyEmail ? 'text-gray-500' : ''}`}>{emergencyEmail || "Не вказано"}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  ) : (
                    emergencyPhone ? (
                      <a href={`tel:${emergencyPhone}`} className="block p-3 bg-gray-50 rounded-lg font-semibold hover:bg-gray-100">
                        {emergencyPhone}
                      </a>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg font-semibold text-gray-500">Не вказано</div>
                    )
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ким доводиться</label>
                  {isEditing ? (
                    <select
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                    >
                      {relationOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg font-semibold">
                      {emergencyRelation === "Інше" && emergencyRelationOther ? emergencyRelationOther : emergencyRelation}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && emergencyRelation === "Інше" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Вкажіть ким доводиться</label>
                  <input
                    type="text"
                    value={emergencyRelationOther}
                    onChange={(e) => setEmergencyRelationOther(e.target.value)}
                    placeholder="Наприклад: двоюрідний брат"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Medical Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-red-600" />
              <h3 className="text-2xl font-bold text-gray-900">Медична інформація</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Алергії
                </label>
                {isEditing ? (
                  <textarea
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    rows={2}
                    placeholder="Вкажіть алергії або залиште порожнім"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                ) : (
                  <div className={`p-3 rounded-lg ${allergies ? 'bg-red-50 text-red-900 font-semibold' : 'bg-gray-50 text-gray-500'}`}>
                    {allergies || "Не вказано"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Хронічні захворювання
                </label>
                {isEditing ? (
                  <textarea
                    value={chronicDiseases}
                    onChange={(e) => setChronicDiseases(e.target.value)}
                    rows={2}
                    placeholder="Вкажіть хронічні захворювання"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                ) : (
                  <div className={`p-3 rounded-lg ${chronicDiseases ? 'bg-amber-50 text-amber-900 font-semibold' : 'bg-gray-50 text-gray-500'}`}>
                    {chronicDiseases || "Не вказано"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ліки, що приймаєте постійно
                </label>
                {isEditing ? (
                  <textarea
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    rows={2}
                    placeholder="Вкажіть назви та дозування ліків"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                ) : (
                  <div className={`p-3 rounded-lg ${medications ? 'bg-blue-50 text-blue-900 font-semibold' : 'bg-gray-50 text-gray-500'}`}>
                    {medications || "Не вказано"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Особливі потреби / Інше
                </label>
                {isEditing ? (
                  <textarea
                    value={specialNeeds}
                    onChange={(e) => setSpecialNeeds(e.target.value)}
                    rows={2}
                    placeholder="Інша важлива медична інформація"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-500">
                    {specialNeeds || "Не вказано"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Children */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Baby className="w-6 h-6 text-blue-900" />
                <h3 className="text-2xl font-bold text-gray-900">Діти</h3>
              </div>
              {isEditing && (
                <button
                  onClick={addChild}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Додати дитину
                </button>
              )}
            </div>

            {children.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                Діти не додані
              </div>
            ) : (
              <div className="space-y-4">
                {children.map((child, index) => (
                  <div key={child.id} className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-blue-900">Дитина {index + 1}</h4>
                      {isEditing && (
                        <button
                          onClick={() => removeChild(child.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Повне ім'я</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={child.name}
                            onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                          />
                        ) : (
                          <div className="p-2 bg-white rounded font-semibold">{child.name || "Не вказано"}</div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Дата народження</label>
                          {isEditing ? (
                            <input
                              type="date"
                              value={child.birthDate}
                              onChange={(e) => updateChild(child.id, 'birthDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                            />
                          ) : (
                            <div className="p-2 bg-white rounded">{child.birthDate || "Не вказано"}</div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Група крові</label>
                          {isEditing ? (
                            <select
                              value={child.bloodType}
                              onChange={(e) => updateChild(child.id, 'bloodType', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                            >
                              <option value="">Не вказано</option>
                              {bloodTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          ) : (
                            <div className={`p-2 rounded font-bold ${child.bloodType ? 'bg-red-50 text-red-900' : 'bg-white text-gray-500'}`}>{child.bloodType || "Не вказано"}</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Алергії</label>
                        {isEditing ? (
                          <textarea
                            value={child.allergies}
                            onChange={(e) => updateChild(child.id, 'allergies', e.target.value)}
                            rows={2}
                            placeholder="Вкажіть алергії"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                          />
                        ) : (
                          <div className={`p-2 rounded ${child.allergies ? 'bg-red-50 text-red-900' : 'bg-white text-gray-500'}`}>
                            {child.allergies || "Не вказано"}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ліки</label>
                        {isEditing ? (
                          <textarea
                            value={child.medications}
                            onChange={(e) => updateChild(child.id, 'medications', e.target.value)}
                            rows={2}
                            placeholder="Вкажіть ліки"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                          />
                        ) : (
                          <div className={`p-2 rounded ${child.medications ? 'bg-blue-50 text-blue-900' : 'bg-white text-gray-500'}`}>
                            {child.medications || "Не вказано"}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Додаткова інформація</label>
                        {isEditing ? (
                          <textarea
                            value={child.notes}
                            onChange={(e) => updateChild(child.id, 'notes', e.target.value)}
                            rows={2}
                            placeholder="Додаткова інформація"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                          />
                        ) : (
                          <div className="p-2 bg-white rounded text-gray-700">{child.notes || "Не вказано"}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pets */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PawPrint className="w-6 h-6 text-blue-900" />
                <h3 className="text-2xl font-bold text-gray-900">Тварини</h3>
              </div>
              {isEditing && (
                <button
                  onClick={addPet}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Додати тварину
                </button>
              )}
            </div>

            {pets.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                Тварини не додані
              </div>
            ) : (
              <div className="space-y-4">
                {pets.map((pet, index) => (
                  <div key={pet.id} className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-green-900">Тварина {index + 1}</h4>
                      {isEditing && (
                        <button
                          onClick={() => removePet(pet.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Вид тварини</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={pet.species}
                              onChange={(e) => updatePet(pet.id, 'species', e.target.value)}
                              placeholder="Наприклад: собака, кіт"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                            />
                          ) : (
                            <div className="p-2 bg-white rounded font-semibold">{pet.species || "Не вказано"}</div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Стать</label>
                          {isEditing ? (
                            <select
                              value={pet.gender}
                              onChange={(e) => updatePet(pet.id, 'gender', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                            >
                              <option value="Самець">Самець</option>
                              <option value="Самка">Самка</option>
                            </select>
                          ) : (
                            <div className="p-2 bg-white rounded">{pet.gender}</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Рік народження</label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={pet.birthYear}
                            onChange={(e) => updatePet(pet.id, 'birthYear', e.target.value)}
                            min="1990"
                            max={new Date().getFullYear()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                          />
                        ) : (
                          <div className="p-2 bg-white rounded">{pet.birthYear}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Хвороби</label>
                        {isEditing ? (
                          <textarea
                            value={pet.conditions}
                            onChange={(e) => updatePet(pet.id, 'conditions', e.target.value)}
                            rows={2}
                            placeholder="Вкажіть хвороби"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                          />
                        ) : (
                          <div className={`p-2 rounded ${pet.conditions ? 'bg-amber-50 text-amber-900' : 'bg-white text-gray-500'}`}>
                            {pet.conditions || "Не вказано"}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Особливості, що потребують уваги</label>
                        {isEditing ? (
                          <textarea
                            value={pet.specialNeeds}
                            onChange={(e) => updatePet(pet.id, 'specialNeeds', e.target.value)}
                            rows={2}
                            placeholder="Особливості"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                          />
                        ) : (
                          <div className={`p-2 rounded ${pet.specialNeeds ? 'bg-blue-50 text-blue-900' : 'bg-white text-gray-500'}`}>
                            {pet.specialNeeds || "Не вказано"}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Додаткова інформація</label>
                        {isEditing ? (
                          <textarea
                            value={pet.notes}
                            onChange={(e) => updatePet(pet.id, 'notes', e.target.value)}
                            rows={2}
                            placeholder="Додаткова інформація"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                          />
                        ) : (
                          <div className="p-2 bg-white rounded text-gray-700">{pet.notes || "Не вказано"}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-900" />
                <h3 className="text-2xl font-bold text-gray-900">Адреси</h3>
              </div>
              {isEditing && (
                <button
                  onClick={addAddress}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Додати адресу
                </button>
              )}
            </div>

            {addresses.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                Адреси не додані
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address, index) => (
                  <div key={address.id} className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-purple-900">Адреса {index + 1}</h4>
                      {isEditing && (
                        <button
                          onClick={() => removeAddress(address.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Населений пункт</label>
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={addressCityInputs[address.id] !== undefined ? addressCityInputs[address.id] : address.city}
                              onChange={(e) => {
                                const value = e.target.value;
                                setAddressCityInputs(prev => ({ ...prev, [address.id]: value }));
                                updateAddress(address.id, 'city', value);
                                searchCitiesForAddress(address.id, value);
                              }}
                              onFocus={() => {
                                const input = addressCityInputs[address.id] || address.city;
                                if (input && input.length >= 2 && addressCitySuggestions[address.id]?.length > 0) {
                                  setShowAddressCitySuggestions(prev => ({ ...prev, [address.id]: true }));
                                }
                              }}
                              onBlur={() => {
                                setTimeout(() => {
                                  setShowAddressCitySuggestions(prev => ({ ...prev, [address.id]: false }));
                                }, 200);
                              }}
                              placeholder="Наприклад: Київ, Куликівка"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                            />
                            {showAddressCitySuggestions[address.id] && addressCitySuggestions[address.id]?.length > 0 && (
                              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-purple-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <div className="sticky top-0 p-2 bg-purple-50 border-b border-purple-200 text-sm font-medium text-purple-900">
                                  Знайдено: {addressCitySuggestions[address.id].length}
                                </div>
                                {addressCitySuggestions[address.id].map((cityName, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      updateAddress(address.id, 'city', cityName);
                                      setAddressCityInputs(prev => ({ ...prev, [address.id]: cityName }));
                                      setShowAddressCitySuggestions(prev => ({ ...prev, [address.id]: false }));
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                                  >
                                    {cityName}
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="p-2 bg-white rounded font-semibold">{address.city || "Не вказано"}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Вулиця</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={address.street}
                            onChange={(e) => updateAddress(address.id, 'street', e.target.value)}
                            placeholder="Наприклад: вул. Хрещатик, 1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                          />
                        ) : (
                          <div className="p-2 bg-white rounded font-semibold">{address.street || "Не вказано"}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Квартира</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={address.apartment}
                            onChange={(e) => updateAddress(address.id, 'apartment', e.target.value)}
                            placeholder="Наприклад: кв. 42"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                          />
                        ) : (
                          <div className="p-2 bg-white rounded">{address.apartment || "Не вказано"}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Додаткова інформація</label>
                        {isEditing ? (
                          <textarea
                            value={address.additional}
                            onChange={(e) => updateAddress(address.id, 'additional', e.target.value)}
                            rows={2}
                            placeholder="Будь-яка додаткова інформація про адресу"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                          />
                        ) : (
                          <div className="p-2 bg-white rounded text-gray-700">{address.additional || "Не вказано"}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-900 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-blue-900 mb-2">Важлива інформація</h4>
                <p className="text-blue-900 text-sm">
                  Ця інформація може бути критично важливою у випадку надзвичайної ситуації.
                  Переконайтесь, що вона актуальна та правильна.
                </p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Вийти
          </button>
        </div>
      </main>
    </div>
  );
}