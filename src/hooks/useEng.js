import useTransformedRecordStore from '@/store/engStore';
import { useQuery, useQueryClient, useQueries } from '@tanstack/react-query';
import { useEffect } from 'react';

// Hook for fetching a single equipment's records
export const useGetSingleEngRecord = ({ 
  asset = null,
  fromDate = null, 
  toDate = null 
} = {}) => {
  console.log("Fetching records for single asset:", asset, "fromDate:", fromDate, "toDate:", toDate);
  
  const queryClient = useQueryClient();
  const queryKey = ['rawRecord', asset, fromDate, toDate];

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (asset) params.append('assets', asset);
    
    if (fromDate) {
      const formattedFromDate = fromDate instanceof Date ? fromDate.toISOString().split('T')[0] : fromDate;
      params.append('fromDate', formattedFromDate);
    }
    if (toDate) {
      const formattedToDate = toDate instanceof Date ? toDate.toISOString().split('T')[0] : toDate;
      params.append('toDate', formattedToDate);
    }

    return `/api/eng${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const { data, isError, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!asset) return [];
      
      const response = await fetch(buildUrl(), { cache: 'no-store' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch records');
      }

      const resData = await response.json();
      return resData;
    },
    enabled: !!asset, // Only run the query if we have an asset
    onError: (error) => {
      console.error(`Failed to fetch records for ${asset}:`, error);
    },
  });

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

// Main hook that uses useQueries to handle multiple equipment
export const useGetEngRecords = ({ 
  assets = [], // Changed to accept an array of assets
  fromDate = null, 
  toDate = null 
} = {}) => {
  const setRawRecords = useTransformedRecordStore((state) => state.setRawRecords);
  
  // Convert single asset to array if needed
  const assetsArray = assets ? (Array.isArray(assets) ? assets : [assets]) : [];
  
  // console.log("Fetching records for assets:", assetsArray, "fromDate:", fromDate, "toDate:", toDate);

  // Use useQueries to run multiple queries in parallel
  const results = useQueries({
    queries: assetsArray.map(asset => ({
      queryKey: ['rawRecord', asset, fromDate, toDate],
      queryFn: async () => {
        const params = new URLSearchParams();
        params.append('assets', asset);
        
        if (fromDate) {
          const formattedFromDate = fromDate instanceof Date ? fromDate.toISOString().split('T')[0] : fromDate;
          params.append('fromDate', formattedFromDate);
        }
        if (toDate) {
          const formattedToDate = toDate instanceof Date ? toDate.toISOString().split('T')[0] : toDate;
          params.append('toDate', formattedToDate);
        }
        
        const url = `/api/eng${params.toString() ? `?${params.toString()}` : ''}`;
        // console.log(`Fetching URL for ${asset}:`, url);
        
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch records for ${asset}`);
        }

        const resData = await response.json();
        console.log(`Fetched data for ${asset}:`, resData);
        
        return { asset, data: resData };
      },
      enabled: !!asset,
    })),
  });

  // Calculate overall loading and error states
  const isLoading = results.some(result => result.isLoading);
  const isError = results.some(result => result.isError);
  const error = results.find(result => result.error)?.error;

  // Combine all data
  const combinedData = {};
  results.forEach(result => {
    if (result.data) {
      combinedData[result.data.asset] = result.data.data;
    }
  });

  useEffect(() => {
    const allData = Object.values(combinedData).flat();
    if (allData.length > 0) {
      setRawRecords(allData);
    }
  }, [combinedData, setRawRecords]);

  return {
    data: combinedData,
    isLoading,
    isError,
    error,
    // Individual results for more granular access if needed
    results,
  };
};

// import useTransformedRecordStore from '@/store/engStore';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { useEffect } from 'react';

// export const useGetEngRecords = ({ 
//   assets = null,
//   fromDate = null, 
//   toDate = null 
// } = {}) => {

//   console.log("Fetching records with asset:", assets, "fromDate:", fromDate, "toDate:", toDate);
    
//   const setRawRecords = useTransformedRecordStore((state) => state.setRawRecords);
//   const queryClient = useQueryClient();

//   const queryKey = ['rawRecords', assets, fromDate, toDate];

//   const buildUrl = () => {
//     const params = new URLSearchParams();
//     if (assets) params.append('assets', assets);
    
//     if (fromDate) {
//       const formattedFromDate = fromDate instanceof Date ? fromDate.toISOString().split('T')[0] : fromDate;
//       params.append('fromDate', formattedFromDate);
//     }
//     if (toDate) {
//       const formattedToDate = toDate instanceof Date ? toDate.toISOString().split('T')[0] : toDate;
//       params.append('toDate', formattedToDate);
//     }
    
//     // Use the correct API endpoint that matches your file structure
//     console.log("Building URL with params:", params.toString());
//     console.log("Final URL:", `/api/eng${params.toString() ? `?${params.toString()}` : ''}`);
    
//     return `/api/eng${params.toString() ? `?${params.toString()}` : ''}`;
//   };

//   const { data, isError, isLoading, error, refetch } = useQuery({
//     queryKey,
//     queryFn: async () => {
//       const response = await fetch(buildUrl(), { cache: 'no-store' });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to fetch records');
//       }

//       const resData = await response.json();
//       return resData;
//     },
//     onError: (error) => {
//       console.error('Failed to fetch records:', error);
//     },
//   });

//   useEffect(() => {
//     // console.log("Fetched data:", data);
    
//     if (data && Array.isArray(data)) {
//       setRawRecords(data);
//     }
//   }, [data, setRawRecords]);

//   const refetchRecords = () => {
//     queryClient.invalidateQueries({ queryKey });
//   };

//   return {
//     data,
//     isError,
//     isLoading,
//     error,
//     refetchRecords,
//   };
// };



// import useTransformedRecordStore from '@/store/engStore';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { useEffect } from 'react';

// export const useGetEngRecords = ({ 
//   assets = null,
//   fromDate = null, 
//   toDate = null 
// } = {}) => {

//   // console.log("Fetching records with asset:", assets, "fromDate:", fromDate, "toDate:", toDate);
    
//   const setRawRecords = useTransformedRecordStore((state) => state.setRawRecords);
//   const queryClient = useQueryClient();

//   const queryKey = ['rawRecords', assets, fromDate, toDate];

//   const buildUrl = () => {
//     const params = new URLSearchParams();
//     if (assets) params.append('assets', assets);
    
//     if (fromDate) {
//       const formattedFromDate = fromDate instanceof Date ? fromDate.toISOString().split('T')[0] : fromDate;
//       params.append('fromDate', formattedFromDate);
//     }
//     if (toDate) {
//       const formattedToDate = toDate instanceof Date ? toDate.toISOString().split('T')[0] : toDate;
//       params.append('toDate', formattedToDate);
//     }
    
//     // Use the correct API endpoint that matches your file structure
//     return `/api/eng${params.toString() ? `?${params.toString()}` : ''}`;
//   };

//   const { data, isError, isLoading, error, refetch } = useQuery({
//     queryKey,
//     queryFn: async () => {
//       const response = await fetch(buildUrl(), { cache: 'no-store' });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to fetch records');
//       }
//       return response.json();
//     },
//     onError: (error) => {
//       console.error('Failed to fetch records:', error);
//     },
//   });

//   useEffect(() => {
//     // console.log("Fetched data:", data);
    
//     if (data && Array.isArray(data)) {
//       setRawRecords(data);
//     }
//   }, [data, setRawRecords]);

//   const refetchRecords = () => {
//     queryClient.invalidateQueries({ queryKey });
//   };

//   return {
//     data,
//     isError,
//     isLoading,
//     error,
//     refetchRecords,
//   };
// };



// import useTransformedRecordStore from '@/store/engStore';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { useEffect } from 'react';

// export const useGetEngRecords = ({ 
//   assets = null,
//   fromDate = null, 
//   toDate = null 
// } = {}) => {
//   const setRawRecords = useTransformedRecordStore((state) => state.setRawRecords);
//   const queryClient = useQueryClient();
//   // Use a unique query key that includes all parameters
//   const queryKey = ['rawRecords', assets, fromDate, toDate];

//   const buildUrl = () => {
//     const params = new URLSearchParams();
//     if (assets) params.append('assets', assets);
    
//     if (fromDate) {
//       const formattedFromDate = fromDate instanceof Date ? fromDate.toISOString().split('T')[0] : fromDate;
//       params.append('fromDate', formattedFromDate);
//     }
//     if (toDate) {
//       const formattedToDate = toDate instanceof Date ? toDate.toISOString().split('T')[0] : toDate;
//       params.append('toDate', formattedToDate);
//     }
    
//     return `/api/eng${params.toString() ? `?${params.toString()}` : ''}`;
//   };

//   const { data, isError, isLoading, error, refetch } = useQuery({
//     queryKey,
//     queryFn: async () => {
//       const response = await fetch(buildUrl(), { cache: 'no-store' });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to fetch records');
//       }
//       return response.json();
//     },
//     onError: (error) => {
//       console.error('Failed to fetch records:', error);
//     },
//     // Don't deduplicate identical queries - we need separate data for each equipment
//     staleTime: 0, 
//   });

//   useEffect(() => {
//     if (data && Array.isArray(data)) {
//       // Update store with records, specifying the assets they belong to
//       setRawRecords(data);
//     }
//   }, [data, setRawRecords]);

//   const refetchRecords = () => {
//     queryClient.invalidateQueries({ queryKey });
//   };

//   return {
//     data,
//     isError,
//     isLoading,
//     error,
//     refetchRecords,
//   };
// };

// // Custom hook to fetch details for a specific equipment
// export const useGetEquipmentDetails = (equipmentId) => {
//   const queryClient = useQueryClient();
//   const queryKey = ['equipmentDetails', equipmentId];

//   const { data, isLoading, isError, error } = useQuery({
//     queryKey,
//     queryFn: async () => {
//       if (!equipmentId) return null;
      
//       const response = await fetch(`/api/equipment/${equipmentId}`, { cache: 'no-store' });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to fetch equipment details');
//       }
//       return response.json();
//     },
//     enabled: !!equipmentId,
//     onError: (error) => {
//       console.error(`Failed to fetch details for equipment ${equipmentId}:`, error);
//     }
//   });

//   const refreshEquipmentDetails = () => {
//     queryClient.invalidateQueries({ queryKey });
//   };

//   return {
//     data,
//     isLoading,
//     isError,
//     error,
//     refreshEquipmentDetails
//   };
// };

// // Hook to handle engineering record submission
// export const useSubmitEngRecord = () => {
//   const queryClient = useQueryClient();
  
//   const submitRecord = async (recordData) => {
//     try {
//       const response = await fetch('/api/eng/submit', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(recordData)
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to submit engineering record');
//       }

//       // Refresh data
//       queryClient.invalidateQueries({ queryKey: ['rawRecords'] });
      
//       return await response.json();
//     } catch (error) {
//       console.error('Error submitting engineering record:', error);
//       throw error;
//     }
//   };

//   return {
//     submitRecord
//   };
// };

// // Hook to load equipment maintenance history
// export const useEquipmentHistory = (equipmentId) => {
//   const queryKey = ['equipmentHistory', equipmentId];

//   const { data, isLoading, isError, error } = useQuery({
//     queryKey,
//     queryFn: async () => {
//       if (!equipmentId) return [];
      
//       const response = await fetch(`/api/eng/history/${equipmentId}`, { cache: 'no-store' });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to fetch equipment history');
//       }
//       return response.json();
//     },
//     enabled: !!equipmentId,
//     onError: (error) => {
//       console.error(`Failed to fetch history for equipment ${equipmentId}:`, error);
//     }
//   });

//   return {
//     history: data || [],
//     isLoading,
//     isError,
//     error
//   };
// };

// // Hook to update an existing engineering record
// export const useUpdateEngRecord = () => {
//   const queryClient = useQueryClient();
  
//   const updateRecord = async (recordId, updatedData) => {
//     try {
//       const response = await fetch(`/api/eng/${recordId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(updatedData)
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to update engineering record');
//       }

//       // Refresh queries that might be affected
//       queryClient.invalidateQueries({ queryKey: ['rawRecords'] });
//       queryClient.invalidateQueries({ queryKey: ['equipmentHistory'] });
      
//       return await response.json();
//     } catch (error) {
//       console.error('Error updating engineering record:', error);
//       throw error;
//     }
//   };

//   return {
//     updateRecord
//   };
// };

// // Hook to handle file uploads for engineering records
// export const useEngFileUpload = () => {
//   const uploadFiles = async (recordId, files) => {
//     try {
//       const formData = new FormData();
      
//       // Append each file to the form data
//       Array.from(files).forEach(file => {
//         formData.append('files', file);
//       });
      
//       formData.append('recordId', recordId);

//       const response = await fetch('/api/eng/upload', {
//         method: 'POST',
//         body: formData
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to upload files');
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('Error uploading files:', error);
//       throw error;
//     }
//   };

//   return {
//     uploadFiles
//   };
// };