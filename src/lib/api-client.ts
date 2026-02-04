import { API_BASE_URL } from '@/config/constants'
import { ApiError } from '@/types'

async function getHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    // Client-side: Read token from document.cookie
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } else {
    // Server-side: Use next/headers (cookies)
    try {
      // Use dynamic import to prevent client-side build errors
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      // cookies() might not be available in some server-side contexts (e.g., STATIC generation)
      console.warn('API Client: Could not access cookies in this server context.');
    }
  }

  return headers;
}

const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const headers = await getHeaders();
    const baseUrl = typeof window !== 'undefined' ? '' : API_BASE_URL;
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText || `Request failed with status ${response.status}`;
      throw new ApiError(response.status, errorMessage);
    }

    return response.json()
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await getHeaders();
    const baseUrl = typeof window !== 'undefined' ? '' : API_BASE_URL;
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText || `Request failed with status ${response.status}`;
      throw new ApiError(response.status, errorMessage);
    }

    return response.json()
  },

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await getHeaders();
    const baseUrl = typeof window !== 'undefined' ? '' : API_BASE_URL;
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText || `Request failed with status ${response.status}`;
      throw new ApiError(response.status, errorMessage);
    }

    return response.json()
  },

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await getHeaders();
    const baseUrl = typeof window !== 'undefined' ? '' : API_BASE_URL;
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText || `Request failed with status ${response.status}`;
      throw new ApiError(response.status, errorMessage);
    }

    return response.json()
  },
}

export default apiClient