const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Server Error" }));
    throw new Error(error.message || "Server Error");
  }
  return response.json();
}

export interface VersionInfo {
  version: string;
  name: string;
}

export async function getVersion(): Promise<VersionInfo> {
  const response = await fetch(`${API_BASE_URL}/version`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<VersionInfo>(response);
}
