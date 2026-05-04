import { useState } from "react";
import { Upload, CheckCircle, AlertTriangle } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export function MapSetup() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const initializeBucket = async () => {
    setStatus('loading');
    setMessage('Створення bucket...');

    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setStatus('error');
        setMessage('Потрібно увійти в систему');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-214c0005/geo/init-bucket`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Помилка створення bucket');
      }

      setStatus('success');
      setMessage(data.message + '\n\n' + data.instructions);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mt-6">
      <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Налаштування карти України
      </h4>

      <p className="text-sm text-blue-800 mb-4">
        Для відображення детальної карти потрібно створити bucket "geo" та завантажити GeoJSON файли.
        Файл hromady.json обов'язковий, а rayony.json та regiony.json додають межі та підписи районів і областей.
      </p>

      <div className="space-y-3">
        <button
          onClick={initializeBucket}
          disabled={status === 'loading'}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            status === 'loading'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-900 hover:bg-blue-800 text-white'
          }`}
        >
          {status === 'loading' ? 'Створення...' : 'Створити bucket "geo"'}
        </button>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800 whitespace-pre-line">
              {message}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              {message}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <p className="font-semibold text-gray-900 mb-2">Далі:</p>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Перейдіть: <a
              href={`https://supabase.com/dashboard/project/${projectId}/storage/buckets`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Supabase Storage Dashboard
            </a></li>
            <li>Відкрийте bucket "geo"</li>
            <li>Натисніть "Upload" та завантажте файли GeoJSON:
              <ul className="ml-6 mt-1 space-y-0.5">
                <li>• <code className="bg-gray-100 px-1 rounded text-xs">hromady.json</code> (обов'язково)</li>
                <li>• <code className="bg-gray-100 px-1 rounded text-xs">rayony.json</code> (для меж районів)</li>
                <li>• <code className="bg-gray-100 px-1 rounded text-xs">regiony.json</code> (для меж областей)</li>
              </ul>
            </li>
            <li>Оновіть сторінку - карта з'явиться автоматично</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
