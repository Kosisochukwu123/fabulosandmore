import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const SettingsContext = createContext({});

const CACHE_KEY = "fab_settings_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const API_URL = process.env.REACT_APP_API_URL;

/* Read from localStorage */
const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null; // expired
    return data;
  } catch {
    return null;
  }
};

/* Write to localStorage */
const writeCache = (data) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch {
    /* storage full — silent */
  }
};

const DEFAULT_SETTINGS = {
  business: {
    name: "Fabulous & More",
    tagline: "Premium Kitchen Utensils & Hardware",
    description:
      "Premium kitchen utensils and hardware for the modern Nigerian home.",
    logo: "",
    email: "hello@fabulousandmore.com",
    supportEmail: "support@fabulousandmore.com",
    phone: "+234 800 000 0000",
    whatsapp: "+2348000000000",
    whatsappText: "Hi! I need help with my order.",
  },
  address: {
    street: "123 Market Street",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    mapLink: "",
  },
  hours: {
    weekdays: "Monday – Saturday: 8am – 6pm WAT",
    weekends: "Sunday: Closed",
    timezone: "WAT (UTC+1)",
  },
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    tiktok: "",
    linkedin: "",
  },
  shipping: {
    freeShippingThreshold: 50000,
    standardCost: 2000,
    estimatedDays: "3–5 business days",
    expressAvailable: false,
    expressCost: 5000,
    expressEstimatedDays: "1–2 business days",
  },
  announcement: {
    enabled: true,
    text: "Free delivery on orders over ₦50,000 · WhatsApp: +234 800 000 0000",
    link: "",
    bgColor: "#D4AF37",
    textColor: "#1A1A1A",
  },
  seo: { metaTitle: "Fabulous & More", metaDescription: "", keywords: "" },
  coupons: [],
};

export function SettingsProvider({ children }) {
  /* 1. Seed state instantly from cache (or defaults) — no flicker */
  const [settings, setSettings] = useState(
    () => readCache() || DEFAULT_SETTINGS,
  );
  const [loaded, setLoaded] = useState(() => !!readCache()); // true immediately if cached

  useEffect(() => {
    /* 2. Always fetch fresh data in the background */
    let cancelled = false;

    axios
      .get(`${API_URL}/api/settings`)
      .then((r) => {
        if (cancelled) return;
        const fresh = r.data.settings;
        if (fresh) {
          setSettings(fresh);
          writeCache(fresh);
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true); // use whatever we have
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* 3. When admin saves settings — update cache immediately too */
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    writeCache(newSettings);
  };

  return (
    <SettingsContext.Provider
      value={{ settings, setSettings: updateSettings, loaded }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
