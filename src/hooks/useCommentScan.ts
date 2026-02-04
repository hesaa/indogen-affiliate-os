import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CommentScanResponse, ScanStatus } from '@/types';

export const useCommentScan = () => {
  const queryClient = useQueryClient();

  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scanProgress, setScanProgress] = useState<number>(0);

  const triggerScan = useMutation(
    async (accountIds: string[]) => {
      const response = await apiClient.post<CommentScanResponse>('/api/comments/scan', {
        accountIds,
      });
      return response.data;
    },
    {
      onMutate: async (accountIds: string[]) => {
        setScanStatus('scanning');
        setScanProgress(0);
        await queryClient.cancelQueries({ queryKey: ['comment-scan'] });
        const previousScan = queryClient.getQueryData<CommentScanResponse>(['comment-scan']);
        queryClient.setQueryData(['comment-scan'], { ...previousScan, status: 'scanning' });
        return { previousScan };
      },
      onError: (err, variables, context: any) => {
        setScanStatus('error');
        if (context?.previousScan) {
          queryClient.setQueryData(['comment-scan'], context.previousScan);
        }
      },
      onSuccess: (data) => {
        queryClient.setQueryData(['comment-scan'], data);
      },
    }
  );

  const pollScanStatus = useCallback(async () => {
    try {
      const response = await apiClient.get<CommentScanResponse>('/api/comments/scan/status');
      const { data } = response;
      setScanProgress(data.progress || 0);

      if (data.status === 'completed' || data.status === 'error') {
        setScanStatus(data.status);
        queryClient.setQueryData(['comment-scan'], data);
        return;
      }

      setScanStatus(data.status);
      setTimeout(pollScanStatus, 2000);
    } catch (error) {
      setScanStatus('error');
    }
  }, [queryClient]);

  const { data: scanData, isLoading: isScanLoading } = useQuery({
    queryKey: ['comment-scan'],
    queryFn: async () => {
      const response = await apiClient.get<CommentScanResponse>('/api/comments/scan/status');
      return response.data;
    },
    enabled: false,
  });

  const startScan = useCallback(
    async (accountIds: string[]) => {
      await triggerScan.mutateAsync(accountIds);
      pollScanStatus();
    },
    [triggerScan, pollScanStatus]
  );

  const resetScan = useCallback(() => {
    setScanStatus('idle');
    setScanProgress(0);
    queryClient.removeQueries({ queryKey: ['comment-scan'] });
  }, [queryClient]);

  return {
    scanStatus,
    scanProgress,
    isScanLoading,
    scanData,
    startScan,
    resetScan,
    triggerScan: triggerScan.mutateAsync,
  };
};