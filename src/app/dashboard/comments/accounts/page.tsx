"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Instagram, Music, AlertCircle, Trash2, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/useToast'

export default function AccountsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<any[]>('/api/comments/accounts')
      setAccounts(response || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accounts')
      toast.error('Failed to fetch accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAccounts()
    }
  }, [user])

  const handleConnect = async (platform: 'tiktok' | 'instagram') => {
    try {
      setLoading(true)
      const response = await apiClient.post<any>('/api/comments/accounts', { platform })
      if (response && response.oauthUrl) {
        window.location.href = response.oauthUrl
      } else {
        throw new Error('No OAuth URL returned')
      }
    } catch (err: any) {
      setError(err.message || `Failed to connect ${platform} account`)
      toast.error(`Failed to connect ${platform} account`)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return

    try {
      setLoading(true)
      await apiClient.delete(`/api/comments/accounts/${accountId}`)
      setAccounts(accounts.filter((acc) => acc.id !== accountId))
      toast.success('Account disconnected successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect account')
      toast.error('Failed to disconnect account')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Social Connections</h1>
          <p className="text-slate-600">Connect your accounts to automate comments and bio links</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleConnect('instagram')}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Instagram className="h-4 w-4 text-pink-600" />
            Connect Instagram
          </Button>
          <Button
            onClick={() => handleConnect('tiktok')}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Music className="h-4 w-4 text-black" />
            Connect TikTok
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800 text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <Card key={account.id} className="p-6 relative bg-white overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                {account.platform === 'instagram' ? (
                  <Instagram className="h-6 w-6 text-pink-600" />
                ) : (
                  <Music className="h-6 w-6 text-black" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 truncate">
                  {account.username || account.platform}
                </h3>
                <Badge variant="secondary" className="mt-0.5 capitalize">{account.platform}</Badge>
              </div>
              <Button
                onClick={() => handleDisconnect(account.id)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Connected Since</span>
                <span className="font-medium text-slate-700">
                  {new Date(account.created_at || account.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-none">Active</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && !loading && (
        <Card className="text-center py-16 border-dashed">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Social Accounts</h3>
            <p className="text-slate-500 mb-8">
              Connect your first social account to start automating your affiliate marketing efforts.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => handleConnect('instagram')}
                disabled={loading}
              >
                <Instagram className="h-4 w-4 mr-2" />
                Connect Instagram
              </Button>
              <Button
                onClick={() => handleConnect('tiktok')}
                disabled={loading}
              >
                <Music className="h-4 w-4 mr-2" />
                Connect TikTok
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}