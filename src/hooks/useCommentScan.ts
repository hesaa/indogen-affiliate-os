import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { CommentScanResponse, ScanStatus } from '@/types';

export const useCommentScan = () => {
  const queryClient = useQueryClient();

  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scanProgress, setScanProgress] = useState<number>(0);

  const triggerScan = useMutation({
    mutationFn: async (accountIds: string[]) => {
      const response = await apiClient.post<CommentScanResponse>('/api/comments/scan', {
        accountIds,
      });
      return response;
    },
    onMutate: async (accountIds: string[]) => {
      setScanStatus('scanning');
      setScanProgress(0);
      await queryClient.cancelQueries({ queryKey: ['comment-scan'] });
      const previousScan = queryClient.getQueryData<CommentScanResponse>(['comment-scan']);
      queryClient.setQueryData(['comment-scan'], { ...previousScan, status: 'scanning' });
      return { previousScan };
    },
    onError: (err: Error, variables: string[], context: any) => {
      setScanStatus('error');
      if (context?.previousScan) {
        queryClient.setQueryData(['comment-scan'], context.previousScan);
      }
    },
    onSuccess: (data: CommentScanResponse) => {
      queryClient.setQueryData(['comment-scan'], data);
    },
  });

  const pollScanStatus = useCallback(async () => {
    try {
      const data = await apiClient.get<CommentScanResponse>('/api/comments/scan/status');
      setScanProgress((data as any).progress || 0);

      if ((data as any).status === 'completed' || (data as any).status === 'error') {
        setScanStatus((data as any).status);
        queryClient.setQueryData(['comment-scan'], data);
        return;
      }

      setScanStatus((data as any).status);
      setTimeout(pollScanStatus, 2000);
    } catch (error) {
      setScanStatus('error');
    }
  }, [queryClient]);

  const { data: scanData, isLoading: isScanLoading } = useQuery({
    queryKey: ['comment-scan'],
    queryFn: async () => {
      const response = await apiClient.get<CommentScanResponse>('/api/comments/scan/status');
      return response;
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