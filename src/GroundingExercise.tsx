import { Link, useNavigate } from "react-router";
import { ShieldAlert, ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

interface Step {
  number: number;
  title: string;
  count: number;
}

export function GroundingExercise() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [activatedCircles, setActivatedCircles] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps: Step[] = [
    { number: 1, title: "Знайдіть 5 речей, які ви бачите", count: 5 },
    { number: 2, title: "Знайдіть 4 речі, які ви відчуваєте", count: 4 },
    { number: 3, title: "Знайдіть 3 звуки, які ви чуєте", count: 3 },
    { number: 4, title: "Знайдіть 2 запахи", count: 2 },
    { number: 5, title: "Зверніть увагу на 1 смак або відчуття", count: 1 }
  ];

  const handleCircleClick = (index: number) => {
    // Можна активувати тільки наступний кружечок по порядку
    if (index === activatedCircles.length) {
      setActivatedCircles([...activatedCircles, index]);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setActivatedCircles([]);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRepeat = () => {
    setCurrentStep(0);
    setActivatedCircles([]);
    setIsCompleted(false);
  };

  const currentStepData = steps[currentStep];
  const canProceed = activatedCircles.length === currentStepData?.count;

  if (isCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-blue-50">
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
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Ви впорались 💙</h2>
              <p className="text-xl text-gray-600">Зверніть увагу на свій стан зараз</p>
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
                Повернутись
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Фокус на теперішньому</h2>
            <p className="text-gray-600">Озирніться навколо та виконайте прості кроки</p>
          </div>

          {/* Progress Indicator */}
          <div className="text-center mb-8">
            <p className="text-lg font-semibold text-blue-900">
              Крок {currentStep + 1} з {steps.length}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Step Task */}
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
          </div>

          {/* Interactive Circles */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {Array.from({ length: currentStepData.count }).map((_, index) => {
              const isActivated = activatedCircles.includes(index);
              const canActivate = index === activatedCircles.length;

              return (
                <button
                  key={index}
                  onClick={() => handleCircleClick(index)}
                  disabled={!canActivate && !isActivated}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full text-2xl md:text-3xl font-bold transition-all duration-300 ${
                    isActivated
                      ? "bg-blue-600 text-white scale-110 shadow-lg"
                      : canActivate
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105 cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <div className="flex justify-center">
            {canProceed ? (
              <button
                onClick={handleNext}
                className="px-12 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all hover:scale-105"
              >
                {currentStep < steps.length - 1 ? "Далі" : "Завершити"}
              </button>
            ) : (
              <div className="px-12 py-4 bg-gray-300 text-gray-500 rounded-2xl font-bold text-lg cursor-not-allowed">
                Виконайте завдання
              </div>
            )}
          </div>

          {/* Helper Text */}
          <div className="mt-12 bg-white rounded-2xl shadow-md p-6 text-center">
            <p className="text-gray-700 text-sm">
              Натискайте кружечки по черзі, коли знаходите кожен предмет, звук або відчуття
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
