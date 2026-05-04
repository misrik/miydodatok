import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-214c0005/health", (c) => {
  return c.json({ status: "ok" });
});

// AUTH ENDPOINTS

// Register new user
app.post("/make-server-214c0005/auth/register", async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ message: "Некоректні дані" }, 400);
    }

    if (password.length < 6) {
      return c.json({ message: "Пароль має бути мінімум 6 символів" }, 400);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists
    const existingProfile = await kv.get(`user_email:${email}`);
    if (existingProfile) {
      return c.json({ message: "Користувач з таким email вже існує" }, 409);
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since no email server configured
      user_metadata: { name }
    });

    if (authError) {
      console.error('Auth error during registration:', authError);
      return c.json({ message: "Помилка створення користувача: " + authError.message }, 400);
    }

    const userId = authData.user.id;

    // Create user profile
    const userProfile = {
      id: userId,
      name,
      email,
      birthDate: "",
      bloodType: "",
      region: "",
      allergies: "",
      chronicDiseases: "",
      medications: "",
      specialNeeds: "",
      emergencyName: "",
      emergencyPhone: "",
      emergencyEmail: "",
      emergencyRelation: "",
      children: [],
      pets: [],
      addresses: []
    };

    // Save to KV store
    await kv.set(`user:${userId}`, userProfile);
    await kv.set(`user_email:${email}`, userId);

    // Generate session
    const { data: sessionData } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return c.json({
      token: sessionData.session?.access_token,
      user: {
        id: userId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return c.json({ message: "Помилка сервера: " + error.message }, 500);
  }
});

// Login user
app.post("/make-server-214c0005/auth/login", async (c) => {
  try {
    const { email, password, remember } = await c.req.json();

    if (!email || !password) {
      return c.json({ message: "Некоректні дані" }, 400);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes("Invalid")) {
        return c.json({ message: "Неправильний email або пароль" }, 401);
      }
      console.error('Login error:', error);
      return c.json({ message: "Помилка входу: " + error.message }, 400);
    }

    if (!data.user) {
      return c.json({ message: "Користувача з таким email не знайдено" }, 404);
    }

    const userId = data.user.id;

    // Get user profile from KV store
    const userProfile = await kv.get(`user:${userId}`) || {
      id: userId,
      name: data.user.user_metadata?.name || "",
      email: data.user.email,
      children: [],
      pets: [],
      addresses: []
    };

    return c.json({
      token: data.session?.access_token,
      user: userProfile
    });
  } catch (error) {
    console.error('Error during login:', error);
    return c.json({ message: "Помилка сервера: " + error.message }, 500);
  }
});

// USER PROFILE ENDPOINTS

// Get user profile
app.get("/make-server-214c0005/user/profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ message: "Не авторизовано" }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.error('Auth error while getting profile:', error);
      return c.json({ message: "Не авторизовано" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);

    if (!userProfile) {
      return c.json({ message: "Профіль не знайдено" }, 404);
    }

    return c.json(userProfile);
  } catch (error) {
    console.error('Error getting profile:', error);
    return c.json({ message: "Помилка сервера: " + error.message }, 500);
  }
});

// Update user profile
app.put("/make-server-214c0005/user/profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ message: "Не авторизовано" }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.error('Auth error while updating profile:', error);
      return c.json({ message: "Не авторизовано" }, 401);
    }

    const profileData = await c.req.json();
    profileData.id = user.id;
    profileData.email = user.email;

    // Save updated profile
    await kv.set(`user:${user.id}`, profileData);

    return c.json({
      message: "Профіль оновлено",
      user: profileData
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ message: "Помилка сервера: " + error.message }, 500);
  }
});

// EMERGENCY REPORT ENDPOINT

// Send emergency report
app.post("/make-server-214c0005/emergency/report", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    let userId = "anonymous";

    if (accessToken) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      if (user) {
        userId = user.id;
      }
    }

    const reportData = await c.req.json();
    const reportId = `report:${Date.now()}:${userId}`;

    // Save report to KV store
    await kv.set(reportId, {
      ...reportData,
      userId,
      timestamp: new Date().toISOString()
    });

    // In production, here would be email sending logic
    console.log('Emergency report created:', reportId, reportData);

    return c.json({
      message: "Повідомлення надіслано",
      reportId
    });
  } catch (error) {
    console.error('Error creating emergency report:', error);
    return c.json({ message: "Помилка сервера: " + error.message }, 500);
  }
});

// GEO BUCKET INITIALIZATION

// Initialize geo bucket for map data
app.post("/make-server-214c0005/geo/init-bucket", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      return c.json({ message: "Не авторизовано" }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ message: "Не авторизовано" }, 401);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create geo bucket
    const { data: createData, error: createError } = await supabaseAdmin.storage.createBucket('geo', {
      public: true,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: ['application/json', 'application/geo+json']
    });

    if (createError && !createError.message.includes('already exists')) {
      console.error('Error creating geo bucket:', createError);
      return c.json({ message: "Помилка створення bucket: " + createError.message }, 500);
    }

    return c.json({
      message: "Bucket 'geo' створено або вже існує",
      instructions: "Тепер завантажте файл hromady.json через Supabase Dashboard: Storage > geo > Upload"
    });
  } catch (error) {
    console.error('Error initializing geo bucket:', error);
    return c.json({ message: "Помилка: " + error.message }, 500);
  }
});

// ALERT ENDPOINTS

// Get alerts for user's region
app.get("/make-server-214c0005/get-alerts", async (c) => {
  try {
    // Mock data for testing - in production this would fetch from Ukraine Alert API
    const mockAlerts = {
      states: {
        "м. Київ": {
          locationTitle: "м. Київ",
          activeAlerts: [],
          districts: []
        },
        "Київська область": {
          locationTitle: "Київська область",
          activeAlerts: [],
          districts: []
        },
        "Львівська область": {
          locationTitle: "Львівська область",
          activeAlerts: [],
          districts: []
        },
        "Одеська область": {
          locationTitle: "Одеська область",
          activeAlerts: [],
          districts: []
        },
        "Дніпропетровська область": {
          locationTitle: "Дніпропетровська область",
          activeAlerts: [],
          districts: []
        },
        "Харківська область": {
          locationTitle: "Харківська область",
          activeAlerts: ["air_raid"],
          districts: []
        }
      }
    };

    return c.json(mockAlerts);
  } catch (error) {
    console.error('Error getting alerts:', error);
    return c.json({ message: "Помилка сервера: " + error.message }, 500);
  }
});

// Get full Ukraine map alerts - PUBLIC endpoint, no auth required
app.get("/make-server-214c0005/get-alerts-full", async (c) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download all GeoJSON files from Supabase Storage
    const [hromadyResult, rayonyResult, regionyResult] = await Promise.all([
      supabase.storage.from('geo').download('hromady.json'),
      supabase.storage.from('geo').download('rayony.json'),
      supabase.storage.from('geo').download('regiony.json')
    ]);

    // Parse hromady (required)
    if (hromadyResult.error) {
      console.error('Error downloading hromady.json:', hromadyResult.error);
      return c.json({
        error: "Не вдалося завантажити геодані громад",
        details: hromadyResult.error.message
      }, 500);
    }

    const hromadyText = await hromadyResult.data.text();
    const hromadyData = JSON.parse(hromadyText);

    // Parse rayony (optional)
    let rayonyData = null;
    if (!rayonyResult.error && rayonyResult.data) {
      try {
        const rayonyText = await rayonyResult.data.text();
        rayonyData = JSON.parse(rayonyText);
      } catch (e) {
        console.warn('Failed to parse rayony.json:', e);
      }
    }

    // Parse regiony (optional)
    let regionyData = null;
    if (!regionyResult.error && regionyResult.data) {
      try {
        const regionyText = await regionyResult.data.text();
        regionyData = JSON.parse(regionyText);
      } catch (e) {
        console.warn('Failed to parse regiony.json:', e);
      }
    }

    // Generate active locations array
    // In production, this would fetch from real Ukraine Alert API
    // For now, create empty array - no active alerts
    const activeLocations: any[] = [];

    // Example: add test active location
    // activeLocations.push({
    //   title: "Харків",
    //   oblast: "Харківська область",
    //   raion: "Харківський район",
    //   type: "city",
    //   alertType: "air_raid"
    // });

    // Return data in the required format
    return c.json({
      activeLocations: activeLocations,
      geo: {
        hromady: hromadyData,
        rayony: rayonyData,
        regiony: regionyData
      }
    });
  } catch (error) {
    console.error('Error getting full map alerts:', error);
    return c.json({
      error: "Помилка сервера",
      details: error.message
    }, 500);
  }
});

Deno.serve(app.fetch);