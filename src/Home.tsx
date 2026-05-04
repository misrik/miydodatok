import { Link, useNavigate } from "react-router";
import { ShieldAlert, BookOpen, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export function Home() {
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-blue-900" />
            <h1 className="text-2xl font-bold text-blue-900">SafeWay</h1>
          </div>
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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <ShieldAlert className="w-24 h-24 text-blue-900 mx-auto mb-6" />
            <h2 className="text-5xl font-bold text-gray-900 mb-4">SafeWay</h2>
          </div>

          <div className="flex flex-col gap-4 justify-center max-w-md mx-auto">
            <Link
              to="/report"
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-lg font-bold transition-colors shadow-lg"
            >
              🚨 Повідомити про небезпеку
            </Link>
            <Link
              to="/category-selection"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-blue-900 border-2 border-blue-900 rounded-xl text-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Переглянути інструкції
            </Link>
            <Link
              to="/psychological-support"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-blue-900 border-2 border-blue-900 rounded-xl text-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              💚 Психологічна підтримка
            </Link>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-red-600 rounded-xl text-lg font-semibold transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <LogOut className="w-5 h-5" />
                Вийти
              </button>
            ) : (
              <Link
                to="/login"
                className="px-8 py-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-lg font-semibold transition-colors mt-4"
              >
                Увійти
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
