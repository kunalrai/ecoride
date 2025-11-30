/**
 * API Service for EcoRide Frontend
 *
 * Centralized service for making HTTP requests to the backend API
 * with authentication, error handling, and request/response interceptors
 */

import { API_BASE_URL, REQUEST_TIMEOUT } from './apiConfig';

// Types
interface RequestOptions extends RequestInit {
  timeout?: number;
}

interface ApiError {
  message: string;
  status?: number;
  error?: string;
}

// Token management
export const tokenManager = {
  get: (): string | null => {
    return localStorage.getItem('authToken');
  },
  set: (token: string): void => {
    localStorage.setItem('authToken', token);
  },
  remove: (): void => {
    localStorage.removeItem('authToken');
  },
};

/**
 * Create request headers with authentication
 */
const createHeaders = (customHeaders: HeadersInit = {}): Headers => {
  const headers = new Headers(customHeaders);

  // Add Content-Type if not set
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add Authorization token if available
  const token = tokenManager.get();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
};

/**
 * Fetch with timeout
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestOptions = {}
): Promise<Response> => {
  const { timeout = REQUEST_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Handle API response
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  // Check if response is ok
  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status}`;
    let errorData: ApiError | null = null;

    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }

    // Handle 401 Unauthorized - clear token and redirect to login
    if (response.status === 401) {
      tokenManager.remove();
      // You can dispatch a custom event here for your app to handle
      window.dispatchEvent(new CustomEvent('unauthorized'));
    }

    throw {
      message: errorMessage,
      status: response.status,
      error: errorData?.error,
    } as ApiError;
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  // Parse JSON response
  try {
    return await response.json();
  } catch (error) {
    throw {
      message: 'Failed to parse response',
      error: 'Invalid JSON response',
    } as ApiError;
  }
};

/**
 * API Service class
 */
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = createHeaders(options.headers);

    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'GET',
      headers,
    });

    return handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = createHeaders(options.headers);

    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = createHeaders(options.headers);

    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = createHeaders(options.headers);

    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = createHeaders(options.headers);

    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'DELETE',
      headers,
    });

    return handleResponse<T>(response);
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    // Don't set Content-Type for FormData - browser will set it with boundary
    const headers = new Headers(options.headers);
    const token = tokenManager.get();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetchWithTimeout(url, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    });

    return handleResponse<T>(response);
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;

// Also export the class for custom instances if needed
export { ApiService };
