import { Link } from "react-router";
import { ShieldAlert, Flame, Droplets, Mountain, Radiation, ChevronRight } from "lucide-react";

export function Instructions() {
  const instructions = [
    {
      id: "fire",
      name: "Пожежа",
      icon: Flame,
      color: "bg-red-100 border-red-300 text-red-900 hover:bg-red-200",
      description: "Дії при виникненні пожежі в будинку або приміщенні"
    },
    {
      id: "flood",
      name: "Повінь",
      icon: Droplets,
      color: "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200",
      description: "Як діяти при загрозі або під час повені"
    },
    {
      id: "earthquake",
      name: "Землетрус",
      icon: Mountain,
      color: "bg-orange-100 border-orange-300 text-orange-900 hover:bg-orange-200",
      description: "Інструкції з безпеки під час землетрусу"
    },
    {
      id: "chemical",
      name: "Хімічна аварія",
      icon: Radiation,
      color: "bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200",
      description: "Правила поведінки при хімічних викидах"
    }
  ];

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {instructions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`${item.color} p-6 rounded-2xl border-2 transition-all shadow-lg text-left group`}
                  onClick={() => alert(`Детальні інструкції для "${item.name}" будуть додані пізніше`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="w-12 h-12" />
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
                  <p className="text-base opacity-80">{item.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
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
