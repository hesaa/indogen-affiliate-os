import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from 'react-query'
import { useSession } from 'next-auth/react'
import { Input, Button, Card, Badge, Select, Textarea } from '@/components/ui'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'

export default function CreateLinkPage() {
  const { data: session } = useSession()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    targetUrl: '',
    slug: '',
    cloakingType: 'basic' as 'basic' | 'advanced' | 'smart',
    description: '',
    redirectType: 'direct' as 'direct' | 'delayed' | 'multi-step',
    delaySeconds: 3,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const { mutate: createLink } = useMutation(
    async (data: typeof formData) => {
      const response = await api.post('/api/links', data)
      return response.data
    },
    {
      onSuccess: (data) => {
        setIsSubmitting(false)
        toast({
          title: 'Link created successfully',
          description: `Your cloaked link is ready: ${data.cloakedUrl}`,
          status: 'success',
        })
        router.push('/dashboard/links')
      },
      onError: (error) => {
        setIsSubmitting(false)
        toast({
          title: 'Error creating link',
          description: error.message || 'Please try again',
          status: 'error',
        })
      },
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    createLink(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Cloaked Link</h1>
        <p className="mt-2 text-gray-600">
          Generate a custom cloaked link to protect your affiliate URLs and boost conversions
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Target URL"
                name="targetUrl"
                type="url"
                placeholder="https://example.com/product?ref=123"
                value={formData.targetUrl}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>

            <div>
              <Input
                label="Custom Slug (Optional)"
                name="slug"
                placeholder="custom-link"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full"
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave blank for auto-generated slug. Only letters, numbers, and hyphens allowed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Select
                label="Cloaking Type"
                name="cloakingType"
                value={formData.cloakingType}
                onValueChange={(value) => handleSelectChange('cloakingType', value)}
                className="w-full"
              >
                <option value="basic">Basic (URL Masking)</option>
                <option value="advanced">Advanced (Bot Detection)</option>
                <option value="smart">Smart (Anti-Shadowban)</option>
              </Select>
            </div>

            <div>
              <Select
                label="Redirect Type"
                name="redirectType"
                value={formData.redirectType}
                onValueChange={(value) => handleSelectChange('redirectType', value)}
                className="w-full"
              >
                <option value="direct">Direct (Instant)</option>
                <option value="delayed">Delayed (Countdown)</option>
                <option value="multi-step">Multi-Step (Landing Page)</option>
              </Select>
            </div>

            {formData.redirectType === 'delayed' && (
              <div>
                <Input
                  label="Delay (seconds)"
                  name="delaySeconds"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.delaySeconds}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div>
            <Textarea
              label="Description (Optional)"
              name="description"
              placeholder="Add notes about this link..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full"
              rows={3}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <Badge variant="secondary">Plan: {user?.plan || 'Starter'}</Badge>
              <Badge variant="outline" className="ml-2">
                Max Links: {user?.maxLinks || 10}
              </Badge>
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/links')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.targetUrl}
                loading={isSubmitting}
              >
                Create Link
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}