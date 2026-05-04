import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  fullMapUrl: string;
}

interface FeatureCollection {
  type: string;
  features: any[];
}

interface ActiveLocation {
  title: string;
  oblast: string;
  raion: string;
  type: string;
  alertType: string;
}

interface MapData {
  activeLocations: ActiveLocation[];
  geo: {
    hromady?: FeatureCollection;
    rayony: FeatureCollection;
    regiony: FeatureCollection;
  };
}

const NORMAL_COLOR = "#E5E7EB";
const ALERT_COLOR = "#EF4444";

const alertTypeLabels: Record<string, string> = {
  air_raid: "Повітряна тривога",
  artillery_shelling: "Загроза артилерійського обстрілу",
  urban_fights: "Бої в місті",
  chemical: "Хімічна загроза",
  nuclear: "Ядерна загроза",
};

const locationTypeLabels: Record<string, string> = {
  oblast: "Вся область",
  raion: "Район",
  hromada: "Громада",
  city: "Місто",
};

const specialCityNames = [
  "київ",
  "м. київ",
  "місто київ",
  "севастополь",
  "м. севастополь",
  "місто севастополь",
];

// ─── Name normalization ────────────────────────────────────────────────────────
// Виконуємо всі заміни ДО фінального стиснення пробілів, щоб не залишалось
// подвійних пробілів після видалення слів.
function normalizeName(value: unknown): string {
  if (!value || typeof value !== "string") return "";

  return value
    .trim()
    .toLowerCase()
    // уніфікуємо типографічні апострофи
    .replace(/['''`]/g, "'")
    // прибираємо дефіси
    .replace(/-/g, " ")
    // прибираємо адміністративні суфікси (порядок важливий: спочатку довші)
    .replace(/\bтериторіальна\s+громада\b/g, "")
    .replace(/\bміська\s+громада\b/g, "")
    .replace(/\bселищна\s+громада\b/g, "")
    .replace(/\bсільська\s+громада\b/g, "")
    .replace(/\bгромада\b/g, "")
    .replace(/\bміська\b/g, "")
    .replace(/\bселищна\b/g, "")
    .replace(/\bсільська\b/g, "")
    // прибираємо суфікс "область" / "обл."
    .replace(/\bобласть\b/g, "")
    .replace(/\bобл\.?\b/g, "")
    // прибираємо суфікс "район" / "р-н" / "р."
    .replace(/\bрайон\b/g, "")
    .replace(/\bр-н\b/g, "")
    .replace(/\bр\.\b/g, "")
    // стискаємо всі пробіли в один і обрізаємо краї — ОДИН РАЗ наприкінці
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Property helpers ──────────────────────────────────────────────────────────
function getGeoName(feature: any): string {
  const p = feature?.properties ?? {};
  return (
    p.hromada ?? p.name ?? p.NAME ?? p.title ?? p.rayon ?? p.region ?? "Невідома локація"
  );
}

function getRayonName(feature: any): string {
  const p = feature?.properties ?? {};
  return p.rayon ?? p.raion ?? p.district ?? p.name ?? p.NAME ?? p.NAME_2 ?? p.ADM2_UA ?? "";
}

function getOblastName(feature: any): string {
  const p = feature?.properties ?? {};
  return p.region ?? p.oblast ?? p.area ?? "";
}

/**
 * Форматування назви для відображення користувачу (з великої літери).
 */
function formatLocationDisplayName(value: string): string {
  const normalized = normalizeName(value);

  if (
    normalized === "автономна республіка крим" ||
    normalized === "арк" ||
    normalized === "крим"
  ) {
    return "Автономна Республіка Крим";
  }

  if (normalized === "севастополь") {
    return "Севастополь";
  }

  if (normalized === "київ") {
    return "Київ";
  }

  return value;
}

/**
 * Форматування назви в родовому відмінку для фрази "на рівні...".
 */
function formatLocationGenitive(value: string): string {
  const normalized = normalizeName(value);

  if (
    normalized === "автономна республіка крим" ||
    normalized === "арк" ||
    normalized === "крим"
  ) {
    return "Автономної Республіки Крим";
  }

  // Для інших - повертаємо як є
  return formatLocationDisplayName(value);
}

/**
 * Отримує текст "Поширюється на:" для popup з урахуванням особливостей АРК.
 */
function getSpreadLabel(alertInfo: ActiveLocation, featureName?: string): string {
  const title = formatLocationDisplayName(
    (alertInfo as any).originalTitle ||
    alertInfo.title ||
    (alertInfo as any).originalOblast ||
    alertInfo.oblast ||
    featureName ||
    ""
  );

  const normalizedTitle = normalizeName(title);
  const normalizedFeature = normalizeName(featureName || "");

  if (
    normalizedTitle === "автономна республіка крим" ||
    normalizedTitle === "крим" ||
    normalizedFeature === "автономна республіка крим" ||
    normalizedFeature === "крим"
  ) {
    return "Автономна Республіка Крим";
  }

  if (normalizedFeature === "севастополь") {
    return "місто";
  }

  if (alertInfo.type === "oblast") return "всю область";
  if (alertInfo.type === "raion") return "район";
  if (alertInfo.type === "hromada") return "громаду";
  if (alertInfo.type === "city") return "місто";

  return "територію";
}

// ─── Geometry helpers ──────────────────────────────────────────────────────────
function collectCoordinates(geometry: any): number[][] {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates.flat();
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat(2);
  return [];
}

function geometryToPaths(
  geometry: any,
  projectPoint: (x: number, y: number) => number[]
): string[] {
  if (!geometry) return [];
  if (geometry.type === "Polygon")
    return [polygonToPath(geometry.coordinates, projectPoint)];
  if (geometry.type === "MultiPolygon")
    return geometry.coordinates.map((polygon: any) =>
      polygonToPath(polygon, projectPoint)
    );
  return [];
}

function polygonToPath(
  polygon: any[],
  projectPoint: (x: number, y: number) => number[]
): string {
  const outerRing = polygon[0] ?? [];
  return outerRing
    .map((point: number[], i: number) => {
      const [x, y] = projectPoint(point[0], point[1]);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ") + " Z";
}

// ─── Alert matching ────────────────────────────────────────────────────────────
/**
 * Перевіряє чи є збіг між нормалізованими рядками.
 * Використовуємо includes в обох напрямках для толерантності до скорочень.
 */
function namesMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

/**
 * Строге порівняння після нормалізації - для районів щоб уникнути false positive.
 */
function exactNormalizedMatch(a: unknown, b: unknown): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  return na === nb;
}

/**
 * Перевіряє чи target збігається з хоча б одним з candidates через exact match.
 */
function matchesAnyExact(target: unknown, candidates: unknown[]): boolean {
  return candidates.some((candidate) => exactNormalizedMatch(target, candidate));
}

/**
 * Головна функція перевірки тривоги для конкретної rayon-фічі.
 *
 * Логіка (STRICT MATCHING для районів):
 *  1. loc.type === "raion" → строге порівняння getRayonName(feature) з loc.raion || loc.title
 *  2. loc.type === "hromada" → строге порівняння getRayonName(feature) з loc.raion (якщо є)
 *  3. loc.type === "city" → строге порівняння getRayonName(feature) з loc.raion (якщо є)
 *  4. Oblast тривоги НЕ обробляємо тут (окремий oblast overlay)
 */
function checkAlert(
  feature: any,
  activeLocations: ActiveLocation[]
): ActiveLocation | null {
  const featureRayonName = getRayonName(feature);

  for (const loc of activeLocations) {
    // Пропускаємо oblast тривоги (вони обробляються окремо)
    if (loc.type === "oblast") continue;

    if (loc.type === "raion") {
      // Тривога на рівні району → СТРОГЕ порівняння з loc.raion або loc.title
      const targetRayon = loc.raion || loc.title;
      if (exactNormalizedMatch(featureRayonName, targetRayon)) {
        return loc;
      }
    } else if (loc.type === "hromada") {
      // Тривога на рівні громади → СТРОГЕ порівняння з loc.raion (якщо є)
      if (loc.raion && exactNormalizedMatch(featureRayonName, loc.raion)) {
        return loc;
      }
      // Якщо loc.raion порожній - не підсвічуємо район, громада обробляється окремо
    } else if (loc.type === "city") {
      // Тривога на рівні міста → СТРОГЕ порівняння з loc.raion (якщо є)
      if (loc.raion && exactNormalizedMatch(featureRayonName, loc.raion)) {
        return loc;
      }
      // Якщо loc.raion порожній - не підсвічуємо район, місто обробляється окремо
    }
  }

  return null;
}

/**
 * Check if value is Kyiv city (not Kyiv oblast)
 */
function isKyivCity(value: unknown): boolean {
  if (!value || typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();

  const kyivCityVariants = [
    "київ",
    "м. київ",
    "м.київ",
    "місто київ",
    "київська міська громада",
  ];

  const matchesCity = kyivCityVariants.some(variant => normalized === variant);
  const isOblast = normalized.includes("область") || normalized.includes("обл.");

  return matchesCity && !isOblast;
}

/**
 * Check if alert location is for Kyiv city (not oblast)
 * API returns Kyiv city as type "oblast" with title "м. Київ"
 */
function matchesKyivCity(alertLoc: any): boolean {
  const fieldsToCheck = [
    alertLoc.title,
    alertLoc.originalTitle,
    alertLoc.oblast,
    alertLoc.region,
    alertLoc.hromada,
  ];

  return fieldsToCheck.some(field => isKyivCity(field));
}

/**
 * Перевірка тривоги для спеціальних міст (Київ, Севастополь та інші).
 * Використовує STRICT MATCHING щоб уникнути false positive ("Київ" не збігається з "Київська область").
 *
 * Для Києва: API повертає тривогу як type "oblast" з title "м. Київ" - треба відрізнити від "Київська область".
 * Для Севастополя: якщо є обласна тривога в Криму, Севастополь також підсвічується.
 */
function checkSpecialCityAlert(
  feature: any,
  activeLocations: ActiveLocation[]
): ActiveLocation | null {
  const p = feature?.properties ?? {};
  const featureHromada = p.hromada;
  const featureRayon = p.rayon;
  const featureRegion = p.region;
  const featureGeoName = getGeoName(feature);

  // Debug logging for Kyiv
  const normalizedGeoName = normalizeName(featureGeoName);
  const isKyivFeature = isKyivCity(featureGeoName) || isKyivCity(featureHromada);

  if (isKyivFeature) {
    console.log('[DetailedUkraineMap] Checking Kyiv feature:', {
      featureHromada,
      featureRayon,
      featureRegion,
      featureGeoName,
      normalizedGeoName
    });
  }

  for (const loc of activeLocations) {
    // Debug logging for Kyiv alerts
    if (isKyivFeature) {
      console.log('[DetailedUkraineMap] Checking against alert:', {
        type: loc.type,
        title: loc.title,
        originalTitle: (loc as any).originalTitle,
        oblast: loc.oblast,
        region: (loc as any).region,
        hromada: (loc as any).hromada,
        raion: loc.raion,
        matchesKyivCity: matchesKyivCity(loc)
      });
    }

    // Special check for Kyiv city
    // API returns Kyiv as type "oblast" with title "м. Київ"
    if (isKyivFeature) {
      if (matchesKyivCity(loc)) {
        console.log('[DetailedUkraineMap] Kyiv matched!', loc);
        return loc;
      }
      // Skip other checks for Kyiv feature to avoid matching Kyiv oblast
      continue;
    }

    // Regular checks for other special cities
    // Перевірка через назву міста/громади
    const cityNames = [
      loc.title,
      (loc as any).originalTitle,
      (loc as any).hromada,
    ].filter(Boolean);

    if (matchesAnyExact(featureHromada, cityNames) || matchesAnyExact(featureGeoName, cityNames)) {
      return loc;
    }

    // Перевірка через район
    const rayonNames = [
      loc.raion,
      (loc as any).originalRaion,
    ].filter(Boolean);

    if (featureRayon && matchesAnyExact(featureRayon, rayonNames)) {
      return loc;
    }

    // Перевірка через область (для Севастополя в Криму)
    if (loc.type === "oblast") {
      const oblastNames = [
        loc.oblast,
        loc.title,
        (loc as any).originalOblast,
        (loc as any).originalTitle,
      ].filter(Boolean);

      if (featureRegion && matchesAnyExact(featureRegion, oblastNames)) {
        return loc;
      }
    }
  }

  if (isKyivFeature) {
    console.log('[DetailedUkraineMap] No match found for Kyiv feature');
  }

  return null;
}

// ─── Centroid helper ───────────────────────────────────────────────────────────
function getCentroid(geometry: any): [number, number] | null {
  const coords = collectCoordinates(geometry);
  if (coords.length === 0) return null;
  const sumX = coords.reduce((s, c) => s + c[0], 0);
  const sumY = coords.reduce((s, c) => s + c[1], 0);
  return [sumX / coords.length, sumY / coords.length];
}

// ─── Point in polygon ──────────────────────────────────────────────────────────
function pointInPolygon(point: [number, number], geometry: any): boolean {
  if (!geometry) return false;

  const testRing = (ring: number[][]): boolean => {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];

      const intersect = ((yi > y) !== (yj > y)) &&
                       (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };

  if (geometry.type === "Polygon") {
    return testRing(geometry.coordinates[0]);
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon: any) => testRing(polygon[0]));
  }

  return false;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DetailedUkraineMap({ fullMapUrl }: Props) {
  const [geo, setGeo] = useState<MapData["geo"] | null>(null);
  const [activeLocations, setActiveLocations] = useState<ActiveLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRayon, setSelectedRayon] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [wasDragging, setWasDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchMapData = async () => {
      try {
        if (!cancelled) {
          // Показуємо loading тільки при першому завантаженні
          if (!geo) {
            setLoading(true);
          }
          setError("");
        }

        const response = await fetch(fullMapUrl, {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5c2ZwY2NrdWRkcWNtZm5lb292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5OTY5MDcsImV4cCI6MjA5MjU3MjkwN30.zWttspQtb5ZqSwg5n7hIVj_2GM4f2MgA13MaC3qJWJ4'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const rawData = await response.json();

        const data: MapData = {
          activeLocations: Array.isArray(rawData.activeLocations)
            ? rawData.activeLocations
            : [],
          geo: {
            hromady: rawData.geo?.hromady,
            rayony: rawData.geo?.rayony,
            regiony: rawData.geo?.regiony,
          },
        };

        console.log("Transformed full map data:", {
          activeLocationsCount: data.activeLocations.length,
          rayonyFeaturesCount: data.geo.rayony?.features?.length,
          regionyFeaturesCount: data.geo.regiony?.features?.length,
        });

        if (!data.geo.rayony?.features?.length) {
          throw new Error("Некоректна структура даних: geo.rayony.features відсутній або порожній");
        }

        if (!data.geo.regiony?.features?.length) {
          console.warn("geo.regiony.features відсутній або порожній");
        }

        if (!cancelled) {
          setGeo(data.geo);
          setActiveLocations(data.activeLocations ?? []);
          setLastUpdate(new Date());
          setLoading(false);

          // Debug: log Kyiv-related alerts
          const kyivAlerts = (data.activeLocations ?? []).filter((loc: ActiveLocation) => {
            return loc.title?.toLowerCase().includes('київ') ||
                   (loc as any).originalTitle?.toLowerCase().includes('київ') ||
                   loc.oblast?.toLowerCase().includes('київ') ||
                   (loc as any).region?.toLowerCase().includes('київ');
          });
          console.log('[DetailedUkraineMap] Kyiv-related activeLocations:', kyivAlerts);

          // Specifically check for Kyiv city alerts
          const kyivCityAlerts = (data.activeLocations ?? []).filter((loc: ActiveLocation) => matchesKyivCity(loc));
          console.log('[DetailedUkraineMap] Kyiv CITY alerts (should match polygon):', kyivCityAlerts);
        }
      } catch (err: any) {
        console.error("Map fetch error:", err);
        if (!cancelled) {
          // Якщо geo вже є - залишаємо стару карту, не показуємо помилку
          if (!geo) {
            setError(err.message ?? "Не вдалося завантажити карту");
            setLoading(false);
          }
          // Якщо geo є - просто ігноруємо помилку, стара карта залишається
        }
      }
    };

    fetchMapData();
    const interval = setInterval(fetchMapData, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fullMapUrl]);

  const features = geo?.rayony?.features ?? [];

  // ── Projection ─────────────────────────────────────────────────────────────
  // Equirectangular projection для коректного відображення України
  const { bounds, centerLat } = useMemo(() => {
    if (features.length === 0) return { bounds: null, centerLat: 0 };

    // Спочатку знаходимо сирі bounds lon/lat
    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
    features.forEach((f: any) => {
      collectCoordinates(f.geometry).forEach(([lon, lat]) => {
        if (lon < minLon) minLon = lon;
        if (lat < minLat) minLat = lat;
        if (lon > maxLon) maxLon = lon;
        if (lat > maxLat) maxLat = lat;
      });
    });

    // Центральна широта для проєкції
    const centerLatitude = (minLat + maxLat) / 2;
    const centerLatRad = (centerLatitude * Math.PI) / 180;
    const cosCenter = Math.cos(centerLatRad);

    // Застосовуємо equirectangular projection для bounds
    const minX = minLon * cosCenter;
    const maxX = maxLon * cosCenter;
    const minY = minLat;
    const maxY = maxLat;

    return {
      bounds: { minX, minY, maxX, maxY },
      centerLat: centerLatRad,
    };
  }, [features]);

  const projectPoint = useMemo(() => {
    return (lon: number, lat: number): number[] => {
      if (!bounds) return [0, 0];

      // Застосовуємо equirectangular projection
      const cosCenter = Math.cos(centerLat);
      const projectedX = lon * cosCenter;
      const projectedY = lat;

      const W = 1000, H = 650, pad = 30;

      // Однаковий масштаб для X і Y
      const scale = Math.min(
        (W - pad * 2) / (bounds.maxX - bounds.minX),
        (H - pad * 2) / (bounds.maxY - bounds.minY)
      );

      return [
        pad + (projectedX - bounds.minX) * scale,
        H - pad - (projectedY - bounds.minY) * scale,
      ];
    };
  }, [bounds, centerLat]);

  // ── Region labels ──────────────────────────────────────────────────────────
  const regionyLabels = useMemo(() => {
    if (!geo?.regiony?.features || !bounds) return [];
    return geo.regiony.features
      .map((feature: any) => {
        const centroid = getCentroid(feature.geometry);
        if (!centroid) return null;
        const [px, py] = projectPoint(centroid[0], centroid[1]);
        return { x: px, y: py, name: getGeoName(feature) };
      })
      .filter(Boolean);
  }, [geo?.regiony, bounds, projectPoint]);

  // ── Alert cache (перераховується лише при зміні даних) ─────────────────────
  const alertCache = useMemo(() => {
    const cache = new Map<number, ActiveLocation | null>();
    features.forEach((f: any, i: number) => {
      cache.set(i, checkAlert(f, activeLocations));
    });
    return cache;
  }, [features, activeLocations]);

  // ── Oblast alert overlay ───────────────────────────────────────────────────
  const oblastAlerts = useMemo(() => {
    if (!geo?.regiony?.features) return [];

    // Знаходимо всі області з тривогою (STRICT MATCHING)
    const alertedOblasts: Array<{ feature: any; alert: ActiveLocation }> = [];

    activeLocations.forEach((loc) => {
      if (loc.type !== "oblast") return;

      const locOblastName = loc.oblast || loc.title;

      geo.regiony.features.forEach((feature: any) => {
        const featureOblastName = getOblastName(feature) || getGeoName(feature);

        if (exactNormalizedMatch(featureOblastName, locOblastName)) {
          alertedOblasts.push({ feature, alert: loc });
        }
      });
    });

    return alertedOblasts;
  }, [geo?.regiony, activeLocations]);

  // ── Rayon → Oblast mapping (для визначення обласних тривог при кліку) ──────
  const rayonToOblastAlert = useMemo(() => {
    const map = new Map<number, ActiveLocation>();

    if (!oblastAlerts.length) return map;

    features.forEach((rayonFeature: any, rayonIndex: number) => {
      const centroid = getCentroid(rayonFeature.geometry);
      if (!centroid) return;

      // Перевіряємо чи центроїд району попадає в область з тривогою
      for (const { feature: oblastFeature, alert } of oblastAlerts) {
        if (pointInPolygon(centroid, oblastFeature.geometry)) {
          map.set(rayonIndex, alert);
          break; // Один район може бути лише в одній області
        }
      }
    });

    return map;
  }, [features, oblastAlerts]);

  // ── City layer (міста без району) ──────────────────────────────────────────
  const cityFeatures = useMemo(() => {
    const cities: Array<{
      alert: ActiveLocation;
      feature?: any;
      marker?: { lon: number; lat: number };
    }> = [];

    // Знаходимо міста без району
    const citiesWithoutRaion = activeLocations.filter(
      (loc) => loc.type === "city" && !loc.raion
    );

    citiesWithoutRaion.forEach((cityAlert) => {
      const cityName = cityAlert.title;

      // Спеціальний fallback для Києва (тільки якщо не знайдено в hromady)
      if (specialCityNames.some((name) => exactNormalizedMatch(cityName, name))) {
        // Київ обробляється в specialCityFeatures, не додаємо його тут
        return;
      }

      // Для інших міст шукаємо полігон (STRICT MATCHING)
      let foundFeature = null;

      // Шукаємо в regiony
      if (geo?.regiony?.features) {
        foundFeature = geo.regiony.features.find((f: any) => {
          return exactNormalizedMatch(getGeoName(f), cityName);
        });
      }

      // Якщо не знайдено в regiony, шукаємо в hromady
      if (!foundFeature && geo?.hromady?.features) {
        foundFeature = geo.hromady.features.find((f: any) => {
          return exactNormalizedMatch(getGeoName(f), cityName);
        });
      }

      if (foundFeature) {
        cities.push({ alert: cityAlert, feature: foundFeature });
      } else {
        // Якщо полігон не знайдено, міста без marker не показуємо
        console.warn(`City polygon not found for: ${cityAlert.title}`);
      }
    });

    return cities;
  }, [activeLocations, geo]);

  // ── Special city hromady (Київ, Севастополь та інші спеціальні міста) ──────
  const specialCityFeatures = useMemo(() => {
    const features = (geo?.hromady?.features ?? []).filter((feature: any) => {
      const featureName = getGeoName(feature);
      return specialCityNames.some((cityName) =>
        exactNormalizedMatch(featureName, cityName)
      );
    });

    console.log(
      "Special city features:",
      features.map((f: any) => f.properties)
    );
    console.log("Kyiv polygon found:", features.some((f: any) => {
      const name = normalizeName(f.properties?.hromada);
      return name === "київ" || name === "kyiv";
    }));
    console.log("Sevastopol polygon found:", features.some((f: any) => {
      const name = normalizeName(f.properties?.hromada);
      return name === "севастополь";
    }));

    return features;
  }, [geo?.hromady]);

  // ── Special city alerts cache ──────────────────────────────────────────────
  const specialCityAlertCache = useMemo(() => {
    const cache = new Map<number, ActiveLocation | null>();
    specialCityFeatures.forEach((f: any, i: number) => {
      cache.set(i, checkSpecialCityAlert(f, activeLocations));
    });
    return cache;
  }, [specialCityFeatures, activeLocations]);

  // ── Zoom / Pan ─────────────────────────────────────────────────────────────
  const handleZoomIn  = () => setZoom((z) => Math.min(z + 0.5, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.5, 0.5));
  const handleZoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Дозволяємо dragging при будь-якому zoom
    setIsDragging(true);
    setWasDragging(false);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setWasDragging(true);
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp   = () => {
    setIsDragging(false);
    // wasDragging скидається після невеликої затримки щоб клік обробники встигли перевірити
    setTimeout(() => setWasDragging(false), 10);
  };
  const handleWheel     = (e: React.WheelEvent) => {
    e.preventDefault();
    e.deltaY < 0 ? handleZoomIn() : handleZoomOut();
  };

  // ── Touch handlers ─────────────────────────────────────────────────────────
  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - pan
      setIsDragging(true);
      setWasDragging(false);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
      // Two fingers - pinch zoom
      setLastTouchDistance(getTouchDistance(e.touches));
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      // Single touch pan
      setWasDragging(true);
      setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    } else if (e.touches.length === 2 && lastTouchDistance) {
      // Pinch zoom
      const currentDistance = getTouchDistance(e.touches);
      const delta = currentDistance - lastTouchDistance;

      if (Math.abs(delta) > 5) {
        const zoomChange = delta > 0 ? 0.1 : -0.1;
        setZoom((z) => Math.max(0.5, Math.min(5, z + zoomChange)));
        setLastTouchDistance(currentDistance);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(null);
    setTimeout(() => setWasDragging(false), 10);
  };

  // ── Click on rayon ─────────────────────────────────────────────────────────
  const handleRayonClick = (feature: any, index: number) => {
    if (!wasDragging) {
      console.log("Clicked rayon:", getRayonName(feature));
      console.log("Matched alertInfo:", checkAlert(feature, activeLocations));
      setSelectedRayon({ feature, index });
      setSelectedCity(null);
    }
  };

  // ── Click on city ──────────────────────────────────────────────────────────
  const handleCityClick = (alert: ActiveLocation, featureName?: string) => {
    if (!wasDragging) {
      if (featureName) {
        console.log("Clicked city/hromada:", featureName);
        console.log("Matched alertInfo:", alert);
      }
      setSelectedCity(alert);
      setSelectedRayon(null);
    }
  };

  // ── Renders ────────────────────────────────────────────────────────────────
  if (loading && !geo) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 text-center">
        <p className="text-gray-600">Завантаження детальної карти...</p>
      </div>
    );
  }

  if (error && !geo) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
        <div className="flex items-start gap-3 text-red-700">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold">Помилка завантаження карти</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!geo || features.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 text-center">
        <p className="text-gray-600">Немає даних для відображення</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 text-center">
        Детальна карта тривог України
      </h3>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-gray-600 hidden sm:block">
          Червоний — активна тривога, сірий — тривоги немає. Натисніть на район для деталей.
        </p>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className={`px-3 py-1 rounded text-lg font-bold transition-colors ${
                zoom <= 0.5 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-white"
              }`}
            >
              −
            </button>

            <span className="px-2 text-sm font-semibold text-gray-700 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 5}
              className={`px-3 py-1 rounded text-lg font-bold transition-colors ${
                zoom >= 5 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-white"
              }`}
            >
              +
            </button>

            {zoom !== 1 && (
              <button
                onClick={handleZoomReset}
                className="px-2 py-1 rounded text-xs font-semibold text-gray-700 hover:bg-white"
              >
                ↻
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="w-4 h-4"
            />
            Показати назви
          </label>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-xs text-gray-500 text-center mb-4">
          Оновлено: {lastUpdate.toLocaleTimeString("uk-UA")}
        </p>
      )}

      {/* Map container */}
      <div
        className="w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 relative"
        style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg
          viewBox="0 0 1000 650"
          preserveAspectRatio="xMidYMid meet"
          className="w-full min-w-[300px] md:min-w-[800px] h-auto"
          role="img"
          aria-label="Детальна карта повітряних тривог України"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          {/* Rayony — основний рівень з кольором тривоги */}
          {features.map((feature: any, index: number) => {
            const alertInfo = alertCache.get(index);
            const fill = alertInfo ? ALERT_COLOR : NORMAL_COLOR;
            const paths = geometryToPaths(feature.geometry, projectPoint);

            return paths.map((path, pathIndex) => (
              <path
                key={`rayon-${index}-${pathIndex}`}
                d={path}
                fill={fill}
                stroke="none"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleRayonClick(feature, index)}
              >
                <title>{getGeoName(feature)}</title>
              </path>
            ));
          })}

          {/* Oblast alert overlay — суцільний червоний для областей з тривогою */}
          {oblastAlerts.map(({ feature, alert }, index) =>
            geometryToPaths(feature.geometry, projectPoint).map((path, pi) => (
              <path
                key={`oblast-alert-${index}-${pi}`}
                d={path}
                fill={ALERT_COLOR}
                fillOpacity={1}
                stroke="none"
                pointerEvents="none"
              >
                <title>{getGeoName(feature)} — обласна тривога</title>
              </path>
            ))
          )}

          {/* Special city hromady layer — Київ, Севастополь та інші спеціальні міста */}
          {specialCityFeatures.map((feature: any, index: number) => {
            const alertInfo = specialCityAlertCache.get(index);
            const fill = alertInfo ? ALERT_COLOR : NORMAL_COLOR;
            const paths = geometryToPaths(feature.geometry, projectPoint);
            const featureName = getGeoName(feature);

            return paths.map((path, pathIndex) => (
              <path
                key={`special-city-${index}-${pathIndex}`}
                d={path}
                fill={fill}
                fillOpacity={1}
                stroke="#ffffff"
                strokeWidth={2}
                strokeOpacity={0.9}
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Clicked special city:", featureName);
                  console.log("Alert info:", alertInfo);
                  handleCityClick(
                    {
                      title: featureName,
                      type: "city",
                      alertType: alertInfo?.alertType || "",
                      oblast: alertInfo?.oblast || "",
                      raion: alertInfo?.raion || "",
                      isSpecialCity: true,
                      sourceAlert: alertInfo,
                    } as any,
                    featureName
                  );
                }}
                style={{ pointerEvents: "auto" }}
              >
                <title>{featureName}</title>
              </path>
            ));
          })}

          {/* City layer — міста без району */}
          {cityFeatures.map((cityData, index) => {
            if (cityData.feature) {
              // Місто як полігон
              const paths = geometryToPaths(cityData.feature.geometry, projectPoint);
              const cityName = cityData.alert.title;
              return paths.map((path, pi) => (
                <path
                  key={`city-${index}-${pi}`}
                  d={path}
                  fill={ALERT_COLOR}
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeOpacity={0.9}
                  fillOpacity={0.85}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleCityClick(cityData.alert, cityName)}
                >
                  <title>{cityName}</title>
                </path>
              ));
            } else if (cityData.marker) {
              // Місто як marker
              const [x, y] = projectPoint(cityData.marker.lon, cityData.marker.lat);
              const cityName = cityData.alert.title;
              return (
                <g key={`city-marker-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={8}
                    fill={ALERT_COLOR}
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleCityClick(cityData.alert, cityName)}
                  >
                    <title>{cityName}</title>
                  </circle>
                  <circle
                    cx={x}
                    cy={y}
                    r={4}
                    fill="#ffffff"
                    pointerEvents="none"
                  />
                </g>
              );
            }
            return null;
          })}

          {/* Rayon borders — світлі межі районів поверх */}
          {features.map((feature: any, index: number) => {
            const paths = geometryToPaths(feature.geometry, projectPoint);
            return paths.map((path, pathIndex) => (
              <path
                key={`rayon-border-${index}-${pathIndex}`}
                d={path}
                fill="none"
                stroke="#ffffff"
                strokeWidth={1.5}
                strokeOpacity={0.8}
                pointerEvents="none"
              />
            ));
          })}

          {/* Oblast borders — темні межі областей поверх */}
          {geo?.regiony?.features?.map((feature: any, index: number) =>
            geometryToPaths(feature.geometry, projectPoint).map((path, pi) => (
              <path
                key={`region-${index}-${pi}`}
                d={path}
                fill="none"
                stroke="#455a64"
                strokeWidth={3}
                strokeOpacity={1}
                pointerEvents="none"
              />
            ))
          )}

          {/* Oblast labels */}
          {showLabels &&
            regionyLabels.map((label: any, index: number) => (
              <text
                key={`region-label-${index}`}
                x={label.x}
                y={label.y}
                fontSize="9"
                fill="#1a1a1a"
                fontWeight="600"
                textAnchor="middle"
                pointerEvents="none"
                style={{ userSelect: "none", fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                {label.name}
              </text>
            ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/95 rounded shadow-lg sm:shadow-xl p-1.5 sm:p-3 border sm:border-2 border-gray-300 text-[10px] sm:text-xs">
          <div className="font-semibold sm:font-bold text-gray-900 mb-0.5 sm:mb-2">Легенда:</div>
          <div className="space-y-0.5 sm:space-y-1.5">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-4 h-2 sm:w-8 sm:h-4 bg-red-500 rounded border sm:border-2 border-gray-300" />
              <span className="font-semibold text-red-700">Тривога</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-4 h-2 sm:w-8 sm:h-4 bg-gray-300 rounded border sm:border-2 border-gray-300" />
              <span className="text-gray-700">Без тривоги</span>
            </div>
          </div>
        </div>

        {/* Rayon detail popup */}
        {selectedRayon && (() => {
          const { feature, index } = selectedRayon;
          const alertInfo = checkAlert(feature, activeLocations);
          const oblastAlert = rayonToOblastAlert.get(index);

          const finalAlert = alertInfo || oblastAlert;

          return (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-lg shadow-xl p-3 sm:p-4 max-w-[90%] sm:max-w-sm border-2 border-blue-900 z-10">
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">{formatLocationDisplayName(getRayonName(feature) || getGeoName(feature))}</h4>
                <button onClick={() => setSelectedRayon(null)} className="text-gray-500 hover:text-gray-700 ml-2">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="pt-2 border-t border-gray-200">
                  {finalAlert ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="font-bold text-red-600">ТРИВОГА!</span>
                      </div>
                      <div className="text-xs text-red-800 mb-1">
                        Загроза: {alertTypeLabels[finalAlert.alertType] || finalAlert.alertType || "Невідома загроза"}
                      </div>
                      <div className="text-xs text-red-700 mb-1">
                        Поширюється на: {getSpreadLabel(finalAlert, getGeoName(feature))}
                      </div>
                      {(finalAlert.type === "hromada" || finalAlert.type === "city") && (
                        <div className="text-xs text-red-800 mt-2">
                          Локація: {formatLocationDisplayName((finalAlert as any).originalTitle || finalAlert.title)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-green-700 font-semibold">✓ Тривоги немає</div>
                  )}
                </div>

                {lastUpdate && (
                  <div className="pt-2 text-xs text-gray-500">
                    Оновлено: {lastUpdate.toLocaleTimeString("uk-UA")}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* City detail popup */}
        {selectedCity && (() => {
          const cityAlert = selectedCity;
          const hasAlert = cityAlert.alertType && cityAlert.alertType !== "";
          const isSpecialCity = (cityAlert as any).isSpecialCity;
          const sourceAlert = (cityAlert as any).sourceAlert;
          const isOblastAlert = sourceAlert && sourceAlert.type === "oblast";

          return (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-lg shadow-xl p-3 sm:p-4 max-w-[90%] sm:max-w-sm border-2 border-blue-900 z-10">
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">{formatLocationDisplayName(cityAlert.title)}</h4>
                <button onClick={() => setSelectedCity(null)} className="text-gray-500 hover:text-gray-700 ml-2">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="pt-2 border-t border-gray-200">
                  {hasAlert ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="font-bold text-red-600">ТРИВОГА!</span>
                      </div>
                      <div className="text-xs text-red-800 mb-1">
                        Загроза: {alertTypeLabels[cityAlert.alertType] || cityAlert.alertType || "Невідома загроза"}
                      </div>
                      <div className="text-xs text-red-700 mb-1">
                        Поширюється на: {isSpecialCity ? getSpreadLabel(cityAlert, cityAlert.title) : "місто"}
                      </div>
                      {isSpecialCity && isOblastAlert && (
                        <div className="text-xs text-orange-700 mt-2 italic">
                          Причина: тривога оголошена на рівні {formatLocationGenitive(sourceAlert.oblast || sourceAlert.title)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-green-700 font-semibold">✓ Тривоги немає</div>
                  )}
                </div>

                {lastUpdate && (
                  <div className="pt-2 text-xs text-gray-500">
                    Оновлено: {lastUpdate.toLocaleTimeString("uk-UA")}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}