const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

interface BayaanErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

/**
 * Thrown by fetchBayaan / fetchQuran when the upstream returns a non-2xx
 * response. Carries the backend's structured `code` and `message` when they
 * exist, and falls back to an HTTP-status-derived sentence otherwise so
 * call-sites can render `err.message` directly without parsing.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(status: number, code: string | null, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function friendlyForStatus(status: number): string {
  if (status === 401) return "This request isn't authorized.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find that.";
  if (status === 429) return "Too many requests — try again in a moment.";
  if (status >= 500) return "The server hit an error. Please try again.";
  return `Request failed (${status}).`;
}

const CODE_MESSAGES: Record<string, string> = {
  USER_SYNC_FAILED: "We couldn't sync your account. Try again in a moment.",
  USER_NOT_FOUND: "Your account isn't synced yet. Try again in a moment.",
  UNAUTHORIZED: "Your session expired. Please try again.",
};

async function buildApiError(response: Response): Promise<ApiError> {
  let body: BayaanErrorBody | null = null;
  try {
    body = (await response.json()) as BayaanErrorBody;
  } catch {
    // Non-JSON body (HTML 404 page from Next, response with no body, etc.).
  }
  const code = body?.error?.code ?? null;
  const message =
    (code && CODE_MESSAGES[code]) ?? body?.error?.message ?? friendlyForStatus(response.status);
  return new ApiError(response.status, code, message);
}

export async function fetchBayaan<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}/api/bayaan/${path}`, init);
  if (!response.ok) {
    throw await buildApiError(response);
  }
  return response.json() as Promise<T>;
}

export async function fetchQuran<T>(path: string, params?: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const url = `${BASE_URL}/api/quran/${path}?${searchParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw await buildApiError(response);
  }
  return response.json() as Promise<T>;
}
