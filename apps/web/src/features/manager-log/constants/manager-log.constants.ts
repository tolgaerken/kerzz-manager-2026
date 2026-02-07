const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export const MANAGER_LOG_CONSTANTS = {
  API_BASE_URL,
  ENDPOINTS: {
    LOGS: "/manager-logs",
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100] as const,
  REFERENCE_COMMANDS: [
    { command: "/kontrat", type: "contract", label: "Kontrat Ara" },
    { command: "/lisans", type: "license", label: "Lisans Ara" },
  ] as const,
};
