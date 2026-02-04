import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import apiClient from '@/lib/api-client';
import { RenderJob, UploadProgress } from '@/types';

export function useRenderJobs() {
  const [jobs, setJobs] = useState<RenderJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get<RenderJob[]>('/api/render')
      // If response is { success: true, jobs: [] }
      if (response && (response as any).jobs) {
        setJobs((response as any).jobs)
      } else if (Array.isArray(response)) {
        setJobs(response)
      }
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteJob = async (id: string) => {
    try {
      await apiClient.delete(`/api/render/${id}`)
      setJobs(prev => prev.filter(j => j.id !== id))
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete job')
    }
  }

  const createJob = async (data: any) => {
    try {
      await apiClient.post('/api/render', data)
      await fetchJobs()
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create job')
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  return { jobs, isLoading, error, refresh: fetchJobs, deleteJob, createJob }
}

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
        const response = await apiClient.get<RenderJob>(`/api/render/${jobId}`);
        setJob(response as RenderJob);

        if ((response as any).status === 'completed' || (response as any).status === 'failed') {
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

      const response = await apiClient.post<RenderJob>('/api/render', formData as any);

      setJob(response as RenderJob);
      startPolling();
      return response;
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file');
      return null;
    }
  };

  const retryJob = async () => {
    if (!jobId || !user?.id) return null;

    try {
      const response = await apiClient.post<RenderJob>(`/api/render/${jobId}/retry`);
      setJob(response as RenderJob);
      startPolling();
      return response;
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

  const fetchJob = async () => {
    if (!jobId) return;
    try {
      const response = await apiClient.get<RenderJob>(`/api/render/${jobId}`);
      if (response && (response as any).job) {
        setJob((response as any).job);
      } else {
        setJob(response as RenderJob);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch job');
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  useEffect(() => {
    if (isPolling && jobId) {
      const interval = setInterval(fetchJob, 3000);
      return () => clearInterval(interval);
    }
  }, [isPolling, jobId]);

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
    refetch: fetchJob
  };
}