import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api-client';
import { RenderJob, UploadProgress } from '@/types';

export function useRenderJob(jobId?: string) {
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<RenderJob | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = async () => {
    if (!jobId || !user?.id) return;

    setIsPolling(true);
    const controller = new AbortController();

    const poll = async () => {
      try {
        const response = await apiClient.get(`/api/render/${jobId}`, {
          signal: controller.signal,
        });
        setJob(response.data);

        if (response.data.status === 'completed' || response.data.status === 'failed') {
          clearInterval(pollRef.current!);
          setIsPolling(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollRef.current!);
        setIsPolling(false);
        setError('Failed to poll job status');
      }
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setIsPolling(false);
  };

  const uploadFile = async (file: File) => {
    if (!user?.id) return null;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const response = await apiClient.post('/api/render', formData, {
        onUploadProgress: (progress) => {
          setUploadProgress({
            loaded: progress.loaded,
            total: progress.total,
            percent: Math.round((progress.loaded / progress.total) * 100),
          });
        },
      });

      setJob(response.data);
      startPolling();
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file');
      return null;
    }
  };

  const retryJob = async () => {
    if (!jobId || !user?.id) return null;

    try {
      const response = await apiClient.post(`/api/render/${jobId}/retry`);
      setJob(response.data);
      startPolling();
      return response.data;
    } catch (error) {
      console.error('Retry error:', error);
      setError('Failed to retry job');
      return null;
    }
  };

  const cancelJob = async () => {
    if (!jobId || !user?.id) return null;

    try {
      await apiClient.delete(`/api/render/${jobId}`);
      stopPolling();
      setJob(null);
      router.push('/dashboard/render');
      return true;
    } catch (error) {
      console.error('Cancel error:', error);
      setError('Failed to cancel job');
      return false;
    }
  };

  useEffect(() => {
    if (jobId) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [jobId, user?.id]);

  return {
    job,
    uploadProgress,
    isPolling,
    error,
    uploadFile,
    retryJob,
    cancelJob,
    startPolling,
    stopPolling,
  };
}