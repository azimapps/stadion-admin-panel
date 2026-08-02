import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stadio-backend-pythoon-production.up.railway.app';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | undefined {
    return Cookies.get('token');
  }

  private logout(): void {
    Cookies.remove('token');
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, skipAuth = false } = options;

    const token = this.getToken();

    // If no token and auth is required, redirect to login
    if (!token && !skipAuth) {
      this.logout();
      throw new Error('No authentication token');
    }

    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    if (token && !skipAuth) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    if (body && !(body instanceof FormData)) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    let response: Response;
    const url = `${this.baseUrl}${endpoint}`;

    try {
      response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      // Network error (CORS, offline, etc.)
      console.error('API Request failed to:', url);
      console.error('Error:', error);
      throw new Error('Server bilan bog\'lanishda xatolik. Internet aloqangizni tekshiring.');
    }

    // Handle 401 Unauthorized - auto logout
    if (response.status === 401) {
      this.logout();
      throw new Error('Session expired. Please login again.');
    }

    // Handle other errors
    if (!response.ok) {
      let errorMessage = `Request failed: ${response.status}`;
      try {
        const errorData = await response.json();
        const detail = errorData.detail ?? errorData.message;
        if (Array.isArray(detail)) {
          // FastAPI 422 validation errors: detail is an array of { loc, msg }.
          // Flatten to a readable string instead of "[object Object]".
          errorMessage = detail
            .map((e: { loc?: unknown[]; msg?: string }) => {
              const field = Array.isArray(e.loc)
                ? e.loc.filter((p) => p !== "body").join(".")
                : "";
              return field ? `${field}: ${e.msg}` : e.msg;
            })
            .filter(Boolean)
            .join("; ") || errorMessage;
        } else if (typeof detail === "string" && detail) {
          errorMessage = detail;
        }
      } catch {
        // ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Convenience methods
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_URL || '');
