import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';
import type {
  ApiResponse,
  CompareProposalsResponse,
  CreateProposalFromEmailDto,
  Proposal
} from '@/types/models';

// API functions
export const fetchProposalsByRfp = async (rfpId: string): Promise<Proposal[]> => {
  await apiClient.post<ApiResponse<Proposal[]>>(`/email/poll`, { "rfpId": rfpId });
  const response = await apiClient.get<ApiResponse<Proposal[]>>(`/proposals/rfp/${rfpId}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch proposals');
  }
  return response.data.data || [];
};

export const createProposalFromEmail = async (
  rfpId: string,
  data: CreateProposalFromEmailDto
): Promise<Proposal> => {
  const response = await apiClient.post<ApiResponse<Proposal>>(
    `/proposals/rfp/${rfpId}/from-email`,
    data
  );
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to create proposal');
  }
  return response.data.data!;
};

export const compareProposals = async (rfpId: string): Promise<CompareProposalsResponse> => {
  const response = await apiClient.get<ApiResponse<CompareProposalsResponse>>(
    `/proposals/rfp/${rfpId}/compare`
  );
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to compare proposals');
  }
  return response.data.data!;
};

// React Query hooks
export const useProposals = (rfpId: string) => {
  return useQuery({
    queryKey: ['proposals', rfpId],
    queryFn: () => fetchProposalsByRfp(rfpId),
    enabled: !!rfpId,
  });
};

export const useCreateProposalFromEmail = (rfpId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProposalFromEmailDto) => createProposalFromEmail(rfpId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', rfpId] });
    },
  });
};

export const useCompareProposals = (rfpId: string) => {
  return useQuery({
    queryKey: ['proposals-comparison', rfpId],
    queryFn: () => compareProposals(rfpId),
    enabled: false, // Only fetch when manually triggered
  });
};
