import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from 'react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { toast } from '@/hooks/useToast'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Plus, Clock, Star, Link, Zap } from 'lucide-react'

export default function CreateLandingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    productUrl: '',
    pageTitle: '',
    pageDescription: '',
    timerEnabled: true,
    timerHours: 24,
    socialProof: 'auto' as const,
    urgencyLevel: 'medium' as const,
  })

  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => api.get('/api/landing-pages/platforms'),
  })

  const createLandingPageMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post('/api/landing-pages', data),
    onSuccess: (response) => {
      toast({
        title: 'Landing page created successfully',
        description: 'Your landing page is being generated',
        status: 'success',
      })
      router.push('/dashboard/landing-pages')
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating landing page',
        description: error?.response?.data?.message || 'Please try again',
        status: 'error',
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createLandingPageMutation.mutate(formData)
  }

  const handleInputChange = (key: keyof typeof formData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Landing Page</h1>
        <p className="mt-2 text-gray-600">Generate high-converting micro-landing pages with social proof and urgency timers</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="productUrl" className="mb-2">
                Product URL
              </Label>
              <Input
                id="productUrl"
                type="url"
                placeholder="https://example.com/product"
                value={formData.productUrl}
                onChange={(e) => handleInputChange('productUrl', e.target.value)}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the product page URL to scrape reviews and details
              </p>
            </div>

            <div>
              <Label htmlFor="pageTitle" className="mb-2">
                Page Title
              </Label>
              <Input
                id="pageTitle"
                placeholder="Best Product Name - Limited Time Offer"
                value={formData.pageTitle}
                onChange={(e) => handleInputChange('pageTitle', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pageDescription" className="mb-2">
              Page Description
            </Label>
            <Textarea
              id="pageDescription"
              placeholder="Limited time offer on Product Name! Get it now before it's gone..."
              value={formData.pageDescription}
              onChange={(e) => handleInputChange('pageDescription', e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="socialProof" className="mb-2">
                Social Proof Source
              </Label>
              <Select
                id="socialProof"
                value={formData.socialProof}
                onChange={(e) => handleInputChange('socialProof', e.target.value)}
                required
              >
                <option value="auto">Auto-detect from URL</option>
                {platforms?.data?.platforms?.map((platform: string) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
                <option value="manual">Manual input</option>
              </Select>
              <p className="mt-1 text-sm text-gray-500">
                Source for customer reviews and ratings
              </p>
            </div>

            <div>
              <Label htmlFor="timerEnabled" className="mb-2 flex items-center justify-between">
                <span>Enable Timer</span>
                <input
                  id="timerEnabled"
                  type="checkbox"
                  checked={formData.timerEnabled}
                  onChange={(e) => handleInputChange('timerEnabled', e.target.checked)}
                  className="form-checkbox"
                />
              </Label>
              {formData.timerEnabled && (
                <Select
                  id="timerHours"
                  value={formData.timerHours}
                  onChange={(e) => handleInputChange('timerHours', parseInt(e.target.value))}
                >
                  <option value={6}>6 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                  <option value={72}>72 hours</option>
                </Select>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Create urgency with countdown timer
              </p>
            </div>

            <div>
              <Label htmlFor="urgencyLevel" className="mb-2">
                Urgency Level
              </Label>
              <Select
                id="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={(e) => handleInputChange('urgencyLevel', e.target.value)}
              >
                <option value="low">Low - Gentle reminder</option>
                <option value="medium">Medium - Standard urgency</option>
                <option value="high">High - Strong urgency</option>
              </Select>
              <p className="mt-1 text-sm text-gray-500">
                Set the intensity of urgency messaging
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge variant="default">
                <Clock className="w-4 h-4 mr-1" />
                {formData.timerEnabled ? `${formData.timerHours}h` : 'Disabled'}
              </Badge>
              <Badge variant="default">
                <Star className="w-4 h-4 mr-1" />
                {formData.socialProof}
              </Badge>
              <Badge variant="default">
                <Zap className="w-4 h-4 mr-1" />
                {formData.urgencyLevel}
              </Badge>
            </div>
            <Button 
              type="submit" 
              disabled={createLandingPageMutation.isLoading}
              className="flex items-center space-x-2"
            >
              {createLandingPageMutation.isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Landing Page
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}