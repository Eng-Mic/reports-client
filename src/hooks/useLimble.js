import { useEffect } from "react";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import useTransformedRecordStore from "@/store/engStore";

// Hook for fetching a single equipment's tasks
export const useGetSingleEquipmentTasks = ({ equipment = null } = {}) => {
  console.log("Fetching tasks for single equipment:", equipment);
  
  const queryClient = useQueryClient();
  const queryKey = ['limble', 'tasks', equipment];

  const buildUrl = () => {
    return `/api/proxy/limble/${encodeURIComponent(equipment)}`;
  };

  const { data, isError, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!equipment) return null;
      
      const response = await fetch(buildUrl(), { cache: 'no-store' });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to fetch tasks for ${equipment}`);
      }

      const resData = await response.json();
      return resData;
    },
    enabled: !!equipment, // Only run the query if we have an equipment
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (error) => {
      console.error(`Failed to fetch tasks for ${equipment}:`, error);
    },
  });

  const refetchTasks = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    data,
    isError,
    isLoading,
    error,
    refetchTasks,
  };
};

// Main hook that uses useQueries to handle multiple equipment
export const useEquipmentTasks = (selectedEquipment) => {
  const setEquipmentTasks = useTransformedRecordStore((state) => state.setEquipmentTasks);
  
  // Convert selectedEquipment to array if needed
  const equipmentArray = selectedEquipment 
    ? (Array.isArray(selectedEquipment) ? selectedEquipment : [selectedEquipment]) 
    : [];
  
  // console.log("Fetching tasks for equipment:", equipmentArray);

  // Use useQueries to run multiple queries in parallel
  const results = useQueries({
    queries: equipmentArray.map(equipment => ({
      queryKey: ['limble', 'tasks', equipment],
      queryFn: async () => {
        const encodedEquipment = encodeURIComponent(equipment);
        // console.log(
        //   `Fetching tasks for equipment: ${equipment} (encoded: ${encodedEquipment})`
        // );
        
        const url = `/api/proxy/limble/tasks/${encodedEquipment}`;
        // console.log(`Fetching URL for ${equipment}:`, url);
        
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to fetch tasks for ${equipment}`);
        }

        const resData = await response.json();
        // console.log(`Data for ${equipment}:`, resData);
        
        return { equipment, data: resData };
      },
      enabled: !!equipment,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
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
      combinedData[result.data.equipment] = result.data.data;
    }
  });

  useEffect(() => {
    // Only update store if we have data and not loading
    if (Object.keys(combinedData).length > 0 && !isLoading) {
      // Create a response object that mimics the original structure
      const tasksResponse = {
        success: true,
        data: Object.values(combinedData).flatMap(item => 
          item && item.success ? item.data : []
        )
      };
      setEquipmentTasks(tasksResponse);
    }
  }, [combinedData, isLoading, setEquipmentTasks]);

  return {
    tasksResponse: {
      success: !isError,
      data: Object.values(combinedData).flatMap(item => 
        item && item.success ? item.data : []
      )
    },
    isLoading,
    isError,
    error,
    // Individual results for more granular access if needed
    results,
  };
};




// import { useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import useTransformedRecordStore from "@/store/engStore";

// export const useEquipmentTasks = (selectedEquipment) => {
//   const equipmentSlugs = Array.isArray(selectedEquipment)
//     ? selectedEquipment.map((equip) => encodeURIComponent(equip))
//     : [];

//   const enabled = equipmentSlugs.length > 0;

//   const { data: tasksResponse, isLoading, error } = useQuery({
//     queryKey: ["limble", ["tasks", ...equipmentSlugs]],
//     queryFn: async () => {
//       const path = [...equipmentSlugs].join("/");
//       // console.log("Fetching Limble tasks for path:", path);
      
//       const res = await fetch(`/api/proxy/limble/${path}`);
  
//       if (!res.ok) {
//         const err = await res.text();
//         throw new Error(`Failed to fetch Limble data: ${err}`);
//       }
  
//       const resData = await res.json();
//       // console.log("Limble Data", resData);
//       return resData;
//     },
//     enabled,
//     retry: 1,
//     staleTime: 1000 * 60 * 5,
//   });
  

//   const setEquipmentTasks = useTransformedRecordStore((state) => state.setEquipmentTasks);

//   useEffect(() => {
//     if (tasksResponse && tasksResponse.success && !isLoading) {
//       setEquipmentTasks(tasksResponse); // Pass the full response
//     }
//   }, [tasksResponse, isLoading, setEquipmentTasks]);

//   return { tasksResponse, isLoading, error };
// };
