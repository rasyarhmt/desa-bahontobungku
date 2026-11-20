import { z } from "zod/v3";

import { API_URL } from "./config";
import { EnvelopeSchema, RefreshTokensSchema, type RefreshTokens } from "./schemas";

/**
 * Skema respons yang diharapkan klien: cukup output-nya bertipe T.
 * Input dibiarkan `unknown` agar skema dengan `.catch()`/`.default()`/transform
 * (yang tipe input-nya berbeda dari output) tetap bisa dipakai tanpa kehilangan tipe.
 */
export type ResponseSchema<T> = z.ZodType<T, z.ZodTypeDef, unknown>;

/** Kunci localStorage yang dipakai aplikasi. */
export const AUTH_STORAGE = {
  token: "token",
  refreshToken: "refreshToken",
  userEmail: "userEmail",
  userNama: "userNama",
  userRole: "userRole",
} as const;

export const getAccessToken = (): string | null =>
  localStorage.getItem(AUTH_STORAGE.token);

export const setTokens = (tokens: RefreshTokens): void => {
  localStorage.setItem(AUTH_STORAGE.token, tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem(AUTH_STORAGE.refreshToken, tokens.refresh_token);
  }
};

/** Bersihkan sesi lalu arahkan ke beranda. */
export const clearAuth = (): void => {
  Object.values(AUTH_STORAGE).forEach((key) => localStorage.removeItem(key));
  window.location.href = "/";
};

let refreshPromise: Promise<RefreshTokens | null> | null = null;

/** Refetch token dengan deduplikasi (satu refresh berjalan untuk semua pemanggil). */
export const refreshTokens = (): Promise<RefreshTokens | null> => {
  const refreshToken = localStorage.getItem(AUTH_STORAGE.refreshToken);
  if (!refreshToken) {
    return Promise.reject(new Error("refresh token tidak ada"));
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        const envelope = EnvelopeSchema.safeParse(json);
        if (!res.ok || !envelope.success) return null;
        const tokens = RefreshTokensSchema.safeParse(envelope.data.data);
        return tokens.success ? tokens.data : null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

/** Error API yang membawa pesan dari backend (menggantikan pola axios err.response). */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number = 0,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Validasi run-time dengan Zod: pastikan payload backend sesuai kontrak sebelum dipakai. */
const parsePayload = <T>(schema: ResponseSchema<T>, data: unknown, path: string): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const summary = result.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    console.error(`[api] format respons berubah untuk ${path}:`, result.error.issues);
    throw new ApiError(`Format respons API berubah (${path}): ${summary}`, 0, data);
  }
  return result.data;
};

type QueryValue = string | number | boolean;

export interface RequestOptions<T> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, QueryValue | QueryValue[] | undefined>;
  body?: unknown;
  form?: FormData;
  schema: ResponseSchema<T>;
}

/**
 * Klien API berbasis native fetch + validasi Zod.
 * Fitur: token Bearer otomatis, multipart (FormData), auto-refresh token saat 401,
 * dan unwrap envelope { code, message, data } tervalidasi.
 */
export class ApiClient {
  constructor(private readonly baseURL: string) {}

  private buildUrl(
    path: string,
    query?: Record<string, QueryValue | QueryValue[] | undefined>,
  ): string {
    const url = `${this.baseURL}${path}`;
    if (!query) return url;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    }
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
  }

  /**
   * Fetch dengan auto-refresh token sekali saat 401 (kecuali endpoint /auth/).
   * Dipakai bersama oleh request() & getBlob() agar logika refresh tunggal.
   */
  private async fetchWithAuth(
    url: string,
    init: RequestInit,
    path: string,
  ): Promise<Response> {
    let response = await fetch(url, init);
    if (response.status !== 401 || path.includes("/auth/")) return response;

    const headers = { ...(init.headers as Record<string, string>) };
    try {
      const tokens = await refreshTokens();
      if (!tokens?.access_token) {
        clearAuth();
        throw new ApiError("Sesi Anda telah berakhir. Silakan login kembali.", 401);
      }
      setTokens({ access_token: tokens.access_token, refresh_token: tokens.refresh_token });
      headers.Authorization = `Bearer ${tokens.access_token}`;
      response = await fetch(url, { ...init, headers });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      clearAuth();
      throw new ApiError("Sesi Anda telah berakhir. Silakan login kembali.", 401);
    }
    return response;
  }

  private async request<T>(options: RequestOptions<T>): Promise<T> {
    const { method, path, query, body, form, schema } = options;
    const isForm = form !== undefined;
    const httpMethod = method ?? (body !== undefined || isForm ? "POST" : "GET");

    const token = getAccessToken();
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (isForm) {
      // fetch mengatur boundary multipart; jangan paksa Content-Type.
    } else if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const requestBody = isForm
      ? form
      : body !== undefined
        ? JSON.stringify(body)
        : undefined;

    const url = this.buildUrl(path, query);
    const response = await this.fetchWithAuth(
      url,
      { method: httpMethod, headers, body: requestBody },
      path,
    );

    const json = await response.json().catch(() => null);
    const envelope = EnvelopeSchema.safeParse(json);

    if (!response.ok) {
      const message = envelope.success
        ? envelope.data.message || `HTTP ${response.status}`
        : `HTTP ${response.status}`;
      throw new ApiError(message, response.status, json);
    }
    if (!envelope.success) {
      throw new ApiError("Format respons tidak dikenali.", response.status, json);
    }

    return parsePayload(schema, envelope.data.data, path);
  }

  get<T>(path: string, schema: ResponseSchema<T>, query?: RequestOptions<T>["query"]): Promise<T> {
    return this.request({ path, schema, query, method: "GET" });
  }

  post<T>(path: string, body: unknown, schema: ResponseSchema<T>, query?: RequestOptions<T>["query"]): Promise<T> {
    return this.request({ path, schema, body, query, method: "POST" });
  }

  postForm<T>(path: string, form: FormData, schema: ResponseSchema<T>, query?: RequestOptions<T>["query"]): Promise<T> {
    return this.request({ path, schema, form, query, method: "POST" });
  }

  putForm<T>(path: string, form: FormData, schema: ResponseSchema<T>, query?: RequestOptions<T>["query"]): Promise<T> {
    return this.request({ path, schema, form, query, method: "PUT" });
  }

  put<T>(path: string, body: unknown, schema: ResponseSchema<T>, query?: RequestOptions<T>["query"]): Promise<T> {
    return this.request({ path, schema, body, query, method: "PUT" });
  }

  patch<T>(path: string, body: unknown, schema: ResponseSchema<T>, query?: RequestOptions<T>["query"]): Promise<T> {
    return this.request({ path, schema, body, query, method: "PATCH" });
  }

  delete<T>(path: string, schema: ResponseSchema<T>, query?: RequestOptions<T>["query"]): Promise<T> {
    return this.request({ path, schema, query, method: "DELETE" });
  }

  /** GET yang mengembalikan `fallback` bila request gagal (pola try/catch-return). */
  async getOr<T>(
    path: string,
    schema: ResponseSchema<T>,
    fallback: T,
    query?: RequestOptions<T>["query"],
  ): Promise<T> {
    try {
      return await this.get(path, schema, query);
    } catch {
      return fallback;
    }
  }

  /** Ambil berkas biner (mis. PDF) dengan auth + auto-refresh token. */
  async getBlob(
    path: string,
    accept = "application/pdf",
    query?: Record<string, QueryValue | QueryValue[] | undefined>,
  ): Promise<Blob> {
    const token = getAccessToken();
    const headers: Record<string, string> = { Accept: accept };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await this.fetchWithAuth(
      this.buildUrl(path, query),
      { headers },
      path,
    );
    if (!response.ok) {
      throw new ApiError(
        `Gagal mengambil berkas (HTTP ${response.status})`,
        response.status,
      );
    }
    return response.blob();
  }
}

/** Instance bersama untuk seluruh klien berbasis native fetch + Zod. */
export const http = new ApiClient(API_URL);