import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "./locales/en";
import { uk } from "./locales/uk";

i18n.use(initReactI18next).init({
  fallbackLng: "uk",
  lng: "uk",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: { translation: en },
    uk: { translation: uk },
  },
});

export { i18n };
