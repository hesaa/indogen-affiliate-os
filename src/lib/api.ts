// src/lib/api.ts
import { API_BASE_URL } from '@/config/constants'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { mutate } from 'swr'
import { APIError, APIResponse } from '@/types/index'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

const apiClient = async <T>(
  endpoint: string,
  method: Method = 'GET',
  data?: any,
  options: RequestInit = {}
): Promise<APIResponse<T>> => {
  const auth = useAuth()
  const toast = useToast()

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth.user?.token && { Authorization: `Bearer ${auth.user.token}` }),
      ...options.headers,
    },
    ...options,
  }

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || 'An error occurred'
      
      if (response.status === 401) {
        auth.logout()
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(errorMessage)
      }

      throw new APIError(errorMessage, response.status)
    }

    const result = await response.json()
    return result
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    toast.error('Network error. Please try again.')
    throw new APIError('Network error', 500)
  }
}

export const api = {
  auth: {
    login: async (credentials: { email: string; password: string }) =>
      apiClient<{ user: any; token: string }>('/auth/login', 'POST', credentials),
    register: async (userData: any) =>
      apiClient<{ user: any; token: string }>('/auth/register', 'POST', userData),
    logout: async () => apiClient('/auth/logout', 'POST'),
  },
  render: {
    create: async (jobData: any) =>
      apiClient<{ id: string; status: string }>('/api/render', 'POST', jobData),
    list: async () => apiClient<any[]>('/api/render', 'GET'),
    get: async (id: string) => apiClient<any>('/api/render/' + id, 'GET'),
  },
  links: {
    create: async (linkData: any) =>
      apiClient<{ id: string; slug: string }>('/api/links', 'POST', linkData),
    list: async () => apiClient<any[]>('/api/links', 'GET'),
    get: async (slug: string) => apiClient<any>('/api/links/' + slug, 'GET'),
    delete: async (slug: string) => apiClient('/api/links/' + slug, 'DELETE'),
  },
  comments: {
    triggers: {
      create: async (triggerData: any) =>
        apiClient<{ id: string }>('/api/comments/triggers', 'POST', triggerData),
      list: async () => apiClient<any[]>('/api/comments/triggers', 'GET'),
      update: async (id: string, triggerData: any) =>
        apiClient('/api/comments/triggers/' + id, 'PUT', triggerData),
      delete: async (id: string) =>
        apiClient('/api/comments/triggers/' + id, 'DELETE'),
    },
    accounts: {
      connect: async (accountData: any) =>
        apiClient<{ id: string }>('/api/comments/accounts', 'POST', accountData),
      list: async () => apiClient<any[]>('/api/comments/accounts', 'GET'),
      disconnect: async (id: string) =>
        apiClient('/api/comments/accounts/' + id, 'DELETE'),
    },
    scan: {
      trigger: async (scanData: any) =>
        apiClient('/api/comments/scan', 'POST', scanData),
    },
  },
  landingPages: {
    create: async (pageData: any) =>
      apiClient<{ slug: string }>('/api/landing-pages', 'POST', pageData),
    list: async () => apiClient<any[]>('/api/landing-pages', 'GET'),
    get: async (slug: string) => apiClient<any>('/api/landing-pages/' + slug, 'GET'),
    update: async (slug: string, pageData: any) =>
      apiClient('/api/landing-pages/' + slug, 'PUT', pageData),
    delete: async (slug: string) =>
      apiClient('/api/landing-pages/' + slug, 'DELETE'),
  },
}

export type { Method }