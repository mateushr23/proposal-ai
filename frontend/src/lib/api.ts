const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface RequestOptions {
  method?: string;
  body?: unknown;
}

class ApiClient {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body } = options;

    const config: RequestInit = {
      method,
      credentials: "include",
    };

    if (body !== undefined) {
      config.headers = { "Content-Type": "application/json" };
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (response.status === 401 && !endpoint.startsWith("/api/auth/")) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
      const error = new Error(errorData.error ?? errorData.message ?? "Erro na requisição");
      (error as Error & { status: number }).status = response.status;
      throw error;
    }

    return response.json() as Promise<T>;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();
