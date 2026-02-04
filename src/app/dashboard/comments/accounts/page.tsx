import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Plus, Trash2, Instagram, TikTok, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

export default function AccountsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    fetchAccounts()
  }, [user])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/comments/accounts')
      setAccounts(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accounts')
      toast.error('Failed to fetch accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (platform: 'tiktok' | 'instagram') => {
    try {
      setLoading(true)
      const response = await api.post('/api/comments/accounts', { platform })
      window.location.href = response.data.oauthUrl
    } catch (err: any) {
      setError(err.message || `Failed to connect ${platform} account`)
      toast.error(`Failed to connect ${platform} account`)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    try {
      setLoading(true)
      await api.delete(`/api/comments/accounts/${accountId}`)
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Social Account Connections</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => handleConnect('instagram')}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Instagram className="h-4 w-4" />
            Connect Instagram
          </Button>
          <Button
            onClick={() => handleConnect('tiktok')}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <TikTok className="h-4 w-4" />
            Connect TikTok
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 mr-2 inline" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <Card key={account.id} className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                {account.platform === 'instagram' ? (
                  <Instagram className="h-4 w-4 text-blue-600" />
                ) : (
                  <TikTok className="h-4 w-4 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold">
                {account.username || account.platform}
              </h3>
              <Badge variant="secondary">{account.platform}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Followers:</span>
                <span>{account.followers || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Status:</span>
                <span className="text-green-600 font-medium">
                  {account.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <Button
              onClick={() => handleDisconnect(account.id)}
              className="absolute top-2 right-2"
              variant="ghost"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No social accounts connected yet
          </p>
          <div className="flex justify-center gap-2">
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
              <TikTok className="h-4 w-4 mr-2" />
              Connect TikTok
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}