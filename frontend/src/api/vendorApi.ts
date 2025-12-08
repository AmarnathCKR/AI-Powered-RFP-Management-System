import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';
import type { ApiResponse, CreateVendorDto, Vendor } from '@/types/models';

// API functions
export const fetchVendors = async (): Promise<Vendor[]> => {
  const response = await apiClient.get<ApiResponse<Vendor[]>>('/vendors');
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch vendors');
  }
  return response.data.data || [];
};

export const createVendor = async (data: CreateVendorDto): Promise<Vendor> => {
  const response = await apiClient.post<ApiResponse<Vendor>>('/vendors', data);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to create vendor');
  }
  return response.data.data!;
};

// React Query hooks
export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};
