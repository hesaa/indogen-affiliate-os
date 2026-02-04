"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LinkStat } from '@/components/dashboard/LinkStat'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp, Users, Zap, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api-client'

export default function LinksPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await apiClient.get<any[]>('/api/links')
        setLinks(response || [])
      } catch (error) {
        console.error('Failed to fetch links:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchLinks()
    }
  }, [user])

  const handleCreateLink = () => {
    router.push('/dashboard/links/create')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    )
  }

  const totalClicks = links.reduce((sum, link) => sum + (link.click_count || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cloaked Links</h1>
          <p className="text-slate-600 mt-1">Manage and track your cloaked affiliate links</p>
        </div>
        <Button onClick={handleCreateLink} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                {totalClicks}
              </p>
            </div>
            <Users className="h-8 w-8 text-emerald-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Links</p>
              <p className="text-2xl font-bold text-slate-900">
                {links.filter(l => l.is_active).length}
              </p>
            </div>
            <Zap className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Your Links</h2>
        <div className="grid grid-cols-1 gap-4">
          {links.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center">
                <Users className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No links yet</h3>
                <p className="text-slate-500 mb-6">Create your first cloaked link to start tracking performance.</p>
                <Button onClick={handleCreateLink}>Create First Link</Button>
              </div>
            </Card>
          ) : (
            links.map((link) => (
              <Card key={link.id} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 break-all">{link.slug}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-sm text-slate-500 truncate max-w-[200px] md:max-w-md block" title={link.original_url}>
                        {link.original_url}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Created: {new Date(link.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className={link.is_active ? 'text-green-600' : 'text-red-600'}>
                        {link.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <LinkStat
                      slug={link.slug}
                      clicks={link.click_count || 0}
                      conversions={0}
                      conversionRate={0}
                      createdAt={link.created_at}
                      onCopy={() => {
                        const baseUrl = window.location.origin;
                        const cloakedUrl = `${baseUrl}/api/redirect/${link.slug}`;
                        navigator.clipboard.writeText(cloakedUrl);
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}