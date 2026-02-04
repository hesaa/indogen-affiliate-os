"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { RenderJobCard } from '@/components/dashboard/RenderJobCard'
import { useRenderJobs } from '@/hooks/useRenderJob'
import { RenderJob } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Plus, Video, Clock, Check, X, Loader2 } from 'lucide-react'

const renderJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  videoUrl: z.string().url('Must be a valid URL'),
  template: z.string().min(1, 'Template is required'),
  caption: z.string().optional(),
  hashtags: z.string().optional(),
  watermark: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type RenderJobFormData = z.infer<typeof renderJobSchema>

export default function RenderPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { jobs, isLoading, createJob, deleteJob } = useRenderJobs()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RenderJobFormData>({
    resolver: zodResolver(renderJobSchema),
    defaultValues: {
      title: '',
      videoUrl: '',
      template: '',
      caption: '',
      hashtags: '',
      watermark: '',
    },
  })

  const templates = [
    { id: 'basic', name: 'Basic Template', description: 'Simple video with text overlay' },
    { id: 'dynamic', name: 'Dynamic Template', description: 'Animated transitions and effects' },
    { id: 'branded', name: 'Branded Template', description: 'With logo and watermark support' },
  ]

  const onSubmit = async (data: RenderJobFormData) => {
    setIsSubmitting(true)
    try {
      await createJob(data)
      reset()
      setSelectedTemplate('')
    } catch (error) {
      console.error('Error creating render job:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to access the dashboard</p>
          <Button onClick={() => router.push('/auth/login')} className="mt-4">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Render Jobs</h1>
          <p className="mt-2 text-gray-600">
            Create and manage your video render jobs with our automated system
          </p>
        </div>
        <Button
          size="lg"
          className="h-12"
          onClick={() => router.push('/dashboard')}
          startIcon={<Plus size={16} />}
        >
          Back to Dashboard
        </Button>
      </div>

      {/* Render Job Form */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <Input
                id="title"
                placeholder="Enter job title"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Video URL */}
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Video Source URL
              </label>
              <Input
                id="videoUrl"
                placeholder="https://example.com/video.mp4"
                {...register('videoUrl')}
                className={errors.videoUrl ? 'border-red-500' : ''}
              />
              {errors.videoUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.videoUrl.message}</p>
              )}
            </div>

            {/* Template Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`w-full p-4 border rounded-lg transition-all ${selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="mt-1 text-sm text-gray-600">{template.description}</p>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="text-blue-600" size={20} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <input
                type="hidden"
                {...register('template')}
                value={selectedTemplate}
                className={errors.template ? 'border-red-500' : ''}
              />
              {errors.template && (
                <p className="mt-1 text-sm text-red-600">{errors.template.message}</p>
              )}
            </div>

            {/* Caption */}
            <div className="md:col-span-2">
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
                Caption/Description
              </label>
              <Textarea
                id="caption"
                placeholder="Add a caption or description for your video"
                {...register('caption')}
                rows={3}
              />
            </div>

            {/* Hashtags */}
            <div>
              <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 mb-2">
                Hashtags
              </label>
              <Input
                id="hashtags"
                placeholder="#example #video #content"
                {...register('hashtags')}
              />
            </div>

            {/* Watermark */}
            <div>
              <label htmlFor="watermark" className="block text-sm font-medium text-gray-700 mb-2">
                Watermark URL (Optional)
              </label>
              <Input
                id="watermark"
                placeholder="https://example.com/logo.png"
                {...register('watermark')}
                className={errors.watermark ? 'border-red-500' : ''}
              />
              {errors.watermark && (
                <p className="mt-1 text-sm text-red-600">{errors.watermark.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || !selectedTemplate}
              className="h-12"
              startIcon={<Video size={16} />}
            >
              {isSubmitting ? 'Creating Job...' : 'Create Render Job'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Job History */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Job History</h2>
        <Badge variant="secondary">Total: {jobs?.length || 0}</Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      ) : (
        <div className="space-y-4">
          {jobs?.length > 0 ? (
            jobs.map((job: RenderJob) => (
              <RenderJobCard
                key={job.id}
                job={job}
                onDelete={() => deleteJob(job.id)}
              />
            ))
          ) : (
            <Card className="text-center py-8">
              <Video className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No render jobs yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first video render job to get started
              </p>
              <Button onClick={() => router.push('/dashboard/render')} className="h-12">
                Create First Job
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}