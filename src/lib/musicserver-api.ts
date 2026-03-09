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
