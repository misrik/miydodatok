import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Phone, Home, AlertTriangle, User, BookOpen, Siren, Heart } from "lucide-react";
import { useState, useEffect } from "react";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken);
  }, [location]);

  const navItems = [
    { path: "/", icon: Home, label: "Головна", requiresAuth: false },
    { path: "/data", icon: BookOpen, label: "Інструкції", requiresAuth: false },
    { path: "/alert", icon: Siren, label: "Тривога", requiresAuth: false },
    { path: "/psychological-support", icon: Heart, label: "Підтримка", requiresAuth: false },
    { path: "/report", icon: AlertTriangle, label: "Повідомити", requiresAuth: true },
    { path: "/profile", icon: User, label: "Профіль", requiresAuth: true },
  ];

  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      if (confirm("Для доступу до цієї функції потрібно увійти в аккаунт. Перейти на сторінку входу?")) {
        navigate("/login");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Outlet />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-6xl mx-auto px-2">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === "/psychological-support" && (
                  location.pathname === "/breathing-exercise" ||
                  location.pathname === "/grounding-exercise" ||
                  location.pathname === "/relaxation-exercise" ||
                  location.pathname === "/emotion-exercise"
                ));
              const isDisabled = item.requiresAuth && !isAuthenticated;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all ${
                    isActive
                      ? "text-blue-900 bg-blue-50"
                      : isDisabled
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:text-blue-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}