import useTransformedRecordStore from '@/store/engStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useGetEngRecords = ({ 
  assets = null,
  fromDate = null, 
  toDate = null 
} = {}) => {

  // console.log("Fetching records with asset:", assets, "fromDate:", fromDate, "toDate:", toDate);
    
  const setRawRecords = useTransformedRecordStore((state) => state.setRawRecords);
  const queryClient = useQueryClient();

  const queryKey = ['rawRecords', assets, fromDate, toDate];

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (assets) params.append('assets', assets);
    
    if (fromDate) {
      const formattedFromDate = fromDate instanceof Date ? fromDate.toISOString().split('T')[0] : fromDate;
      params.append('fromDate', formattedFromDate);
    }
    if (toDate) {
      const formattedToDate = toDate instanceof Date ? toDate.toISOString().split('T')[0] : toDate;
      params.append('toDate', formattedToDate);
    }
    
    // Use the correct API endpoint that matches your file structure
    return `/api/eng${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const { data, isError, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(buildUrl(), { cache: 'no-store' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch records');
      }
      return response.json();
    },
    onError: (error) => {
      console.error('Failed to fetch records:', error);
    },
  });

  useEffect(() => {
    // console.log("Fetched data:", data);
    
    if (data && Array.isArray(data)) {
      setRawRecords(data);
    }
  }, [data, setRawRecords]);

  const refetchRecords = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    data,
    isError,
    isLoading,
    error,
    refetchRecords,
  };
};