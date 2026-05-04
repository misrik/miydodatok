import { Link, useNavigate } from "react-router";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  MapPin,
  RefreshCw,
  Clock,
  LogOut,
  Edit2,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { DetailedUkraineMap } from "./DetailedUkraineMap";
import { publicAnonKey } from "/utils/supabase/info";

interface AlertData {
  id: string;
  locationTitle: string;
  activeAlerts: string[];
  districts?: { name: string; alert: boolean }[];
}

interface Location {
  hromada: string;
  rayon: string;
  region: string;
}

const ALERT_API_URL =
  "https://vysfpcckuddqcmfneoov.supabase.co/functions/v1/smart-endpoint";

const FULL_MAP_API_URL =
  "https://vysfpcckuddqcmfneoov.supabase.co/functions/v1/get-alerts-full";

const alertLabels: Record<string, string> = {
  air_raid: "Повітряна тривога",
  artillery_shelling: "Загроза артилерійського обстрілу",
  urban_fights: "Бої в місті",
  chemical: "Хімічна загроза",
  nuclear: "Ядерна загроза",
};

function normalizeName(value: unknown): string {
  if (!value || typeof value !== "string") return "";

  return value
    .trim()
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[–—-]/g, " ")
    .replace(/\bобласть\b/g, "")
    .replace(/\bобл\.?\b/g, "")
    .replace(/\bрайон\b/g, "")
    .replace(/\bр-н\.?\b/g, "")
    .replace(/\bр\s*-?\s*н\.?\b/g, "")
    .replace(/\bтериторіальна\s+громада\b/g, "громада")
    .replace(/\bміська\s+громада\b/g, "громада")
    .replace(/\bселищна\s+громада\b/g, "громада")
    .replace(/\bсільська\s+громада\b/g, "громада")
    .replace(/\s+/g, " ")
    .trim();
}

function namesMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  const normalizedA = normalizeName(a);
  const normalizedB = normalizeName(b);
  return (
    normalizedA === normalizedB ||
    normalizedA.includes(normalizedB) ||
    normalizedB.includes(normalizedA)
  );
}

function isKyivCity(value: unknown): boolean {
  if (!value || typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();

  // Kyiv city variants - exact matches only
  const kyivCityVariants = [
    "київ",
    "м. київ",
    "м.київ",
    "місто київ",
    "київська міська громада",
  ];

  // Must match exactly one of the city variants and NOT be oblast
  const matchesCity = kyivCityVariants.some(variant => normalized === variant);
  const isOblast = normalized.includes("область") || normalized.includes("обл.");

  return matchesCity && !isOblast;
}

function isKyivOblast(value: unknown): boolean {
  if (!value || typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();

  // Must contain "область" or "обл" to be oblast
  return (normalized.includes("київська") && (normalized.includes("область") || normalized.includes("обл")));
}

function matchesKyivCity(alertLoc: any): boolean {
  // Check if this alert is for Kyiv city (not oblast)
  // API returns Kyiv city as type "oblast" with title "м. Київ"
  const fieldsToCheck = [
    { name: 'title', value: alertLoc.title },
    { name: 'originalTitle', value: alertLoc.originalTitle },
    { name: 'oblast', value: alertLoc.oblast },
    { name: 'region', value: alertLoc.region },
    { name: 'hromada', value: alertLoc.hromada },
  ];

  const matches = fieldsToCheck.filter(field => isKyivCity(field.value));
  if (matches.length > 0) {
    console.log('[Alert.tsx matchesKyivCity] Found Kyiv city in fields:', matches.map(m => `${m.name}="${m.value}"`).join(', '));
  }

  return matches.length > 0;
}

export function Alert() {
  const navigate = useNavigate();
  const [region, setRegion] = useState("Київ");
  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [error, setError] = useState("");
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [canRefresh, setCanRefresh] = useState(true);
  const [, setUpdateTrigger] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // New state for user district-based alert checking
  const [userAlertStatus, setUserAlertStatus] = useState<{
    hasAlert: boolean;
    matchType: "raion" | "oblast" | null;
    checkedRayon: string;
    checkedRegion: string;
    activeAlerts: string[];
  }>({
    hasAlert: false,
    matchType: null,
    checkedRayon: "",
    checkedRegion: "",
    activeAlerts: [],
  });

  // Location selection for Alert page (separate from profile)
  const [useProfileLocation, setUseProfileLocation] = useState(true);
  const [alertPageHromada, setAlertPageHromada] = useState("");
  const [alertPageRayon, setAlertPageRayon] = useState("");
  const [alertPageRegion, setAlertPageRegion] = useState("");
  
  // Locations data from endpoint
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  
  // Hromada autocomplete
  const [hromadaInput, setHromadaInput] = useState("");
  const [showHromadaSuggestions, setShowHromadaSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  useEffect(() => {
    const savedRegion = localStorage.getItem("userRegion");
    if (savedRegion) setRegion(savedRegion);

    const authToken = localStorage.getItem("authToken");
    setIsLoggedIn(!!authToken);
    
    // Load alert page location from localStorage
    const alertPageLocationStr = localStorage.getItem("alertPageLocation");
    const userProfileStr = localStorage.getItem("userProfile");
    const userProfile = userProfileStr ? JSON.parse(userProfileStr) : {};
    
    let initialRayon = "";
    let initialRegion = "";
    let initialUseProfile = true;
    
    if (alertPageLocationStr) {
      try {
        const alertPageLocation = JSON.parse(alertPageLocationStr);
        if (alertPageLocation.useProfile !== undefined) {
          setUseProfileLocation(alertPageLocation.useProfile);
          initialUseProfile = alertPageLocation.useProfile;
        }
        if (alertPageLocation.hromada) {
          setAlertPageHromada(alertPageLocation.hromada);
          setHromadaInput(alertPageLocation.hromada);
        }
        if (alertPageLocation.rayon) {
          setAlertPageRayon(alertPageLocation.rayon);
          initialRayon = alertPageLocation.rayon;
        }
        if (alertPageLocation.region) {
          setAlertPageRegion(alertPageLocation.region);
          initialRegion = alertPageLocation.region;
        }
      } catch (e) {
        console.error("Error loading alert page location:", e);
      }
    }
    
    // Initialize userAlertStatus with saved location data
    // Use fallback to region state (defaults to "Київ")
    if (initialUseProfile) {
      // Use profile location
      setUserAlertStatus({
        hasAlert: false,
        matchType: null,
        checkedRayon: userProfile.rayon || "",
        checkedRegion: userProfile.region || userProfile.oblast || savedRegion || region || "Київ",
        activeAlerts: [],
      });
    } else {
      // Use custom alert page location
      setUserAlertStatus({
        hasAlert: false,
        matchType: null,
        checkedRayon: initialRayon,
        checkedRegion: initialRegion || savedRegion || region || "Київ",
        activeAlerts: [],
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userProfile");
    setIsLoggedIn(false);
    navigate("/");
  };
  
  // Load locations from endpoint
  useEffect(() => {
    const fetchLocations = async () => {
      setLocationsLoading(true);
      
      try {
        const response = await fetch('https://vysfpcckuddqcmfneoov.supabase.co/functions/v1/get-locations');
        
        if (response.ok) {
          const data = await response.json();
          if (data.locations && Array.isArray(data.locations)) {
            setLocations(data.locations);
          }
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();
  }, []);
  
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
        
        if (hromadaLower === query) return 0;
        if (hromadaLower.startsWith(query) && isCityHromada) return 1;
        if (hromadaLower.startsWith(query)) return 2;
        if (hromadaLower.includes(query) && isCityHromada) return 3;
        if (hromadaLower.includes(query)) return 4;
        if (rayonLower.startsWith(query)) return 5;
        if (rayonLower.includes(query)) return 6;
        if (regionLower.startsWith(query)) return 7;
        if (regionLower.includes(query)) return 8;
        
        return 9999;
      };
      
      const matchedLocations = locations
        .map(loc => ({ loc, priority: getPriority(loc) }))
        .filter(item => item.priority < 9999)
        .sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return a.loc.hromada.localeCompare(b.loc.hromada, 'uk');
        })
        .slice(0, 10)
        .map(item => item.loc);
      
      setFilteredLocations(matchedLocations);
    } else {
      setFilteredLocations([]);
    }
  }, [hromadaInput, locations]);
  
  // Handler for selecting a location
  const handleLocationSelect = (location: Location) => {
    setAlertPageHromada(location.hromada);
    setAlertPageRayon(location.rayon);
    setAlertPageRegion(location.region);
    setHromadaInput(location.hromada);
    setShowHromadaSuggestions(false);
    
    // Save to localStorage
    localStorage.setItem("alertPageLocation", JSON.stringify({
      useProfile: false,
      hromada: location.hromada,
      rayon: location.rayon,
      region: location.region,
    }));
    
    setUseProfileLocation(false);
  };
  
  // Handler to switch to profile location
  const handleUseProfileLocation = () => {
    setUseProfileLocation(true);
    localStorage.setItem("alertPageLocation", JSON.stringify({
      useProfile: true,
    }));
    fetchAlertData();
  };
  
  // Handler to toggle location selector
  const handleToggleLocationSelector = () => {
    setShowLocationSelector(!showLocationSelector);
  };

  const fetchAlertData = async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    const MIN_INTERVAL = 3000;

    if (timeSinceLastFetch < MIN_INTERVAL && lastFetchTime !== 0) return;

    setLastFetchTime(now);
    setCanRefresh(false);
    setLoading(true);
    setError("");

    setTimeout(() => setCanRefresh(true), MIN_INTERVAL);

    try {
      // Fetch from get-alerts-full for user district-based checking
      const response = await fetch(FULL_MAP_API_URL, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("get-alerts-full response error:", response.status, errorText);
        throw new Error(`get-alerts-full HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const activeLocations = data.activeLocations || [];

      // Get user profile from localStorage
      const userProfileStr = localStorage.getItem("userProfile");
      const userProfile = userProfileStr ? JSON.parse(userProfileStr) : {};
      const savedRegion = localStorage.getItem("userRegion");

      // Read alert page location settings DIRECTLY from localStorage
      const alertPageLocationStr = localStorage.getItem("alertPageLocation");
      let currentUseProfileLocation = true;
      let currentAlertPageRayon = "";
      let currentAlertPageRegion = "";
      let currentAlertPageHromada = "";
      
      if (alertPageLocationStr) {
        try {
          const alertPageLocation = JSON.parse(alertPageLocationStr);
          if (alertPageLocation.useProfile !== undefined) {
            currentUseProfileLocation = alertPageLocation.useProfile;
          }
          if (alertPageLocation.hromada) {
            currentAlertPageHromada = alertPageLocation.hromada;
          }
          if (alertPageLocation.rayon) {
            currentAlertPageRayon = alertPageLocation.rayon;
          }
          if (alertPageLocation.region) {
            currentAlertPageRegion = alertPageLocation.region;
          }
        } catch (e) {
          console.error("Error parsing alertPageLocation:", e);
        }
      }

      // Determine which location to use (profile or alert page custom)
      let userRayon, userRegion, userHromada;

      if (currentUseProfileLocation) {
        // Use profile location
        userRayon = userProfile.rayon || "";
        userRegion = userProfile.region || userProfile.oblast || savedRegion || "";
        userHromada = userProfile.hromada || "";
      } else {
        // Use alert page custom location
        userRayon = currentAlertPageRayon || "";
        userRegion = currentAlertPageRegion || "";
        userHromada = currentAlertPageHromada || "";
      }

      // Create effective location values with fallbacks to region state
      const effectiveHromada = userHromada;
      const effectiveRayon = userRayon;
      const effectiveRegion = userRegion || savedRegion || region || "Київ";

      console.log('[Alert.tsx] Raw user location:', { userHromada, userRegion, userRayon });
      console.log('[Alert.tsx] Effective location:', { effectiveHromada, effectiveRayon, effectiveRegion });

      // Debug: log Kyiv-related active locations
      const kyivAlerts = activeLocations.filter((loc: any) =>
        loc.title?.toLowerCase().includes('київ') ||
        loc.originalTitle?.toLowerCase().includes('київ') ||
        loc.oblast?.toLowerCase().includes('київ') ||
        loc.region?.toLowerCase().includes('київ')
      );
      console.log('[Alert.tsx] Kyiv-related activeLocations:', kyivAlerts);

      // Check if there's an alert for user's district
      let hasUserAlert = false;
      let matchType: "raion" | "oblast" | null = null;
      let collectedAlerts: string[] = [];

      // KYIV CITY CHECK - MUST BE FIRST, BEFORE ALL OTHER CHECKS
      // API returns Kyiv city as type "oblast" with title "м. Київ"
      // If effectiveRegion is "Київ", treat it as Kyiv city, not oblast
      const userIsKyivCity = isKyivCity(effectiveHromada) || isKyivCity(effectiveRegion) || isKyivCity(effectiveRayon);
      console.log('[Alert.tsx] User is Kyiv city:', userIsKyivCity, {
        'isKyivCity(effectiveHromada)': isKyivCity(effectiveHromada),
        'isKyivCity(effectiveRegion)': isKyivCity(effectiveRegion),
        'isKyivCity(effectiveRayon)': isKyivCity(effectiveRayon),
      });

      if (userIsKyivCity) {
        console.log('[Alert.tsx] User location is Kyiv city, checking for Kyiv city alerts');

        // Find alert that matches Kyiv city
        // Check title, originalTitle, oblast, region, hromada for Kyiv city names
        // Must NOT match "Київська область"
        const kyivCityMatch = activeLocations.find((loc: any) => {
          const isMatch = matchesKyivCity(loc);

          console.log('[Alert.tsx] Checking location:', {
            type: loc.type,
            title: loc.title,
            originalTitle: loc.originalTitle,
            oblast: loc.oblast,
            region: loc.region,
            hromada: loc.hromada,
            alertType: loc.alertType,
            matchesKyivCity: isMatch,
          });

          return isMatch;
        });

        if (kyivCityMatch) {
          console.log('[Alert.tsx] ✓ Found Kyiv city match! Setting hasUserAlert=true', kyivCityMatch);
          hasUserAlert = true;
          matchType = "oblast";
          collectedAlerts = kyivCityMatch.alertType ? [kyivCityMatch.alertType] : ["air_raid"];
          console.log('[Alert.tsx] Kyiv alert status:', { hasUserAlert, matchType, collectedAlerts });
        } else {
          console.log('[Alert.tsx] ✗ No Kyiv city alert found in activeLocations');
        }
      }

      if (!hasUserAlert && effectiveRayon) {
        // Check raion-level alerts
        const raionMatch = activeLocations.find((loc: any) => {
          return loc.type === "raion" && (
            namesMatch(loc.raion || "", effectiveRayon) ||
            namesMatch(loc.title || "", effectiveRayon)
          );
        });

        if (raionMatch) {
          hasUserAlert = true;
          matchType = "raion";
          collectedAlerts = raionMatch.alertType ? [raionMatch.alertType] : [];
        }

        // Check hromada/city alerts within user's raion or by name
        if (!hasUserAlert) {
          const hromadaMatch = activeLocations.find((loc: any) => {
            if (loc.type !== "hromada" && loc.type !== "city") return false;

            // Match by raion
            if (namesMatch(loc.raion || "", effectiveRayon)) return true;

            // Match by hromada name if user has hromada set
            if (effectiveHromada) {
              return namesMatch(loc.title || "", effectiveHromada) ||
                     namesMatch(loc.originalTitle || "", effectiveHromada) ||
                     namesMatch(loc.hromada || "", effectiveHromada);
            }

            return false;
          });

          if (hromadaMatch) {
            hasUserAlert = true;
            matchType = "raion";
            collectedAlerts = hromadaMatch.alertType ? [hromadaMatch.alertType] : [];
          }
        }
      }

      // Fallback: check oblast-level if no raion or no raion match
      if (!hasUserAlert && effectiveRegion) {
        // Don't match Kyiv oblast if user is in Kyiv city
        if (isKyivCity(effectiveHromada) || isKyivCity(effectiveRegion)) {
          console.log('[Alert.tsx] Skipping oblast check for Kyiv city user');
        } else {
          const oblastMatch = activeLocations.find((loc: any) => {
            return loc.type === "oblast" && (
              namesMatch(loc.oblast || "", effectiveRegion) ||
              namesMatch(loc.title || "", effectiveRegion)
            );
          });

          if (oblastMatch) {
            hasUserAlert = true;
            matchType = "oblast";
            collectedAlerts = oblastMatch.alertType ? [oblastMatch.alertType] : [];
          }
        }
      }

      console.log('[Alert.tsx] Setting userAlertStatus:', {
        hasAlert: hasUserAlert,
        matchType,
        checkedRayon: effectiveRayon,
        checkedRegion: effectiveRegion,
        activeAlerts: collectedAlerts,
      });

      setUserAlertStatus({
        hasAlert: hasUserAlert,
        matchType,
        checkedRayon: effectiveRayon,
        checkedRegion: effectiveRegion,
        activeAlerts: collectedAlerts,
      });

      // Update legacy alertData for compatibility (optional, can be removed if not needed)
      setAlertData({
        id: effectiveRayon || effectiveRegion,
        locationTitle: effectiveRayon || effectiveRegion,
        activeAlerts: collectedAlerts,
      });

    } catch (err: any) {
      console.error("Alert fetch error:", err);
      setError(err.message || "Не вдалося завантажити дані про тривоги.");
      setAlertData(null);
      setUserAlertStatus({
        hasAlert: false,
        matchType: null,
        checkedRayon: "",
        checkedRegion: "",
        activeAlerts: [],
      });
    }

    setLoading(false);
    setIsFirstLoad(false);
  };

  useEffect(() => {
    fetchAlertData();

    const interval = setInterval(() => {
      fetchAlertData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hasAlert = userAlertStatus.hasAlert;

  const formatLastUpdate = () => {
    if (lastFetchTime === 0) return "";

    const now = Date.now();
    const secondsAgo = Math.floor((now - lastFetchTime) / 1000);

    if (secondsAgo < 60) return `${secondsAgo} сек тому`;

    const minutesAgo = Math.floor(secondsAgo / 60);

    if (minutesAgo < 60) return `${minutesAgo} хв тому`;

    const hoursAgo = Math.floor(minutesAgo / 60);

    return `${hoursAgo} год тому`;
  };

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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-4xl font-bold text-gray-900">
                Повітряна тривога
              </h2>

              <button
                onClick={fetchAlertData}
                disabled={!canRefresh}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-2 ${
                  canRefresh
                    ? "bg-blue-900 hover:bg-blue-800 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Оновити
              </button>
            </div>

            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <p className="text-lg">
                  {userAlertStatus.checkedRayon && userAlertStatus.checkedRegion
                    ? `${userAlertStatus.checkedRayon}, ${userAlertStatus.checkedRegion}`
                    : userAlertStatus.checkedRegion || region}
                </p>
              </div>

              {lastFetchTime > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <p>Оновлено {formatLastUpdate()}</p>
                </div>
              )}
            </div>
          </div>

          {isFirstLoad && loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <RefreshCw className="w-12 h-12 text-blue-900 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Завантаження даних...</p>
            </div>
          ) : error ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <AlertTriangle className="w-12 h-12 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-amber-900 mb-2">
                    Не вдалося завантажити дані
                  </h3>
                  <p className="text-amber-800 mb-4">{error}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={fetchAlertData}
                  disabled={!canRefresh}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2 ${
                    canRefresh
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <RefreshCw className="w-5 h-5" />
                  {canRefresh ? "Спробувати знову" : "Зачекайте..."}
                </button>
              </div>
            </div>
          ) : hasAlert ? (
            <div className="bg-red-50 border-4 border-red-200 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-center gap-4 mb-6">
                <AlertTriangle className="w-20 h-20 text-red-600 animate-pulse" />
                <div>
                  <h3 className="text-3xl font-bold text-red-700 mb-2">
                    Увага! Тривога
                  </h3>
                  <p className="text-xl text-gray-800">
                    {userAlertStatus.matchType === "raion"
                      ? "Є активна тривога у вашому районі"
                      : "Тривога оголошена на рівні області, до якої належить ваш район"}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Перевірено для: {userAlertStatus.checkedRayon && userAlertStatus.checkedRegion
                      ? `${userAlertStatus.checkedRayon}, ${userAlertStatus.checkedRegion}`
                      : userAlertStatus.checkedRegion || "—"}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-3 text-lg">
                  Активні загрози:
                </h4>

                <ul className="space-y-2">
                  {userAlertStatus.activeAlerts.length > 0 ? (
                    userAlertStatus.activeAlerts.map((alert: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-gray-800"
                      >
                        <span className="text-red-600 font-bold mt-1">⚠</span>
                        <span className="font-semibold">
                          {alertLabels[alert] || alert}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2 text-gray-800">
                      <span className="text-red-600 font-bold mt-1">⚠</span>
                      <span className="font-semibold">
                        {alertLabels["air_raid"]}
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-bold mb-3 text-lg text-red-700">
                  Що робити:
                </h4>

                <ul className="space-y-2 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 font-bold text-red-600">•</span>
                    <span>Негайно пройдіть в укриття</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 font-bold text-red-600">•</span>
                    <span>Відійдіть від вікон</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 font-bold text-red-600">•</span>
                    <span>Переконайтеся, що ваш телефон заряджений</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 font-bold text-red-600">•</span>
                    <span>Тримайте при собі документи та тривожну валізу</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 font-bold text-red-600">•</span>
                    <span>Слідкуйте за офіційними джерелами інформації</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border-4 border-green-500 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-center gap-4 mb-4">
                <CheckCircle className="w-20 h-20 text-green-600" />
                <div>
                  <h3 className="text-3xl font-bold text-green-900 mb-2">
                    Тривоги немає
                  </h3>
                  <p className="text-xl text-green-800">
                    Станом на зараз у вашому районі спокійно
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    Перевірено для: {userAlertStatus.checkedRayon && userAlertStatus.checkedRegion
                      ? `${userAlertStatus.checkedRayon}, ${userAlertStatus.checkedRegion}`
                      : userAlertStatus.checkedRegion || region}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 mt-6">
                <h4 className="font-bold text-gray-900 mb-3">Пам'ятайте:</h4>

                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Завжди майте під рукою тривожну валізу</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Знайте розташування найближчого укриття</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Тримайте телефон зарядженим</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Слідкуйте за сповіщеннями про тривогу</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Location selector */}
          <div className="mt-6 bg-white border-2 border-blue-300 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Вибраний вами район:</p>
                  <p className="font-bold text-gray-900">
                    {userAlertStatus.checkedRayon && userAlertStatus.checkedRegion
                      ? `${userAlertStatus.checkedRayon}, ${userAlertStatus.checkedRegion}`
                      : userAlertStatus.checkedRegion || region}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleToggleLocationSelector}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors inline-flex items-center gap-2 text-sm font-semibold"
              >
                {showLocationSelector ? (
                  <>
                    <X className="w-4 h-4" />
                    Закрити
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Перевірити для іншого району
                  </>
                )}
              </button>
            </div>

            {showLocationSelector && (
              <div className="mt-4 space-y-4 border-t pt-4">
                {!useProfileLocation && (
                  <div className="mb-4">
                    <button
                      onClick={handleUseProfileLocation}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Використати район з профілю
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Вкажіть громаду для перевірки:
                  </label>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={hromadaInput}
                      onChange={(e) => {
                        setHromadaInput(e.target.value);
                        setShowHromadaSuggestions(true);
                      }}
                      onFocus={() => setShowHromadaSuggestions(true)}
                      placeholder="Почніть вводити назву громади..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-900 text-gray-900"
                    />
                    
                    {showHromadaSuggestions && filteredLocations.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredLocations.map((location, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              handleLocationSelect(location);
                              fetchAlertData();
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-200 last:border-b-0"
                          >
                            <div className="font-semibold text-gray-900">
                              {location.hromada}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {location.rayon}, {location.region}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {!useProfileLocation && alertPageRayon && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Вибрано:</span> {alertPageHromada}
                      </p>
                      <p className="text-sm text-blue-800 mt-1">
                        <span className="font-semibold">Район:</span> {alertPageRayon}, {alertPageRegion}
                      </p>
                    </div>
                  )}
                  
                  {locationsLoading && (
                    <p className="text-sm text-gray-600 mt-2">Завантаження списку громад...</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <DetailedUkraineMap fullMapUrl={FULL_MAP_API_URL} />
          </div>
        </div>
      </main>
    </div>
  );
}