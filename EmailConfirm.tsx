import { Link, useLocation, useNavigate } from "react-router";
import { ShieldAlert, Mail, ArrowLeft, CheckCircle, User, Droplet, Phone, AlertCircle, Baby, PawPrint } from "lucide-react";
import { useState, useEffect } from "react";

export function EmailConfirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportData = location.state || {};

  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Нові поля
  const [urgencyLevel, setUrgencyLevel] = useState(3);
  const [whoNeedsHelp, setWhoNeedsHelp] = useState("Я сам/сама");
  const [whoNeedsHelpOther, setWhoNeedsHelpOther] = useState("");
  const [sendTo, setSendTo] = useState<"emergency" | "service" | null>(null);

  // Функція для отримання ключа типу небезпеки
  const getDisasterKey = (type: string, specific: string): string => {
    const mapping: Record<string, Record<string, string>> = {
      natural: {
        "Повінь": "flood",
        "Землетрус": "earthquake",
        "Ураган / шторм": "hurricane",
        "Лісова пожежа": "wildfire",
        "Зсув ґрунту": "landslide",
        "Сильний сніг / ожеледиця": "snow",
        "Посуха / спека": "heatwave"
      },
      technological: {
        "Пожежа в будівлі": "fire",
        "Вибух": "explosion",
        "Хімічна аварія": "chemical",
        "Радіаційна аварія": "radiation",
        "Аварія на транспорті": "transport",
        "Обвал будівлі": "collapse"
      },
      military: {
        "Обстріл": "shelling",
        "Повітряна тривога": "air-raid",
        "Вибух": "blast",
        "Мінна небезпека": "mine",
        "Укриття / евакуація": "evacuation"
      },
      medical: {
        "Спалах інфекційного захворювання": "outbreak",
        "Масове отруєння": "poisoning",
        "Епідемія": "epidemic",
        "Пандемія": "pandemic"
      }
    };

    return mapping[type]?.[specific] || "fire";
  };

  // Завантажити дані профілю
  const [profileData, setProfileData] = useState<any>({
    name: "",
    bloodType: "",
    allergies: "",
    chronicDiseases: "",
    medications: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyEmail: "",
    emergencyRelation: "",
    children: [],
    pets: []
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setProfileData(profile);
      // Якщо є email в профілі, використовуємо його
      if (profile.email) {
        setEmail(profile.email);
      }
    }
  }, []);

  // Створити список опцій "Кому потрібна допомога"
  const whoNeedsHelpOptions = ["Я сам/сама"];
  if (profileData.children && profileData.children.length > 0) {
    profileData.children.forEach((child: any, index: number) => {
      whoNeedsHelpOptions.push(`Дитина: ${child.name || `Дитина ${index + 1}`}`);
    });
  }
  if (profileData.emergencyName) {
    whoNeedsHelpOptions.push(`Екстрений контакт: ${profileData.emergencyName}`);
  }
  whoNeedsHelpOptions.push("Інше");

  const disasterTypeLabels: Record<string, string> = {
    natural: "Природна катастрофа",
    technological: "Техногенна катастрофа",
    military: "Воєнна загроза",
    medical: "Медична надзвичайна ситуація"
  };

  const helpTypeLabels: Record<string, string> = {
    medical: "Медична допомога",
    psychological: "Психологічна допомога",
    evacuation: "Допомога з евакуацією",
    shelter: "Потрібне укриття",
    food: "Харчування та вода",
    mobility: "У разі неможливості самостійно пересуватися",
    other: "Інше"
  };

  const handleSend = async (e: React.FormEvent, sendType: "emergency" | "service") => {
    e.preventDefault();
    setSendTo(sendType);
    setIsSending(true);

    const recipientEmail = sendType === "emergency" ? profileData.emergencyEmail : "helpkpi@ukr.net";

    // Формуємо повідомлення для email
    const helpTypesText = reportData.helpTypes && reportData.helpTypes.length > 0
      ? reportData.helpTypes.map((type: string) => helpTypeLabels[type]).join(', ')
      : 'Не вказано';

    // Формуємо медичну інформацію
    let medicalInfo = '';
    if (profileData.name) {
      medicalInfo = `

ОСОБИСТА ТА МЕДИЧНА ІНФОРМАЦІЯ:
Ім'я: ${profileData.name}
${profileData.bloodType ? `Група крові: ${profileData.bloodType}` : ''}
${profileData.allergies ? `⚠️ АЛЕРГІЇ: ${profileData.allergies}` : ''}
${profileData.chronicDiseases ? `Хронічні захворювання: ${profileData.chronicDiseases}` : ''}
${profileData.medications ? `Ліки: ${profileData.medications}` : ''}`;

      // Додаємо інформацію про дітей
      if (profileData.children && profileData.children.length > 0) {
        medicalInfo += '\n\nДІТИ:';
        profileData.children.forEach((child: any, index: number) => {
          medicalInfo += `\nДитина ${index + 1}:
  Ім'я: ${child.name || 'Не вказано'}
  Дата народження: ${child.birthDate || 'Не вказано'}
  Група крові: ${child.bloodType || 'Не вказано'}
  ${child.allergies ? `⚠️ Алергії: ${child.allergies}` : ''}
  ${child.medications ? `Ліки: ${child.medications}` : ''}
  ${child.notes ? `Примітки: ${child.notes}` : ''}`;
        });
      }

      // Додаємо інформацію про тварин
      if (profileData.pets && profileData.pets.length > 0) {
        medicalInfo += '\n\nТВАРИНИ:';
        profileData.pets.forEach((pet: any, index: number) => {
          medicalInfo += `\nТварина ${index + 1}:
  Вид: ${pet.species || 'Не вказано'}
  Стать: ${pet.gender || 'Не вказано'}
  Рік народження: ${pet.birthYear || 'Не вказано'}
  ${pet.conditions ? `Хвороби: ${pet.conditions}` : ''}
  ${pet.specialNeeds ? `Особливості: ${pet.specialNeeds}` : ''}
  ${pet.notes ? `Примітки: ${pet.notes}` : ''}`;
        });
      }

      medicalInfo += `${profileData.emergencyName ? `

ЕКСТРЕНИЙ КОНТАКТ:
Ім'я: ${profileData.emergencyName}
Відношення: ${profileData.emergencyRelation}
Телефон: ${profileData.emergencyPhone}
Email: ${profileData.emergencyEmail || 'Не вказано'}` : ''}`;
    }

    // Визначаємо кому потрібна допомога
    const whoNeedsHelpText = whoNeedsHelp === "Інше" ? whoNeedsHelpOther : whoNeedsHelp;

    const urgencyLabels = ['Незначна', 'Невелика', 'Середня', 'Серйозна', 'Критична'];

    const emailBody = `
ЕКСТРЕНЕ ПОВІДОМЛЕННЯ ПРО НЕБЕЗПЕКУ

ОЦІНКА СТАНУ: ${urgencyLevel}/5 - ${urgencyLabels[urgencyLevel - 1]}
ДОПОМОГА ПОТРІБНА ДЛЯ: ${whoNeedsHelpText}

Категорія: ${disasterTypeLabels[reportData.disasterType] || reportData.disasterType}
Конкретний тип: ${reportData.specificDisaster || 'Не вка��ано'}

АДРЕСА:
Країна: ${reportData.country}
Місто: ${reportData.city}
Вулиця: ${reportData.street}
Деталі: ${reportData.details || 'Не вказано'}

ДОДАТКОВА ІНФОРМАЦІЯ:
Кількість людей: ${reportData.numberOfPeople || 0}
Кількість дітей: ${reportData.numberOfChildren || 0}
Кількість тварин: ${reportData.numberOfPets || 0}

ДОПОМОГА:
Потрібна допомога: ${reportData.needsHelp ? 'ТАК' : 'НІ'}
${reportData.needsHelp ? `Тип допомоги: ${helpTypesText}` : ''}${medicalInfo}

Контактний email: ${email}
Відправлено до: ${sendType === "emergency" ? "Екстреного контакту" : "Служби екстреної допомоги"}
Email отримувача: ${recipientEmail}
    `.trim();

    // Відправка на бекенд
    try {
      const response = await fetch('https://vysfpcckuddqcmfneoov.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: recipientEmail,
          message: emailBody
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Emergency email sent successfully:', data);
        setIsSending(false);
        setIsSent(true);

        // Через 3 секунди перенаправляємо на інструкції відповідного типу небезпеки
        setTimeout(() => {
          const threatKey = getDisasterKey(reportData.disasterType, reportData.specificDisaster);
          navigate("/result", { state: { threat: threatKey } });
        }, 3000);
      } else {
        const error = await response.text();
        console.error('Failed to send emergency email:', error);
        alert("Помилка відправки повідомлення. Спробуйте ще раз");
        setIsSending(false);
      }
    } catch (error) {
      console.error('Error sending emergency email:', error);
      alert("Не вдалося відправити повідомлення. Перевірте інтернет-з'єднання");
      setIsSending(false);
    }
  };

  if (isSent) {
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

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Повідомлення надіслано!</h2>
              <p className="text-gray-600 mb-6">
                Ваше повідомлення про небезпеку надіслано. Допомога вже в дорозі.
              </p>
              <p className="text-sm text-gray-500">
                Автоматичне перенаправлення на інструкції...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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

      <main className="flex-1 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>

          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Підтвердження відправки</h2>
            <p className="text-gray-600">Вкажіть email для зв'язку</p>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Деталі повідомлення</h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Категорія:</span>
                <span>{disasterTypeLabels[reportData.disasterType] || reportData.disasterType}</span>
              </div>
              {reportData.specificDisaster && (
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Тип:</span>
                  <span>{reportData.specificDisaster}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Адреса:</span>
                <span className="text-right">
                  {reportData.street}, {reportData.city}, {reportData.country}
                  {reportData.details && <><br />{reportData.details}</>}
                </span>
              </div>
              {reportData.numberOfPeople > 0 && (
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Людей:</span>
                  <span>{reportData.numberOfPeople}</span>
                </div>
              )}
              {reportData.numberOfChildren > 0 && (
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Дітей:</span>
                  <span>{reportData.numberOfChildren}</span>
                </div>
              )}
              {reportData.numberOfPets > 0 && (
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Тварин:</span>
                  <span>{reportData.numberOfPets}</span>
                </div>
              )}
              {reportData.needsHelp && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
                  <div className="font-bold text-red-900 mb-2">⚠️ Потрібна допомога</div>
                  {reportData.helpTypes && reportData.helpTypes.length > 0 && (
                    <ul className="text-sm space-y-1 ml-4">
                      {reportData.helpTypes.map((type: string, idx: number) => (
                        <li key={idx}>• {helpTypeLabels[type]}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          {profileData.name && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-blue-300">
              <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <User className="w-6 h-6" />
                Особиста інформація
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-700">Ім'я:</span>
                  <span className="font-semibold text-gray-900">{profileData.name}</span>
                </div>

                {profileData.bloodType && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-red-600" />
                      Група крові:
                    </span>
                    <span className="font-bold text-red-900">{profileData.bloodType}</span>
                  </div>
                )}

                {profileData.allergies && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded">
                    <div className="font-semibold text-red-900 mb-1">⚠️ Алергії</div>
                    <div className="text-sm text-red-800">{profileData.allergies}</div>
                  </div>
                )}

                {profileData.chronicDiseases && (
                  <div className="p-3 bg-amber-50 border-l-4 border-amber-600 rounded">
                    <div className="font-semibold text-amber-900 mb-1">Хронічні захворювання</div>
                    <div className="text-sm text-amber-800">{profileData.chronicDiseases}</div>
                  </div>
                )}

                {profileData.medications && (
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-600 rounded">
                    <div className="font-semibold text-blue-900 mb-1">💊 Ліки</div>
                    <div className="text-sm text-blue-800">{profileData.medications}</div>
                  </div>
                )}

                {/* Children */}
                {profileData.children && profileData.children.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Baby className="w-5 h-5 text-blue-900" />
                      <h4 className="font-bold text-blue-900">Діти</h4>
                    </div>
                    <div className="space-y-2">
                      {profileData.children.map((child: any, index: number) => (
                        <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-600 rounded">
                          <div className="font-semibold text-blue-900 mb-1">{child.name || `Дитина ${index + 1}`}</div>
                          <div className="text-sm text-blue-800 space-y-1">
                            {child.birthDate && <div>Дата народження: {child.birthDate}</div>}
                            {child.bloodType && <div className="font-semibold">Група крові: {child.bloodType}</div>}
                            {child.allergies && <div className="text-red-800">⚠️ Алергії: {child.allergies}</div>}
                            {child.medications && <div>Ліки: {child.medications}</div>}
                            {child.notes && <div className="italic">Примітки: {child.notes}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pets */}
                {profileData.pets && profileData.pets.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <PawPrint className="w-5 h-5 text-green-700" />
                      <h4 className="font-bold text-green-900">Тварини</h4>
                    </div>
                    <div className="space-y-2">
                      {profileData.pets.map((pet: any, index: number) => (
                        <div key={index} className="p-3 bg-green-50 border-l-4 border-green-600 rounded">
                          <div className="font-semibold text-green-900 mb-1">{pet.species || `Тварина ${index + 1}`} ({pet.gender})</div>
                          <div className="text-sm text-green-800 space-y-1">
                            {pet.birthYear && <div>Рік народження: {pet.birthYear}</div>}
                            {pet.conditions && <div className="text-amber-800">Хвороби: {pet.conditions}</div>}
                            {pet.specialNeeds && <div>Особливості: {pet.specialNeeds}</div>}
                            {pet.notes && <div className="italic">Примітки: {pet.notes}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profileData.emergencyName && (
                  <div className="p-3 bg-green-50 border border-green-300 rounded mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-green-700" />
                      <div className="font-semibold text-green-900">Екстрений контакт</div>
                    </div>
                    <div className="text-sm text-green-900">
                      <div className="font-bold">{profileData.emergencyName} ({profileData.emergencyRelation})</div>
                      <div className="text-green-700">{profileData.emergencyPhone}</div>
                      {profileData.emergencyEmail && <div className="text-green-700">{profileData.emergencyEmail}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Urgency Level */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Оцініть серйозність ситуації</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Незначна</span>
                <span className="text-sm text-gray-600">Критична</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="text-center">
                <span className={`text-2xl font-bold ${
                  urgencyLevel === 5 ? 'text-red-600' :
                  urgencyLevel === 4 ? 'text-orange-600' :
                  urgencyLevel === 3 ? 'text-yellow-600' :
                  urgencyLevel === 2 ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {urgencyLevel}/5
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {urgencyLevel === 5 && "Критична ситуація"}
                  {urgencyLevel === 4 && "Серйозна ситуація"}
                  {urgencyLevel === 3 && "Середня ситуація"}
                  {urgencyLevel === 2 && "Невелика проблема"}
                  {urgencyLevel === 1 && "Незначна допомога"}
                </p>
              </div>
            </div>
          </div>

          {/* Who Needs Help */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Кому потрібна допомога?</h3>
            <select
              value={whoNeedsHelp}
              onChange={(e) => setWhoNeedsHelp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none mb-3"
            >
              {whoNeedsHelpOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>

            {whoNeedsHelp === "Інше" && (
              <textarea
                value={whoNeedsHelpOther}
                onChange={(e) => setWhoNeedsHelpOther(e.target.value)}
                placeholder="Опишіть кому потрібна допомога"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
              />
            )}
          </div>

          {/* Email Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-900" />
                Контактний email
              </h3>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                required
              />
              <p className="mt-2 text-sm text-gray-600">
                Email буде збережено в ваших контактах для наступних повідомлень
              </p>
            </div>

            {/* Send Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={(e) => handleSend(e, "emergency")}
                disabled={isSending || !profileData.emergencyEmail}
                className="px-6 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
                title={!profileData.emergencyEmail ? "Додайте email екстреного контакту в профілі" : ""}
              >
                {isSending && sendTo === "emergency" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Відправка...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    Екстреному контакту
                  </>
                )}
              </button>

              <button
                onClick={(e) => handleSend(e, "service")}
                disabled={isSending}
                className="px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {isSending && sendTo === "service" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Відправка...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Службі допомоги
                  </>
                )}
              </button>
            </div>

            {!profileData.emergencyEmail && (
              <p className="text-sm text-amber-600 text-center">
                ⚠️ Додайте email екстреного контакту в профілі, щоб відправити йому повідомлення
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}