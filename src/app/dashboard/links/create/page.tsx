"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function CreateLinkPage() {
  const { user } = useAuth()
  const router = useRouter()
  const toast = useToast()

  const [formData, setFormData] = useState({
    targetUrl: '',
    slug: '',
    cloakingType: 'basic' as 'basic' | 'advanced' | 'smart',
    description: '',
    redirectType: 'direct' as 'direct' | 'delayed' | 'multi-step',
    delaySeconds: 3,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await apiClient.post<any>('/api/links', formData)
      toast.success('Link created successfully')
      router.push('/dashboard/links')
    } catch (error: any) {
      console.error('Error creating link:', error)
      toast.error(error.message || 'Failed to create link')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create New Cloaked Link</h1>
        <p className="mt-2 text-slate-600">
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
              <p className="mt-1 text-xs text-slate-500">
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
                onChange={handleSelectChange}
                className="w-full"
                options={[
                  { label: 'Basic (URL Masking)', value: 'basic' },
                  { label: 'Advanced (Bot Detection)', value: 'advanced' },
                  { label: 'Smart (Anti-Shadowban)', value: 'smart' },
                ]}
              />
            </div>

            <div>
              <Select
                label="Redirect Type"
                name="redirectType"
                value={formData.redirectType}
                onChange={handleSelectChange}
                className="w-full"
                options={[
                  { label: 'Direct (Instant)', value: 'direct' },
                  { label: 'Delayed (Countdown)', value: 'delayed' },
                  { label: 'Multi-Step (Landing Page)', value: 'multi-step' },
                ]}
              />
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

          <div className="flex justify-between items-center border-t pt-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Plan: {user?.plan || 'Starter'}</Badge>
              <Badge variant="outline">
                Unlimited for your tier
              </Badge>
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/dashboard/links')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.targetUrl}
                startIcon={isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : null}
              >
                {isSubmitting ? 'Creating...' : 'Create Link'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}