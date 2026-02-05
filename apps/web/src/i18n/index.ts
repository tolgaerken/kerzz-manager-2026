import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  tr: {
    translation: {
      welcome: "Kerzz Manager'a hoş geldiniz",
      subtitle: "B2B üretim yönetimi için hazır altyapı"
    }
  },
  en: {
    translation: {
      welcome: "Welcome to Kerzz Manager",
      subtitle: "Production-ready backbone for B2B operations"
    }
  }
};

void i18n.use(initReactI18next).init({
  resources,
  lng: "tr",
  fallbackLng: "tr",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
