import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/appStore";

export function IndexRoute() {
  const { t, i18n } = useTranslation();
  const { locale, setLocale } = useAppStore();

  const handleLocaleChange = (nextLocale: "tr" | "en") => {
    setLocale(nextLocale);
    void i18n.changeLanguage(nextLocale);
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">{t("welcome")}</h2>
        <p className="text-slate-300">{t("subtitle")}</p>
      </div>
      <div className="flex gap-2">
        <button
          className={`rounded px-3 py-1 ${
            locale === "tr" ? "bg-slate-100 text-slate-900" : "bg-slate-800"
          }`}
          onClick={() => handleLocaleChange("tr")}
          type="button"
        >
          TR
        </button>
        <button
          className={`rounded px-3 py-1 ${
            locale === "en" ? "bg-slate-100 text-slate-900" : "bg-slate-800"
          }`}
          onClick={() => handleLocaleChange("en")}
          type="button"
        >
          EN
        </button>
      </div>
    </section>
  );
}
