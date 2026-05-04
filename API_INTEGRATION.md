# API Integration Guide

Цей файл містить інформацію про API endpoints, які потрібно реалізувати на бекенді.

## Авторизація

### 1. POST /api/auth/register
**Реєстрація нового користувача**

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

**Error Responses:**
- **400 Bad Request** - Некоректні дані
```json
{
  "message": "Некоректні дані"
}
```

- **409 Conflict** - Користувач вже існує
```json
{
  "message": "Користувач з таким email вже існує"
}
```

---

### 2. POST /api/auth/login
**Вхід користувача**

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "remember": "boolean"
}
```

**Success Response (200):**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "bloodType": "string",
    "allergies": "string",
    "chronicDiseases": "string",
    "medications": "string",
    "emergencyName": "string",
    "emergencyPhone": "string",
    "emergencyEmail": "string",
    "emergencyRelation": "string",
    "children": [],
    "pets": []
  }
}
```

**Error Responses:**
- **401 Unauthorized** - Неправильний пароль
```json
{
  "message": "Неправильний email або пароль"
}
```

- **404 Not Found** - Користувача не знайдено
```json
{
  "message": "Користувача з таким email не знайдено"
}
```

---

## Профіль користувача

### 3. GET /api/user/profile
**Отримання профілю користувача**

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "birthDate": "string",
  "bloodType": "string",
  "region": "string",
  "allergies": "string",
  "chronicDiseases": "string",
  "medications": "string",
  "specialNeeds": "string",
  "emergencyName": "string",
  "emergencyPhone": "string",
  "emergencyEmail": "string",
  "emergencyRelation": "string",
  "children": [
    {
      "id": "string",
      "name": "string",
      "birthDate": "string",
      "bloodType": "string",
      "allergies": "string",
      "medications": "string",
      "notes": "string"
    }
  ],
  "pets": [
    {
      "id": "string",
      "species": "string",
      "gender": "string",
      "birthYear": "string",
      "conditions": "string",
      "specialNeeds": "string",
      "notes": "string"
    }
  ]
}
```

---

### 4. PUT /api/user/profile
**Оновлення профілю користувача**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (всі поля з GET /api/user/profile)

**Success Response (200):**
```json
{
  "message": "Профіль оновлено",
  "user": { ... }
}
```

---

## Екстрене повідомлення

### 5. POST /api/emergency/report
**Відправка екстреного повідомлення**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "disasterType": "natural|technological|military|medical",
  "specificDisaster": "string",
  "country": "string",
  "city": "string",
  "street": "string",
  "details": "string",
  "numberOfPeople": "number",
  "numberOfChildren": "number",
  "numberOfPets": "number",
  "needsHelp": "boolean",
  "helpTypes": ["medical", "psychological", "evacuation", "shelter", "food", "mobility", "other"],
  "urgencyLevel": "number (1-5)",
  "whoNeedsHelp": "string",
  "contactEmail": "string",
  "sendTo": "emergency|service"
}
```

**Success Response (200):**
```json
{
  "message": "Повідомлення надіслано",
  "reportId": "string"
}
```

---

## Примітки для розробника

1. **Токени авторизації**: Використовуйте JWT токени
2. **Час життя токена**: 7 днів для remember=true, 24 години для remember=false
3. **Безпека паролів**: Хешування з bcrypt (мінімум 10 rounds)
4. **Email повідомлення**: 
   - sendTo="emergency" → відправити на emergencyEmail з профілю
   - sendTo="service" → відправити на helpkpi@ukr.net
5. **Валідація**: 
   - Email має бути валідним
   - Пароль мінімум 6 символів
   - Телефони в українському форматі
6. **CORS**: Дозволити запити з фронтенду

## Поточний стан

На даний момент у фронтенді реалізовано:
- ✅ Обробка помилок від API
- ✅ Відображення помилок користувачу
- ✅ Стани завантаження
- ✅ Збереження токена в localStorage
- ✅ Валідація на клієнті

**TODO на бекенді:**
- [ ] Реалізувати всі API endpoints
- [ ] Налаштувати базу даних
- [ ] Реалізувати відправку email
- [ ] Додати middleware для авторизації
- [ ] Налаштувати CORS
