"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Plus, Edit, Trash2, Eye, Search, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'

export default function LandingPagesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, error } = useQuery<{ landingPages: any[] }>({
    queryKey: ['landing-pages'],
    queryFn: () => apiClient.get<{ landingPages: any[] }>('/api/landing-pages'),
    enabled: !!user,
  })

  const landingPages = data?.landingPages || []

  const deleteLandingPage = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/landing-pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] })
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this landing page?')) {
      await deleteLandingPage.mutateAsync(id)
    }
  }

  const filteredLandingPages = (landingPages || [])?.filter((page: any) =>
    (page.slug || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (page.productUrl || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Error: {(error as any).message || 'Failed to load landing pages'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Landing Pages</h1>
          <p className="text-slate-600 mt-2">
            Manage your micro-landing pages with social proof and urgency timers
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/landing-pages/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Landing Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by slug or product URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <CardDescription className="mt-2">
            {filteredLandingPages?.length || 0} landing pages found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLandingPages?.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No landing pages found.
              </div>
            ) : (
              filteredLandingPages.map((page: any) => (
                <div
                  key={page.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {page.slug}
                        </h3>
                        {page.is_active !== false && (
                          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1 truncate max-w-md">
                        {page.product_url || page.productUrl}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Created: {new Date(page.created_at || page.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/landing/${page.slug}`)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/landing-pages/${page.id}/edit`)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(page.id)}
                        title="Delete"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}