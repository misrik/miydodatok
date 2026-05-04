import { Link, useNavigate } from "react-router";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../utils/supabase/client";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Обробка помилок від Supabase
        if (error.message.includes("Invalid login credentials")) {
          setError("Неправильний email або пароль");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Підтвердіть email перед входом");
        } else {
          setError(error.message || "Помилка входу. Спробуйте ще раз");
        }
        setIsLoading(false);
        return;
      }

      if (data.user && data.session) {
        // Зберегти токен та дані користувача
        localStorage.setItem('authToken', data.session.access_token);

        const userProfile = {
          id: data.user.id,
          name: data.user.user_metadata?.name || "",
          email: data.user.email
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        // Успішний вхід
        navigate("/profile");
      } else {
        setError("Помилка входу. Спробуйте ще раз");
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Вхід</h2>
            <p className="text-gray-600 mb-8">Увійдіть у свій акаунт</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <p className="text-red-900 font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Запам'ятати мене
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Вхід...
                  </>
                ) : (
                  "Увійти"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600">
              Немає акаунту?{" "}
              <Link to="/register" className="text-blue-900 hover:underline font-semibold">
                Зареєструватися
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
