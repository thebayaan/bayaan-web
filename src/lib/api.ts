const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

export async function fetchBayaan<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}/api/bayaan/${path}`, init);
  if (!response.ok) {
    throw new Error(`Bayaan API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchQuran<T>(path: string, params?: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const url = `${BASE_URL}/api/quran/${path}?${searchParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Quran API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}
