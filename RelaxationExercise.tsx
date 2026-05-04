import { Link, useNavigate } from "react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

interface Step {
  number: number;
  title: string;
  description: string;
  isBreathing?: boolean;
}

export function RelaxationExercise() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "exhale" | null>(null);
  const [canProceed, setCanProceed] = useState(false);

  const steps: Step[] = [
    {
      number: 1,
      title: "Стисніть плечі",
      description: "Підніміть плечі вгору і трохи напружте їх",
      isBreathing: false
    },
    {
      number: 2,
      title: "Різко розслабте плечі",
      description: "Відпустіть напругу і дайте плечам опуститися",
      isBreathing: false
    },
    {
      number: 3,
      title: "Розслабте щелепу",
      description: "Злегка відкрийте рот і відпустіть напругу в щелепі",
      isBreathing: false
    },
    {
      number: 4,
      title: "Опустіть руки",
      description: "Дайте рукам вільно звисати вздовж тіла",
      isBreathing: false
    },
    {
      number: 5,
      title: "Зробіть повільний вдих і видих",
      description: "Глибоко вдихніть через ніс, повільно видихніть через рот",
      isBreathing: true
    }
  ];

  // Таймер для кожного кроку
  useEffect(() => {
    setProgress(0);
    setCanProceed(false);
    setBreathPhase(null);

    const currentStepData = steps[currentStep];
    const DURATION = 6000; // 6 секунд

    if (!currentStepData.isBreathing) {
      // Звичайний крок - одна стрічка
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / DURATION) * 100, 100);
        setProgress(newProgress);

        if (elapsed >= DURATION) {
          clearInterval(interval);
          setCanProceed(true);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      // Крок дихання - дві стрічки послідовно
      setBreathPhase("inhale");

      // Фаза вдиху
      const startTimeInhale = Date.now();
      const intervalInhale = setInterval(() => {
        const elapsed = Date.now() - startTimeInhale;
        const newProgress = Math.min((elapsed / DURATION) * 100, 100);
        setProgress(newProgress);

        if (elapsed >= DURATION) {
          clearInterval(intervalInhale);
          // Почати фазу видиху
          setBreathPhase("exhale");
          setProgress(0);

          const startTimeExhale = Date.now();
          const intervalExhale = setInterval(() => {
            const elapsedExhale = Date.now() - startTimeExhale;
            const newProgressExhale = Math.min((elapsedExhale / DURATION) * 100, 100);
            setProgress(newProgressExhale);

            if (elapsedExhale >= DURATION) {
              clearInterval(intervalExhale);
              setCanProceed(true);
            }
          }, 50);

          return () => clearInterval(intervalExhale);
        }
      }, 50);

      return () => clearInterval(intervalInhale);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRepeat = () => {
    setCurrentStep(0);
    setIsCompleted(false);
  };

  const currentStepData = steps[currentStep];

  if (isCompleted) {
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
          <div className="max-w-xl w-full text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                Ви зробили невеликий крок, щоб допомогти собі
                <span className="text-4xl">🤍</span>
              </h2>
              <p className="text-xl text-gray-600">Як ви себе почуваєте зараз?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleRepeat}
                className="py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                Повторити
              </button>
              <button
                onClick={() => navigate("/psychological-support")}
                className="py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                Назад
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Розслабте тіло</h2>
            <p className="text-gray-600">Зніміть напругу через прості дії</p>
          </div>

          {/* Current Step Instruction */}
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {currentStepData.title}
            </h3>
            <p className="text-xl text-gray-600">
              {currentStepData.description}
            </p>
          </div>

          {/* Progress Bars */}
          <div className="mb-8">
            {!currentStepData.isBreathing ? (
              // Звичайний крок - одна стрічка
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            ) : (
              // Крок дихання - дві стрічки
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Вдих</div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-100 ${
                        breathPhase === "inhale" ? "bg-blue-500" : breathPhase === "exhale" ? "bg-blue-500" : "bg-gray-200"
                      }`}
                      style={{ width: breathPhase === "inhale" ? `${progress}%` : breathPhase === "exhale" ? "100%" : "0%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Видих</div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full bg-green-500 transition-all duration-100 ${
                        breathPhase === "exhale" ? "" : "opacity-50"
                      }`}
                      style={{ width: breathPhase === "exhale" ? `${progress}%` : "0%" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Indicators (Non-clickable) */}
          <div className="flex justify-center gap-4 mb-8">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <div
                  key={step.number}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full text-2xl font-bold transition-all duration-300 flex items-center justify-center ${
                    isCompleted || isCurrent
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.number}
                </div>
              );
            })}
          </div>

          {/* Next Button */}
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`px-16 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                canProceed
                  ? "bg-green-600 hover:bg-green-700 text-white hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {currentStep < steps.length - 1 ? "Далі" : "Завершити"}
            </button>
          </div>

          {/* Helper Text */}
          {currentStep < steps.length - 1 && (
            <div className="mt-12 bg-white rounded-2xl shadow-md p-6 text-center">
              <p className="text-gray-700 text-sm">
                {canProceed ? "Натисніть 'Далі' щоб продовжити" : "Виконуйте дію повільно та усвідомлено"}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Крок {currentStep + 1} з {steps.length}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
