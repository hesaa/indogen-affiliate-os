import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/config/constants'
import { ApiError } from '@/types'

const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
    })

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: requestHeaders,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData.message || response.statusText)
    }

    return response.json()
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
    })

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData.message || response.statusText)
    }

    return response.json()
  },

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
    })

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData.message || response.statusText)
    }

    return response.json()
  },

  async delete<T>(endpoint: string): Promise<T> {
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
    })

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: requestHeaders,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData.message || response.statusText)
    }

    return response.json()
  },
}

export default apiClient