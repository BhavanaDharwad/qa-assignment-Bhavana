import { apiErrorSchema, type ApiErrorBody } from "@/types/domain";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody,
  ) {
    super(body.error);
    this.name = "ApiError";
  }

  get code(): string {
    return this.body.code;
  }

  get fields(): Record<string, string> {
    return this.body.fields ?? {};
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

async function parseError(response: Response): Promise<ApiError> {
  const fallback: ApiErrorBody = { error: `Request failed with status ${response.status}`, code: "http_error" };
  try {
    const parsed = apiErrorSchema.safeParse(await response.json());
    return new ApiError(response.status, parsed.success ? parsed.data : fallback);
  } catch {
    return new ApiError(response.status, fallback);
  }
}

/**
 * Thin fetch wrapper for the app's own `/api` routes. Every call goes over the
 * network so tests can observe, intercept, or mock it.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    cache: "no-store",
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
