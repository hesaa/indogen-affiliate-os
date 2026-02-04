import { useState, useEffect } from 'react'
import { useSession, getSession } from 'next-auth/react'
import { User } from '@prisma/client'
import { apiClient } from '@/lib/api-client'

export interface AuthUser extends User {
  plan: string
  planExpiresAt?: Date
}

export interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'loading') return

      if (session) {
        try {
          const response = await apiClient.get('/api/user')
          setUser(response.data)
        } catch (error) {
          console.error('Failed to fetch user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }

    fetchUserData()
  }, [session, status])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!session,
    logout,
  }
}