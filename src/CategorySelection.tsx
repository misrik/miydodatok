import { Link } from "react-router";
import { ShieldAlert, Cloud, Factory, Siren, Heart } from "lucide-react";

export function CategorySelection() {
  const categories = [
    {
      id: "natural",
      name: "Природні катастрофи",
      description: "Пов'язані з природними явищами",
      icon: Cloud,
      color: "bg-blue-50 border-blue-300 hover:bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      id: "technological",
      name: "Техногенні катастрофи",
      description: "Спричинені діяльністю людини: аварії, пожежі, вибухи, радіація",
      icon: Factory,
      color: "bg-orange-50 border-orange-300 hover:bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      id: "military",
      name: "Воєнна категорія",
      description: "Обстріли, вибухи, військові загрози",
      icon: Siren,
      color: "bg-red-50 border-red-300 hover:bg-red-100",
      iconColor: "text-red-600"
    },
    {
      id: "medical",
      name: "Медична надзвичайна ситуація",
      description: "Епідемії, спалахи захворювань, масові отруєння",
      icon: Heart,
      color: "bg-green-50 border-green-300 hover:bg-green-100",
      iconColor: "text-green-600"
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
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Оберіть категорію</h2>
            <p className="text-xl text-gray-600">
              Виберіть тип надзвичайної ситуації для отримання рекомендацій
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/threat-selection/${category.id}`}
                  className={`${category.color} border-2 rounded-2xl p-8 transition-all shadow-lg hover:shadow-xl hover:scale-105 group`}
                >
                  <div className="flex flex-col items-center text-center h-full">
                    <div className={`w-20 h-20 ${category.iconColor} mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-full h-full" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {category.name}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* General Recommendations */}
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
