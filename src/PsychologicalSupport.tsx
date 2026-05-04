import { Link, useNavigate } from "react-router";
import { ShieldAlert, Heart, Wind, Eye, HelpCircle, Play, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export function PsychologicalSupport() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    setIsLoggedIn(!!authToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    setIsLoggedIn(false);
    navigate('/');
  };

  const quickHelp = [
    {
      title: "Назвіть свої емоції",
      icon: Heart,
      action: "/emotion-exercise"
    },
    {
      title: "Озирніться навколо та назвіть предмети",
      icon: Eye,
      action: "/grounding-exercise"
    },
    {
      title: "Сфокусуйтесь на диханні",
      icon: Wind,
      action: "/breathing-exercise"
    },
    {
      title: "Розслабте тіло",
      icon: Heart,
      action: "/relaxation-exercise"
    }
  ];

  const handleQuickAction = (action: string | null) => {
    if (!action) {
      alert("Виконуйте цю дію повільно та усвідомлено");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-green-50">
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

      <main className="flex-1 px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Heart className="w-10 h-10 text-blue-600" />
              <h2 className="text-4xl font-bold text-gray-900">Психологічна підтримка</h2>
            </div>
            <p className="text-gray-600">Ви не самі. Ми тут, щоб допомогти</p>
          </div>

          {/* Main: Breathing Exercise */}
          <Link
            to="/breathing-exercise"
            className="block mb-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl p-8 text-white hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Wind className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">Дихальна вправа</h3>
                <p className="text-blue-100">Заспокойтесь через контрольоване дихання</p>
              </div>
            </div>
            <button className="w-full py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
              <Play className="w-6 h-6" />
              Почати
            </button>
          </Link>

          {/* Quick Help */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Швидка допомога</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickHelp.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-6 h-6 text-blue-600" />
                      <p className="font-medium text-gray-900">{item.title}</p>
                    </div>
                    {item.action ? (
                      <Link
                        to={item.action}
                        className="block w-full py-2 bg-blue-100 text-blue-900 rounded-lg font-semibold text-center hover:bg-blue-200 transition-colors"
                      >
                        Почати
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleQuickAction(item.action)}
                        className="w-full py-2 bg-blue-100 text-blue-900 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
                      >
                        Почати
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/report"
              className="py-4 bg-red-600 text-white rounded-xl font-bold text-center hover:bg-red-700 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              Отримати допомогу
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
