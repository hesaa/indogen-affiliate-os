import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession, getSession } from 'next-auth/react'
import { User } from '@/lib/db/schema'
import apiClient from '@/lib/api-client'
import { AuthUser as AuthUserType } from '@/types'

export interface AuthUser extends AuthUserType {
  planExpiresAt?: Date
}

export interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'loading') return

      if (session) {
        try {
          const response = await apiClient.get<AuthUser>('/api/user')
          setUser(response as AuthUser)
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
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!session, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}