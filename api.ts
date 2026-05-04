/**
 * Утиліти для роботи з API
 *
 * ВАЖЛИВО: Перед використанням замініть BASE_URL на реальну адресу бекенду
 */

// TODO: Замінити на реальну адресу бекенду
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface ApiError {
  message: string;
  status: number;
}

/**
 * Базова функція для API запитів з обробкою помилок
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Додати токен авторизації якщо є
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Невідома помилка',
        status: response.status,
      };
      throw error;
    }

    return data as T;
  } catch (error) {
    // Якщо це помилка мережі
    if (error instanceof TypeError) {
      throw {
        message: 'Не вдалося підключитися до сервера',
        status: 0,
      } as ApiError;
    }
    // Передати помилку від API
    throw error;
  }
}

/**
 * API методи для авторизації
 */
export const authApi = {
  /**
   * Реєстрація нового користувача
   */
  register: async (data: { name: string; email: string; password: string }) => {
    return apiRequest<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Вхід користувача
   */
  login: async (data: { email: string; password: string; remember: boolean }) => {
    return apiRequest<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Вихід з системи
   */
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
  },
};

/**
 * API методи для профілю
 */
export const profileApi = {
  /**
   * Отримати профіль користувача
   */
  get: async () => {
    return apiRequest<any>('/api/user/profile', {
      method: 'GET',
    });
  },

  /**
   * Оновити профіль користувача
   */
  update: async (data: any) => {
    return apiRequest<{ message: string; user: any }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

/**
 * API методи для екстрених повідомлень
 */
export const emergencyApi = {
  /**
   * Відправити екстрене повідомлення
   */
  sendReport: async (data: any) => {
    return apiRequest<{ message: string; reportId: string }>('/api/emergency/report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Хелпери для роботи з помилками
 */
export const getErrorMessage = (error: any): string => {
  if (error.status === 401) {
    return 'Неправильний email або пароль';
  }
  if (error.status === 404) {
    return 'Користувача не знайдено';
  }
  if (error.status === 409) {
    return 'Користувач з таким email вже існує';
  }
  if (error.status === 0) {
    return 'Не вдалося підключитися до сервера. Перевірте інтернет-з\'єднання';
  }
  return error.message || 'Сталася помилка. Спробуйте ще раз';
};
