import { apiGet } from "../../../lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface VersionInfo {
  version: string;
  name: string;
}

export async function getVersion(): Promise<VersionInfo> {
  return apiGet<VersionInfo>(`${API_BASE_URL}/version`);
}
