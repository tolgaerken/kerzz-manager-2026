import * as Handlebars from "handlebars";

/**
 * Para birimi sembollerini döndürür.
 */
function getCurrencySymbol(currency: string): string {
  const map: Record<string, string> = {
    usd: "$",
    USD: "$",
    eur: "€",
    EUR: "€",
    tl: "₺",
    TL: "₺",
    try: "₺",
    TRY: "₺",
  };
  return map[currency] || currency;
}

/**
 * Tüm Handlebars helper'larını kayıt eder.
 */
export function registerHandlebarsHelpers(): void {
  /**
   * Para formatı: {{formatCurrency 150 "usd"}} => "$150.00"
   */
  Handlebars.registerHelper(
    "formatCurrency",
    (amount: unknown, currency: unknown): string => {
      const num = Number(amount) || 0;
      const curr = String(currency || "usd").toLowerCase();
      const symbol = getCurrencySymbol(curr);

      if (curr === "tl" || curr === "try") {
        return `${symbol}${num.toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }

      return `${symbol}${num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
  );

  /**
   * Tarih formatı: {{formatDate "2026-02-08"}} => "08.02.2026"
   */
  Handlebars.registerHelper("formatDate", (dateStr: unknown): string => {
    if (!dateStr) return "-";
    const date = new Date(String(dateStr));
    if (isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  });

  /**
   * Sıra numarası: {{increment @index}} => 1, 2, 3...
   */
  Handlebars.registerHelper("increment", (index: unknown): number => {
    return Number(index) + 1;
  });

  /**
   * Eşitlik kontrolü: {{#ifEquals status "active"}}...{{/ifEquals}}
   */
  Handlebars.registerHelper(
    "ifEquals",
    function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
      return a === b ? options.fn(this) : options.inverse(this);
    },
  );

  /**
   * Büyüktür kontrolü: {{#ifGt value 0}}...{{/ifGt}}
   */
  Handlebars.registerHelper(
    "ifGt",
    function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
      return Number(a) > Number(b) ? options.fn(this) : options.inverse(this);
    },
  );

  /**
   * Dizi uzunluk kontrolü: {{#ifHasItems products}}...{{/ifHasItems}}
   */
  Handlebars.registerHelper(
    "ifHasItems",
    function (this: unknown, arr: unknown, options: Handlebars.HelperOptions) {
      return Array.isArray(arr) && arr.length > 0
        ? options.fn(this)
        : options.inverse(this);
    },
  );

  /**
   * Currency sembolü: {{currencySymbol "usd"}} => "$"
   */
  Handlebars.registerHelper(
    "currencySymbol",
    (currency: unknown): string => {
      return getCurrencySymbol(String(currency || "usd"));
    },
  );
}
