import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRenderJob } from '@/hooks/useRenderJob'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Video, Download, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function RenderJobPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const { user } = useAuth()
  const { job, error, refetch, isPolling } = useRenderJob(id)
  const status = job?.status

  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (error) {
      console.error('Error fetching render job:', error)
    }
  }, [error])

  const handleDownload = async () => {
    if (!job?.outputUrl) return

    setIsDownloading(true)
    try {
      const response = await fetch(job.outputUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `render_${job.id}_${new Date().toISOString().split('T')[0]}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto text-muted-foreground animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading render job...</p>
        </div>
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Render Job #{job.id}</h1>
        <Button onClick={() => router.push('/dashboard/render')} variant="outline">
          Back to Jobs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Job Status
          </CardTitle>
          <CardDescription>
            {new Date(job.createdAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                {status}
              </Badge>
            </div>

            {job.inputUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Input Video</p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <a
                    href={job.inputUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {new URL(job.inputUrl).pathname.split('/').pop()}
                  </a>
                </div>
              </div>
            )}

            {job.outputUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Output Video</p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <a
                    href={job.outputUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {new URL(job.outputUrl).pathname.split('/').pop()}
                  </a>
                </div>
              </div>
            )}

            {job.metadata && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Processing Details</p>
                <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                  {Object.entries(job.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{key}</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status === 'completed' && (
              <div className="flex gap-3">
                <Button onClick={handleDownload} disabled={isDownloading}>
                  {isDownloading ? 'Downloading...' : 'Download Video'}
                </Button>
                <Button
                  onClick={() => window.open(job.outputUrl, '_blank')}
                  variant="outline"
                >
                  Preview in New Tab
                </Button>
              </div>
            )}

            {status === 'failed' && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800">
                  Processing failed. Please try again or contact support.
                </p>
                {job.error && (
                  <pre className="mt-2 p-2 bg-red-100 rounded text-sm text-red-700">
                    {job.error}
                  </pre>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => refetch()} disabled={isPolling}>
          Refresh Status
        </Button>
        {user?.plan === 'pro' && (
          <Button
            onClick={() => router.push(`/dashboard/render/${id}/edit`)}
            variant="outline"
          >
            Re-render with Changes
          </Button>
        )}
      </div>
    </div>
  )
}