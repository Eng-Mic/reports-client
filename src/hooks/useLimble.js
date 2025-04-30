import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useTransformedRecordStore from "@/store/engStore";

export const useEquipmentTasks = (selectedEquipment) => {
  const equipmentSlugs = Array.isArray(selectedEquipment)
    ? selectedEquipment.map((equip) => encodeURIComponent(equip))
    : [];

  const enabled = equipmentSlugs.length > 0;

  const { data: tasksResponse, isLoading, error } = useQuery({
    queryKey: ["limble", ["tasks", ...equipmentSlugs]],
    queryFn: async () => {
      const path = [...equipmentSlugs].join("/");
      console.log("Fetching Limble tasks for path:", path);
      
      const res = await fetch(`/api/proxy/limble/${path}`);
  
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to fetch Limble data: ${err}`);
      }
  
      const resData = await res.json();
      console.log("Limble Data", resData);
      return resData;
    },
    enabled,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
  

  const setEquipmentTasks = useTransformedRecordStore((state) => state.setEquipmentTasks);

  useEffect(() => {
    if (tasksResponse && tasksResponse.success && !isLoading) {
      setEquipmentTasks(tasksResponse); // Pass the full response
    }
  }, [tasksResponse, isLoading, setEquipmentTasks]);

  return { tasksResponse, isLoading, error };
};
