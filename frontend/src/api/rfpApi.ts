import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';
import type { 
  ApiResponse, 
  AttachVendorsDto, 
  CreateRfpFromNLDto, 
  Rfp, 
  SendRfpEmailsResponse 
} from '@/types/models';

// API functions
export const fetchRfps = async (): Promise<Rfp[]> => {
  const response = await apiClient.get<ApiResponse<Rfp[]>>('/rfps');
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch RFPs');
  }
  return response.data.data || [];
};

export const fetchRfpById = async (id: string): Promise<Rfp> => {
  const response = await apiClient.get<ApiResponse<Rfp>>(`/rfps/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch RFP');
  }
  return response.data.data!;
};

export const createRfpFromNL = async (data: CreateRfpFromNLDto): Promise<Rfp> => {
  const response = await apiClient.post<ApiResponse<Rfp>>('/rfps/nl', data);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to create RFP');
  }
  return response.data.data!;
};

export const attachVendorsToRfp = async (rfpId: string, data: AttachVendorsDto): Promise<Rfp> => {
  const response = await apiClient.post<ApiResponse<Rfp>>(`/rfps/${rfpId}/vendors`, data);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to attach vendors');
  }
  return response.data.data!;
};

export const sendRfpEmails = async (rfpId: string): Promise<SendRfpEmailsResponse> => {
  const response = await apiClient.post<ApiResponse<SendRfpEmailsResponse>>(`/rfps/${rfpId}/send`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to send RFP emails');
  }
  return response.data.data!;
};

// React Query hooks
export const useRfps = () => {
  return useQuery({
    queryKey: ['rfps'],
    queryFn: fetchRfps,
  });
};

export const useRfp = (rfpId: string) => {
  return useQuery({
    queryKey: ['rfp', rfpId],
    queryFn: () => fetchRfpById(rfpId),
    enabled: !!rfpId,
  });
};

export const useCreateRfpFromText = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRfpFromNL,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
  });
};

export const useAttachVendors = (rfpId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AttachVendorsDto) => attachVendorsToRfp(rfpId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfp', rfpId] });
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
  });
};

export const useSendRfpEmails = (rfpId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => sendRfpEmails(rfpId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfp', rfpId] });
    },
  });
};
