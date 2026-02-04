import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LinkStat } from '@/components/dashboard/LinkStat'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp, Users, Zap } from 'lucide-react'

export default function LinksPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    fetch('/api/links', {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setLinks(data.links)
        setLoading(false)
      })
  }, [user])

  const handleCreateLink = () => {
    router.push('/dashboard/links/create')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cloaked Links</h1>
          <p className="text-slate-600 mt-1">Manage and track your cloaked affiliate links</p>
        </div>
        <Button onClick={handleCreateLink} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Create New Link
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Links</p>
              <p className="text-2xl font-bold text-slate-900">{links.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Clicks</p>
              <p className="text-2xl font-bold text-slate-900">
                {links.reduce((sum, link) => sum + (link.clicks || 0), 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-emerald-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {links.length > 0 ? (
                  <span>
                    {((links.reduce((sum, link) => sum + (link.conversions || 0), 0) /
                      links.reduce((sum, link) => sum + (link.clicks || 0), 0)) * 100).toFixed(1)}
                    %
                  </span>
                ) : (
                  '0.0%'
                )}
              </p>
            </div>
            <Zap className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Your Links</h2>
        <div className="grid grid-cols-1 gap-4">
          {links.map((link) => (
            <Card key={link.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{link.slug}</span>
                    <span className="text-sm text-slate-500">→</span>
                    <span className="text-sm text-slate-500 truncate">{link.target_url}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Created: {new Date(link.created_at).toLocaleDateString()}
                  </p>
                </div>
                <LinkStat link={link} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}