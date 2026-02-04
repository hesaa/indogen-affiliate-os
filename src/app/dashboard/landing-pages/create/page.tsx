"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'
import { Plus, Clock, Star, Zap, Loader2 } from 'lucide-react'

export default function CreateLandingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()

  const [formData, setFormData] = useState({
    productUrl: '',
    pageTitle: '',
    pageDescription: '',
    timerEnabled: true,
    timerHours: 24,
    socialProof: 'auto' as string,
    urgencyLevel: 'medium' as string,
  })

  const { data: platformsData } = useQuery<any>({
    queryKey: ['platforms'],
    queryFn: () => apiClient.get<any>('/api/landing-pages/platforms'),
  })

  const createLandingPageMutation = useMutation({
    mutationFn: (data: typeof formData) => apiClient.post<any>('/api/landing-pages', data),
    onSuccess: () => {
      toastSuccess('Landing page created successfully', 'Your landing page is being generated')
      router.push('/dashboard/landing-pages')
    },
    onError: (error: any) => {
      toastError('Error creating landing page', error.message || 'Please try again')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createLandingPageMutation.mutate(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData(prev => ({ ...prev, [name]: finalValue }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const platformOptions = [
    { label: 'Auto-detect from URL', value: 'auto' },
    ...(platformsData?.platforms?.map((p: string) => ({ label: p, value: p })) || []),
    { label: 'Manual input', value: 'manual' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create New Landing Page</h1>
        <p className="mt-2 text-slate-600">Generate high-converting micro-landing pages with social proof and urgency timers</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product URL"
              name="productUrl"
              type="url"
              placeholder="https://example.com/product"
              value={formData.productUrl}
              onChange={handleInputChange}
              required
              description="Enter the product page URL to scrape reviews and details"
            />

            <Input
              label="Page Title"
              name="pageTitle"
              placeholder="Best Product Name - Limited Time Offer"
              value={formData.pageTitle}
              onChange={handleInputChange}
              required
            />
          </div>

          <Textarea
            label="Page Description"
            name="pageDescription"
            placeholder="Limited time offer on Product Name! Get it now before it's gone..."
            value={formData.pageDescription}
            onChange={handleInputChange}
            rows={3}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              label="Social Proof Source"
              name="socialProof"
              value={formData.socialProof}
              onChange={handleSelectChange}
              options={platformOptions}
              description="Source for customer reviews and ratings"
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block">Urgency Timer</label>
              <div className="flex items-center gap-4 p-2 border rounded-md bg-slate-50">
                <input
                  id="timerEnabled"
                  name="timerEnabled"
                  type="checkbox"
                  checked={formData.timerEnabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="timerEnabled" className="text-sm text-slate-600 cursor-pointer">
                  Enable Countdown
                </label>
              </div>
              {formData.timerEnabled && (
                <Select
                  name="timerHours"
                  value={formData.timerHours}
                  onChange={handleSelectChange}
                  options={[
                    { label: '6 hours', value: '6' },
                    { label: '12 hours', value: '12' },
                    { label: '24 hours', value: '24' },
                    { label: '48 hours', value: '48' },
                    { label: '72 hours', value: '72' },
                  ]}
                />
              )}
            </div>

            <Select
              label="Urgency Level"
              name="urgencyLevel"
              value={formData.urgencyLevel}
              onChange={handleSelectChange}
              options={[
                { label: 'Low - Gentle reminder', value: 'low' },
                { label: 'Medium - Standard urgency', value: 'medium' },
                { label: 'High - Strong urgency', value: 'high' },
              ]}
              description="Set the intensity of urgency messaging"
            />
          </div>

          <div className="flex items-center justify-between border-t pt-6">
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formData.timerEnabled ? `${formData.timerHours}h` : 'No Timer'}
              </Badge>
              <Badge variant="secondary" className="flex items-center">
                <Star className="w-3 h-3 mr-1" />
                {formData.socialProof}
              </Badge>
              <Badge variant="secondary" className="flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                {formData.urgencyLevel}
              </Badge>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/dashboard/landing-pages')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLandingPageMutation.isPending}
                className="text-white"
              >
                {createLandingPageMutation.isPending ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Landing Page
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}