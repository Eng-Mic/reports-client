// import { useQuery } from "@tanstack/react-query";
// import { parseISO, startOfDay, endOfDay, setHours, setMinutes } from "date-fns";
// import useRecordsStore from "@/store/recordsStore";

// // Fetch function for at least 2 months records
// const fetchAllRecords = async () => {
//   try {
//     const url = `/api/records`; // Backend endpoint for all records
//     const response = await fetch(url);

//     if (!response.ok) {
//       const errorData = await response.text();
//       throw new Error(`Error ${response.status}: ${errorData}`);
//     }

//     return response.json();
//   } catch (error) {
//     console.error("Fetch error:", error.message);
//     throw error;
//   }
// };

// export function useAllRecords() {
//   const { setData, setError, setLoading } = useRecordsStore();

//   const query = useQuery({
//     queryKey: ["allRecords"],
//     queryFn: fetchAllRecords,
//     onSuccess: (data) => setData(data),
//     onError: (error) => setError(error.message),
//     onSettled: () => setLoading(false),
//     onMutate: () => setLoading(true),
//     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
//   });

//   return query;
// }

// // Custom Hook for Filtering Records
// export function useRecords() {
//   const { dateRange, setData, setError, setLoading } = useRecordsStore();

//   const query = useQuery({
//     queryKey: ["records", dateRange.from, dateRange.to],
//     queryFn: fetchAllRecords,
//     select: (data) => {
//       // If no date range is specified, return all data
//       if (!dateRange.from || !dateRange.to) return data;

//       // Convert input date to Date objects
//       const selectedDate = parseISO(dateRange.to); // 3/26/2025

//       // Adjust date range based on selected date
//       const fromDate = setHours(setMinutes(startOfDay(selectedDate), 0), 6); // 6:00 AM of the selected day
//       const toDate = endOfDay(selectedDate); // 11:59 PM of the selected day

//       // Filter records based on date range
//       return data.filter(record => {
//         const recordDate = new Date(record.DateTime);
//         return recordDate >= fromDate && recordDate <= toDate;
//       });
//     },
//     onSuccess: (data) => {
//       setData(data);
//       setLoading(false);
//     },
//     onError: (error) => {
//       setError(error.message);
//       setLoading(false);
//     },
//     onSettled: () => setLoading(false),
//     onMutate: () => setLoading(true),
//     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
//   });

//   return query;
// }


// import useRecordStore from '@/store/recordStore';
import useRecordStore from '@/store/recordsStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useGetRecords = () => {
  console.log("useGetRecords hook called")
  const queryClient = useQueryClient();
  const setRecords = useRecordStore((state) => state.setRecords);

  const { data, isError, isLoading, error } = useQuery({
    queryKey: ['records'],
    queryFn: async () => {
      const response = await fetch('/api/records', { cache: 'no-store' }); // Endpoint to actual database records
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch records');
      }

      const responseData = await response.json(); // Ensure you await the response.json() here
      // console.log("Response Data:", responseData); // Log the actual data
      
      return responseData;
    },
    onError: (error) => {
      console.error('Failed to fetch records:', error);
    },
  });

  // Store data in Zustand when fetched
  useEffect(() => {
    // console.log("Response Data record:", data); // Log the actual data
    if (data && Array.isArray(data)) {
      setRecords(data);
    }
  }, [data, setRecords]);

  // Provide a refetch function
  const refetchRecords = () => {
    queryClient.invalidateQueries(['records']);
  };

  return { data, isError, isLoading, error, refetchRecords };
};
