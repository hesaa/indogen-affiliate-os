import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Play, Download, X, Check, Clock, AlertTriangle } from 'lucide-react';
import { useRenderJob } from '@/hooks/useRenderJob';
import { useToast } from '@/hooks/useToast';
import apiClient from '@/lib/api-client';

interface RenderJobCardProps {
  job: {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    progress?: number;
    createdAt: string | Date;
    outputUrl?: string;
    error?: string;
    previewUrl?: string;
  };
  onDelete?: (jobId: string) => void;
  className?: string;
}

export function RenderJobCard({ job: initialJob, onDelete, className = '' }: RenderJobCardProps) {
  const { job: polledJob, startPolling, stopPolling, error: pollError } = useRenderJob(initialJob.id);
  const toast = useToast();

  const job = polledJob || initialJob;

  const handleRefresh = async () => {
    startPolling();
  };

  const handleDownload = async () => {
    if (job.outputUrl) {
      window.open(job.outputUrl, '_blank');
    } else {
      toast.error('Download unavailable', 'The render job is not completed yet.');
    }
  };

  const handleRemove = async () => {
    if (onDelete) {
      onDelete(String(job.id));
    } else {
      try {
        await apiClient.delete(`/api/render/${job.id}`);
        toast.success('Job removed', 'The render job has been deleted.');
      } catch (error) {
        toast.error('Error removing job', 'Failed to remove the render job.');
      }
    }
  };

  const getStatusIcon = () => {
    switch (job.status) {
      case 'pending':
        return <Clock className="text-yellow-500" />;
      case 'processing':
        return <Play className="text-blue-500 animate-pulse" />;
      case 'completed':
        return <Check className="text-green-500" />;
      case 'failed':
        return <AlertTriangle className="text-red-500" />;
      default:
        return <Clock className="text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className={`relative ${className}`}>
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle className="text-sm font-medium">
          Job #{job.id}
        </CardTitle>
        <Badge variant="secondary" className={getStatusColor()}>
          {getStatusText()}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {job.error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
            <AlertTriangle className="inline mr-2 h-4 w-4" />
            {job.error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm text-gray-600">
              {getStatusText()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            {job.outputUrl && (
              <Button
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>

        {job.progress !== undefined && job.progress > 0 && (
          <Progress value={job.progress} className="h-2" />
        )}

        <CardDescription className="text-xs text-gray-500">
          Created:{' '}
          {new Date(job.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </CardDescription>
      </CardContent>


      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={handleRemove}
        disabled={job.status === 'processing'}
      >
        <X className="h-4 w-4" />
      </Button>
    </Card>
  );
}