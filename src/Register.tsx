import { Link, useNavigate } from "react-router";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../utils/supabase/client";

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Валідація пароля
    if (password.length < 6) {
      setError("Пароль повинен містити мінімум 6 символів");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        // Обробка помилок від Supabase
        if (error.message.includes("already registered")) {
          setError("Користувач з таким email вже існує");
        } else if (error.message.includes("Password")) {
          setError("Пароль повинен містити мінімум 6 символів");
        } else {
          setError(error.message || "Помилка реєстрації. Спробуйте ще раз");
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Зберегти токен та дані користувача
        if (data.session?.access_token) {
          localStorage.setItem('authToken', data.session.access_token);
        }

        const userProfile = {
          id: data.user.id,
          name,
          email: data.user.email
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        // Успішна реєстрація
        navigate("/profile");
      } else {
        setError("Помилка створення користувача");
        setIsLoading(false);
      }
    } catch (err) {
      // Помилка мережі або сервера
      setError("Не вдалося підключитися до сервера. Перевірте інтернет-з'єднання");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <ShieldAlert className="w-8 h-8 text-blue-900" />
            <h1 className="text-2xl font-bold text-blue-900">SafeWay</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Реєстрація</h2>
            <p className="text-gray-600 mb-8">Створіть новий акаунт</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <p className="text-red-900 font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ім'я
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                  placeholder="Ваше ім'я"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <p className="mt-2 text-sm text-gray-500">Мінімум 6 символів</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Створення акаунту...
                  </>
                ) : (
                  "Створити акаунт"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600">
              Вже є акаунт?{" "}
              <Link to="/login" className="text-blue-900 hover:underline font-semibold">
                Увійти
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
