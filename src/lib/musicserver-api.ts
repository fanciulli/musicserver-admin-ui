import { cookies } from "next/headers";

const DEFAULT_API_BASE_URL = "http://localhost:3000";

export function getMusicServerApiBaseUrl(): string {
  const envValue = process.env.MUSICSERVER_API_BASE_URL?.trim();
  return envValue && envValue.length > 0 ? envValue : DEFAULT_API_BASE_URL;
}

export function buildMusicServerUrl(path: string): string {
  const baseUrl = getMusicServerApiBaseUrl().replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export async function buildAdminHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function buildAdminJsonHeaders(): Promise<HeadersInit> {
  return {
    ...(await buildAdminHeaders()),
    "Content-Type": "application/json",
  };
}
