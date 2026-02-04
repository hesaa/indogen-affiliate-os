import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'

export default function LandingPagesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: landingPages, isLoading, error } = useQuery({
    queryKey: ['landing-pages'],
    queryFn: () => apiClient.get('/api/landing-pages'),
    enabled: !!user,
  })

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

  const filteredLandingPages = landingPages?.filter(page =>
    page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.productUrl.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Landing Pages</h1>
          <p className="text-muted-foreground mt-2">
            Manage your micro-landing pages with social proof and urgency timers
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/landing-pages/create')}
          className="h-10"
          startIcon={<Plus className="h-4 w-4" />}
        >
          Create Landing Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Input
              placeholder="Search by slug or product URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 max-w-2xl"
              startIcon={<Search className="h-4 w-4" />}
            />
          </CardTitle>
          <CardDescription>
            {landingPages?.length || 0} landing pages found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLandingPages?.map((page) => (
              <div
                key={page.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {page.slug}
                      {page.isActive && (
                        <Badge className="ml-2" variant="default">
                          Active
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {page.productUrl}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Created:{' '}
                      {new Date(page.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/landing/${page.slug}`)}
                      title="Preview"
                      startIcon={<Eye className="h-4 w-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/landing-pages/${page.id}/edit`)}
                      title="Edit"
                      startIcon={<Edit className="h-4 w-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
                      title="Delete"
                      startIcon={<Trash2 className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}