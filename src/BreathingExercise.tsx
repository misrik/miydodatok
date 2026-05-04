import { Link, useNavigate } from "react-router";
import { ShieldAlert, ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function BreathingExercise() {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [progress, setProgress] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const phaseDurations = {
    inhale: 4000,   // 4 секунди вдих
    hold: 4000,     // 4 секунди затримка
    exhale: 6000    // 6 секунд видих
  };

  const phaseTexts = {
    inhale: "Вдих",
    hold: "Затримка",
    exhale: "Видих"
  };

  const phaseDescriptions = {
    inhale: "Повільно вдихайте через ніс",
    hold: "Затримайте дихання",
    exhale: "Повільно видихайте через рот"
  };

  useEffect(() => {
    if (isRunning) {
      const duration = phaseDurations[phase];
      const startTime = Date.now();

      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);

        if (elapsed >= duration) {
          // Перехід до наступної фази
          if (phase === "inhale") {
            setPhase("hold");
          } else if (phase === "hold") {
            setPhase("exhale");
          } else {
            setPhase("inhale");
            setCompletedCycles((prev) => prev + 1);
          }
          setProgress(0);
        }
      }, 30);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isRunning, phase]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase("inhale");
    setProgress(0);
    setCompletedCycles(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Розмір кола залежно від фази
  const getCircleScale = () => {
    if (phase === "inhale") {
      // Плавна крива для вдиху від 0.5 до 1
      const easeProgress = Math.sin((progress / 100) * (Math.PI / 2));
      return 0.5 + easeProgress * 0.5;
    } else if (phase === "exhale") {
      // Плавна крива для видиху від 1 до 0.5
      const easeProgress = Math.sin((progress / 100) * (Math.PI / 2));
      return 1 - easeProgress * 0.5;
    }
    return 1; // hold - статичний розмір
  };

  const circleScale = getCircleScale();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-green-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-blue-900" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-blue-900" />
            <h1 className="text-2xl font-bold text-blue-900">SafeWay</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 pb-24">
        <div className="max-w-xl w-full">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Дихальна вправа</h2>
            <p className="text-gray-600">Слідуйте за ритмом дихання</p>
          </div>

          {/* Breathing Circle */}
          <div className="flex items-center justify-center mb-8">
            <div
              className={`relative flex items-center justify-center rounded-full`}
              style={{
                width: `${300 * circleScale}px`,
                height: `${300 * circleScale}px`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 1s ease-in-out',
                backgroundColor:
                  phase === "inhale" ? "#60a5fa" :
                  phase === "hold" ? "#c084fc" :
                  "#4ade80",
                boxShadow: `0 0 ${40 * circleScale}px ${20 * circleScale}px ${
                  phase === "inhale" ? "rgba(96, 165, 250, 0.5)" :
                  phase === "hold" ? "rgba(192, 132, 252, 0.5)" :
                  "rgba(74, 222, 128, 0.5)"
                }`
              }}
            >
              <div className="text-center px-4">
                <div className="text-4xl font-bold text-white mb-2">
                  {phaseTexts[phase]}
                </div>
                <div className="text-white text-base opacity-90">
                  {phaseDescriptions[phase]}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Info */}
          <div className="text-center mb-8">
            <div className="text-lg text-gray-700 mb-2">
              Завершено циклів: <span className="font-bold text-blue-600">{completedCycles}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  phase === "inhale" ? "bg-blue-500" :
                  phase === "hold" ? "bg-purple-500" :
                  "bg-green-500"
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-colors flex items-center gap-2"
              >
                <Play className="w-6 h-6" />
                {completedCycles === 0 ? "Почати" : "Продовжити"}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-colors flex items-center gap-2"
              >
                <Pause className="w-6 h-6" />
                Пауза
              </button>
            )}

            <button
              onClick={handleReset}
              className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              Скинути
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-3">Як виконувати вправу:</h3>
            <ol className="space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <span>Знайдіть зручне місце та сядьте або ляжте</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <span>Натисніть "Почати" та слідуйте за колом</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <span>Коло збільшується - вдихайте через ніс</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">4.</span>
                <span>Коло статичне - затримайте дихання</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">5.</span>
                <span>Коло зменшується - видихайте через рот</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">6.</span>
                <span>Виконайте 5-10 циклів для заспокоєння</span>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
