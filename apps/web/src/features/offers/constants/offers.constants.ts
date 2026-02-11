const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export const OFFERS_CONSTANTS = {
  API_BASE_URL,
  ENDPOINTS: {
    OFFERS: "/offers",
    OFFER_BY_ID: (id: string) => `/offers/${encodeURIComponent(id)}`,
    OFFER_STATUS: (id: string) => `/offers/${encodeURIComponent(id)}/status`,
    OFFER_CALCULATE: (id: string) => `/offers/${encodeURIComponent(id)}/calculate`,
    OFFER_REVERT_CONVERSION: (id: string) => `/offers/${encodeURIComponent(id)}/revert-conversion`,
    OFFER_DOCUMENT: (id: string, format: "html" | "pdf" = "html") =>
      `/offers/${encodeURIComponent(id)}/document?format=${format}`,
  },
  QUERY_KEYS: {
    OFFERS: "offers",
    OFFER: "offer",
    OFFER_STATS: "offer-stats",
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200],
  OFFER_STATUSES: [
    { id: "all", name: "Tümü" },
    { id: "draft", name: "Taslak" },
    { id: "sent", name: "Gönderildi" },
    { id: "revised", name: "Revize Edildi" },
    { id: "waiting", name: "Cevap Bekleniyor" },
    { id: "approved", name: "Onaylandı" },
    { id: "rejected", name: "Reddedildi" },
    { id: "won", name: "Kazanıldı" },
    { id: "lost", name: "Kaybedildi" },
    { id: "converted", name: "Dönüştürüldü" },
  ],
} as const;
