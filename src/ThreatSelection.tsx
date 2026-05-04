import { Link, useParams, useNavigate } from "react-router";
import { ShieldAlert, ArrowLeft, Droplets, Mountain, Wind, Flame, Loader, Sun, CloudSnow, Bomb, Radiation, Car, Building, Skull, AlertTriangle, Siren, Activity, Heart, AlertCircle } from "lucide-react";

export function ThreatSelection() {
  const { category } = useParams();
  const navigate = useNavigate();

  const threats = {
    natural: [
      { id: "flood", name: "Повінь", icon: Droplets, color: "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200" },
      { id: "earthquake", name: "Землетрус", icon: Mountain, color: "bg-orange-100 border-orange-300 text-orange-900 hover:bg-orange-200" },
      { id: "hurricane", name: "Ураган / шторм", icon: Wind, color: "bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200" },
      { id: "wildfire", name: "Лісова пожежа", icon: Flame, color: "bg-red-100 border-red-300 text-red-900 hover:bg-red-200" },
      { id: "landslide", name: "Зсув ґрунту", icon: Mountain, color: "bg-yellow-100 border-yellow-300 text-yellow-900 hover:bg-yellow-200" },
      { id: "snow", name: "Сильний сніг / ожеледиця", icon: CloudSnow, color: "bg-cyan-100 border-cyan-300 text-cyan-900 hover:bg-cyan-200" },
      { id: "heatwave", name: "Посуха / спека", icon: Sun, color: "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200" }
    ],
    technological: [
      { id: "fire", name: "Пожежа в будівлі", icon: Flame, color: "bg-red-100 border-red-300 text-red-900 hover:bg-red-200" },
      { id: "explosion", name: "Вибух", icon: Bomb, color: "bg-orange-100 border-orange-300 text-orange-900 hover:bg-orange-200" },
      { id: "chemical", name: "Хімічна аварія", icon: Skull, color: "bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200" },
      { id: "radiation", name: "Радіаційна аварія", icon: Radiation, color: "bg-yellow-100 border-yellow-300 text-yellow-900 hover:bg-yellow-200" },
      { id: "transport", name: "Аварія на транспорті", icon: Car, color: "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200" },
      { id: "collapse", name: "Обвал будівлі", icon: Building, color: "bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200" }
    ],
    military: [
      { id: "shelling", name: "Обстріл", icon: Bomb, color: "bg-red-100 border-red-300 text-red-900 hover:bg-red-200" },
      { id: "air-raid", name: "Повітряна тривога", icon: Siren, color: "bg-orange-100 border-orange-300 text-orange-900 hover:bg-orange-200" },
      { id: "blast", name: "Вибух", icon: AlertTriangle, color: "bg-yellow-100 border-yellow-300 text-yellow-900 hover:bg-yellow-200" },
      { id: "mine", name: "Мінна небезпека", icon: AlertTriangle, color: "bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200" },
      { id: "evacuation", name: "Укриття / евакуація", icon: ShieldAlert, color: "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200" }
    ],
    medical: [
      { id: "outbreak", name: "Спалах інфекційного захворювання", icon: AlertCircle, color: "bg-red-100 border-red-300 text-red-900 hover:bg-red-200" },
      { id: "poisoning", name: "Масове отруєння", icon: Skull, color: "bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200" },
      { id: "epidemic", name: "Епідемія", icon: Activity, color: "bg-orange-100 border-orange-300 text-orange-900 hover:bg-orange-200" },
      { id: "pandemic", name: "Пандемія", icon: Heart, color: "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200" }
    ]
  };

  const categoryNames = {
    natural: "Природні катастрофи",
    technological: "Техногенні катастрофи",
    military: "Воєнна категорія",
    medical: "Медична надзвичайна ситуація"
  };

  const currentThreats = threats[category as keyof typeof threats] || [];
  const categoryName = categoryNames[category as keyof typeof categoryNames] || "Категорія";

  const handleThreatSelect = (threatId: string) => {
    navigate("/result", { state: { threat: threatId, category } });
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
            <Link
              to="/data"
              className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Назад
            </Link>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h2>
            <p className="text-xl text-gray-600">Оберіть конкретний тип загрози</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentThreats.map((threat) => {
              const Icon = threat.icon;
              return (
                <button
                  key={threat.id}
                  onClick={() => handleThreatSelect(threat.id)}
                  className={`${threat.color} p-6 rounded-2xl border-2 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-left group`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-full h-full" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold">{threat.name}</h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
