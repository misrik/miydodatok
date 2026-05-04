import { Link, useNavigate } from "react-router";
import { ShieldAlert, ArrowLeft, Wind, Eye, Heart } from "lucide-react";
import { useState } from "react";

export function EmotionExercise() {
  const navigate = useNavigate();
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);

  const emotions = [
    "Тривога",
    "Страх",
    "Паніка",
    "Сум",
    "Злість",
    "Розгубленість",
    "Напруга",
    "Інше"
  ];

  const exercises = [
    {
      title: "Сфокусуйтесь на диханні",
      icon: Wind,
      action: "/breathing-exercise"
    },
    {
      title: "Озирніться навколо",
      icon: Eye,
      action: "/grounding-exercise"
    },
    {
      title: "Розслабте тіло",
      icon: Heart,
      action: "/relaxation-exercise"
    }
  ];

  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };

  const handleContinue = () => {
    setShowRecommendations(true);
  };

  const handleBack = () => {
    setShowRecommendations(false);
  };

  if (showRecommendations) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-green-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={handleBack}
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Давайте спробуємо заспокоїтись разом</h2>
            </div>

            {/* Supportive Message */}
            <div className="mb-8 bg-white rounded-2xl shadow-md p-6 text-center">
              <p className="text-gray-900 font-medium mb-2 flex items-center justify-center gap-2">
                Це нормально відчувати такі емоції
                <span className="text-xl">🫂</span>
              </p>
              <p className="text-gray-600 text-sm">
                Спробуйте трохи сповільнитись і зосередитись
              </p>
            </div>

            {/* Exercise Cards */}
            <div className="space-y-4 mb-8">
              {exercises.map((exercise, index) => {
                const Icon = exercise.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{exercise.title}</h3>
                    </div>
                    <Link
                      to={exercise.action}
                      className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-center transition-colors"
                    >
                      Почати вправу
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate("/psychological-support")}
              className="w-full py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors shadow-lg"
            >
              Назад
            </button>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Назвіть свої емоції</h2>
            <p className="text-gray-600">Зверніть увагу на те, що ви зараз відчуваєте</p>
          </div>

          {/* Emotion Chips */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {emotions.map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => toggleEmotion(emotion)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    selectedEmotions.includes(emotion)
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          {/* Description Field */}
          {selectedEmotions.length > 0 && (
            <div className="mb-8 animate-fade-in">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишіть свій стан (за бажанням)"
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                rows={4}
              />
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={selectedEmotions.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
              selectedEmotions.length > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Продовжити
          </button>
        </div>
      </main>
    </div>
  );
}
