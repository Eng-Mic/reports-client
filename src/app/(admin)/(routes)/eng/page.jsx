"use client"; 

import React, { useState, useEffect } from "react";
import { DateRangePicker } from "../../_components/DateRangePicker";
import EquipmentsSelect from "../../_components/EquipmentsSelect";
import EquipmentCard from "../../_components/EquipmentCard";
import Compliance from "../../_components/Compliance";
import TaskTable from "../../_components/TaskTable";

import { equips } from "@/data";
import useTransformedRecordStore from "@/store/engStore";
import { useGetEngRecords } from "@/hooks/useEng";
import { useEquipmentTasks } from "@/hooks/useLimble";

const Engineering = () => {
  const [filters, setFilters] = useState({
    equipments: [],
    tags: [],
    dateRange: null,
    isCustomDateRange: false,
  });

  const [complianceFilter, setComplianceFilter] = useState('all');

  const [displayedEquipmentInfo, setDisplayedEquipmentInfo] = useState({});
  const [selectedTagsByEquipment, setSelectedTagsByEquipment] = useState({});

  // // Get data from store directly instead of setting it here
  // const equipmentTasks = useTransformedRecordStore((state) => state.equipmentTasks);
  
  // console.log("Selected Equipment:", filters.equipments);
  // console.log("Selected Tags by Equipment:", selectedTagsByEquipment);
  // console.log("Displayed Equipment Info:", displayedEquipmentInfo);
  
  // Use the updated useGetEngRecords hook
  const { 
    data: rawRecordsByEquipment, 
    isLoading: recordsLoading 
  } = useGetEngRecords({
    assets: filters.equipments,
    fromDate: filters.dateRange?.from ? filters.dateRange.from.toISOString().split('T')[0] : null,
    toDate: filters.dateRange?.to ? filters.dateRange.to.toISOString().split('T')[0] : null,
  });

  // Use the updated useEquipmentTasks hook - no need to process slugs here
  const { 
    tasksResponse: tasks, 
    isLoading: tasksLoading 
  } = useEquipmentTasks(filters.equipments);

  const setDefaultDateRange = () => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 1);
    from.setHours(7, 0, 0, 0);

    const to = new Date(today);
    to.setHours(6, 0, 0, 0);

    const defaultRange = { from, to };
    setFilters((prev) => ({ ...prev, dateRange: defaultRange, isCustomDateRange: false }));
  };

  useEffect(() => {
    if (filters.equipments.length > 0 && !filters.dateRange) {
      setDefaultDateRange();
    }
  }, [filters.equipments]);

  const handleDateRangeChange = (fromDate, toDate) => {
    console.log("Date range changed:", fromDate, toDate);
    
    // If no dates provided or both are null, clear the filter
    if (!fromDate && !toDate) {
      setFilters(prev => ({
        ...prev,
        dateRange: null,
        isCustomDateRange: false,
      }));
      return;
    }
    
    // Handle single date selection
    if (fromDate && !toDate) {
      // Adjust 'from' - one day before, set to 07:00:00
      const from = new Date(fromDate);
      from.setDate(from.getDate() - 1);
      from.setHours(7, 0, 0, 0);
    
      // Adjust 'to' - set to 06:00:00
      const to = new Date(fromDate);
      to.setHours(6, 0, 0, 0);
      
      setFilters(prev => ({
        ...prev,
        dateRange: { from, to },
        isCustomDateRange: true,
      }));
    } 
    // Handle date range selection
    else if (fromDate && toDate) {
      // Adjust 'from' - one day before the first date, set to 07:00:00
      const from = new Date(fromDate);
      from.setDate(from.getDate() - 1);
      from.setHours(7, 0, 0, 0);
    
      // Adjust 'to' - set to 06:00:00 on the end date
      const to = new Date(toDate);
      to.setHours(6, 0, 0, 0);
      
      setFilters(prev => ({
        ...prev,
        dateRange: { from, to },
        isCustomDateRange: true,
      }));
    }
  };

  const handleEquipmentChange = (newFilters) => {
    const updated = typeof newFilters === "function" ? newFilters(filters) : newFilters;

    // Update selected equipment info
    const selectedEquipmentsData = equips.filter((equip) =>
      (updated.equipments || []).includes(equip)
    );

    const info = {};
    selectedEquipmentsData.forEach((equip) => {
      info[equip.label] = equip.tags?.map((tag) => tag.TagName);
    });

    // Update selected tags by equipment - retain only tags for selected equipment
    const newSelectedTagsByEquipment = {};
    Object.keys(info).forEach((equipment) => {
      if (selectedTagsByEquipment[equipment]) {
        newSelectedTagsByEquipment[equipment] = selectedTagsByEquipment[equipment];
      }
    });

    // Calculate all selected tags from the updated equipment selection
    const allSelectedTags = Object.values(newSelectedTagsByEquipment)
      .flat()
      .filter(Boolean);

    // Update filters with both equipment and recalculated tags
    setFilters((prev) => ({
      ...prev,
      equipments: updated.equipments || [],
      tags: allSelectedTags,
      dateRange: prev.dateRange,
      isCustomDateRange: prev.isCustomDateRange,
    }));

    setDisplayedEquipmentInfo(info);
    setSelectedTagsByEquipment(newSelectedTagsByEquipment);
  };

  const handleEquipmentTagsSelected = (equipment, selectedTags) => {
    // Update the selectedTagsByEquipment state
    setSelectedTagsByEquipment((prev) => ({
      ...prev,
      [equipment]: selectedTags,
    }));
    
    // Update the filters.tags array with all selected tags from all equipment
    setFilters((prev) => {
      // Create an object with the updated selectedTagsByEquipment
      const updatedSelectedTags = {
        ...selectedTagsByEquipment,
        [equipment]: selectedTags,
      };
      
      // Flatten all selected tags from all equipment into a single array
      const allSelectedTags = Object.values(updatedSelectedTags)
        .flat()
        .filter(Boolean); // Remove any null/undefined values
      
      return {
        ...prev,
        tags: allSelectedTags,
      };
    });
  };

  const handleComplianceChange = (value) => {
    setComplianceFilter(value);
  };

  // console.log("Filters:", filters);
  // console.log("Raw Records by Equipment:", rawRecordsByEquipment);
  
  const isEquipmentSelected = filters.equipments.length > 0;
  const isLoadingOverall = recordsLoading || tasksLoading;

  // Function to get tasks for a specific equipment from the equipmentTasks store
  const getTasksForEquipment = (equipmentValue) => {
    // console.log("Equipment Value:", equipmentValue);
  
    const transformedEquipmentValue = equipmentValue.replace( /^(\d+)([A-Z]+)(\d+)$/, (_, num1, letters, num2) => `${num1}-${letters.toLowerCase()}-${num2}`);

    // console.log("Transformed Equipment Value:", transformedEquipmentValue);
    
  
    if (tasks && tasks.data && Array.isArray(tasks.data)) {
      // console.log("tasks.data:", tasks.data);
  
      const resultTasks = tasks.data.filter(task => {
        const assetName = task?.assetName?.toLowerCase();
        // console.log("Asset Name:", assetName);
        
        const matches = assetName.includes(transformedEquipmentValue);
        // console.log("Task:", task, "Matches:", matches);
        return matches;
      });
  
      // console.log("Filtered Tasks for Equipment:", resultTasks);
      return resultTasks;
    }
  
    return [];
  };
  

  // console.log("Tasks for Equipment:", tasks);
  // console.log("Raw Records by Equipment:", rawRecordsByEquipment);
  
  return (
    <div className="container mx-auto pt-4 relative">
      <div className="sticky top-0 z-20 pb-4">
        <div className="w-full mb-[10px] flex justify-between items-center border-b-[1px] pb-[10px]">
          <h1 className="text-2xl font-bold">Performance Trends</h1>
        </div>

        <div className="flex flex-col gap-y-[2rem] items-start border-b-[1px] pb-[10px] mb-4 md:flex-row md:justify-between md:gap-y-0">
          <div className={`flex items-center gap-4 ${isLoadingOverall && "opacity-50"}`}>
            <EquipmentsSelect
              onEquipmentChange={handleEquipmentChange}
              availableEquipments={equips.map((eq) => ({ label: eq, value: eq }))}
            />
          </div>

          <div className="flex flex-col gap-y-[10px] md:flex-row md:items-center md:space-x-4 md:gap-y-0">
            <label className="md:mr-2">
              Select Production Date:
            </label>
            <DateRangePicker
              className="w-[250px]"
              disabled={!isEquipmentSelected}
              onChange={handleDateRangeChange}
              value={filters.dateRange}
              mode="range"
            />
          </div>
        </div>
      </div>

      {isEquipmentSelected ? (
        <div className="equip_container w-full overflow-y-scroll h-full lg:h-[22rem] 2xl:h-[40rem]">
          {filters.equipments.map((equipmentValue) => {
            // Get the specific records for this equipment from rawRecordsByEquipment
            const equipmentRecords = rawRecordsByEquipment?.[equipmentValue] || [];
            
            // Get equipment-specific tasks using our helper function
            const equipmentSpecificTasks = getTasksForEquipment(equipmentValue);

            // console.log("Equipment Specific Tasks:", equipmentSpecificTasks);
            

            return (
              <div key={equipmentValue} className="mb-8">
                <div className="grid grid-cols-1 gap-x-[5px] lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <EquipmentCard
                      equipment={equipmentValue}
                      onTagsSelected={handleEquipmentTagsSelected}
                      dateRange={filters.dateRange}
                      filteredRecords={{ tags: equipmentRecords }} // Pass equipment-specific records
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <Compliance
                      tasks={equipmentSpecificTasks}
                      isLoading={tasksLoading}
                      dateRange={filters.dateRange}
                      onComplianceChange={handleComplianceChange}
                    />
                  </div>
                </div>
                <div className="w-full">
                  <TaskTable
                    tasks={equipmentSpecificTasks}
                    isLoading={tasksLoading}
                    dateRange={filters.dateRange}
                    complianceFilter={complianceFilter}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-8">
          No equipment selected. Please choose an equipment to begin.
        </div>
      )}
    </div>
  );
};

export default Engineering;



// "use client"; 

// import React, { useState, useEffect } from "react";
// import { DateRangePicker } from "../../_components/DateRangePicker";
// import EquipmentsSelect from "../../_components/EquipmentsSelect";
// import EquipmentCard from "../../_components/EquipmentCard";
// import Compliance from "../../_components/Compliance";
// import TaskTable from "../../_components/TaskTable";

// import { equips } from "@/data";
// import { useEquipmentTasks } from "@/hooks/useLimble";
// import { useGetEngRecords } from "@/hooks/useEng";
// import useTransformedRecordStore from "@/store/engStore";

// const Engineering = () => {
//   const [filters, setFilters] = useState({
//     equipments: [],
//     tags: [],
//     dateRange: null,
//     isCustomDateRange: false,
//   });

//   const [complianceFilter, setComplianceFilter] = useState('all');

//   const [displayedEquipmentInfo, setDisplayedEquipmentInfo] = useState({});
//   const [selectedTagsByEquipment, setSelectedTagsByEquipment] = useState({});

//   const equipmentTasks = useTransformedRecordStore((state) => state.equipmentTasks);
//   const setEquipmentTasks = useTransformedRecordStore((state) => state.setEquipmentTasks);

//   console.log("Selected Equipment:", filters.equipments);
//   console.log("Selected Tags by Equipment:", selectedTagsByEquipment);
//   console.log("Displayed Equipment Info:", displayedEquipmentInfo);
  
//   // Pass the entire equipment array to the hook
//   const { data: rawRecordsByEquipment, isLoading: recordsLoading } = useGetEngRecords({
//     assets: filters.equipments,  // Pass the entire array
//     fromDate: filters.dateRange?.from,
//     toDate: filters.dateRange?.to,
//   });

//   const equipmentSlugs = filters.equipments.map((equip) => encodeURIComponent(equip));
//   const { data: tasks, isLoading: tasksLoading } = useEquipmentTasks(["tasks", ...equipmentSlugs]);

//   useEffect(() => {
//     if (tasks && !tasksLoading) {
//       setEquipmentTasks(tasks);
//     }
//   }, [tasks, tasksLoading, setEquipmentTasks]);

//   const setDefaultDateRange = () => {
//     const today = new Date();
//     const from = new Date(today);
//     from.setDate(today.getDate() - 1);
//     from.setHours(7, 0, 0, 0);

//     const to = new Date(today);
//     to.setHours(6, 0, 0, 0);

//     const defaultRange = { from, to };
//     setFilters((prev) => ({ ...prev, dateRange: defaultRange, isCustomDateRange: false }));
//   };

//   useEffect(() => {
//     if (filters.equipments.length > 0 && !filters.dateRange) {
//       setDefaultDateRange();
//     }
//   }, [filters.equipments]);

//   const handleDateRangeChange = (fromDate, toDate) => {
//     console.log("Date range changed:", fromDate, toDate);
    
//     // If no dates provided or both are null, clear the filter
//     if (!fromDate && !toDate) {
//       setFilters(prev => ({
//         ...prev,
//         dateRange: null,
//         isCustomDateRange: false,
//       }));
//       return;
//     }
    
//     // Handle single date selection
//     if (fromDate && !toDate) {
//       // Adjust 'from' - one day before, set to 07:00:00
//       const from = new Date(fromDate);
//       from.setDate(from.getDate() - 1);
//       from.setHours(7, 0, 0, 0);
    
//       // Adjust 'to' - set to 06:00:00
//       const to = new Date(fromDate);
//       to.setHours(6, 0, 0, 0);
      
//       setFilters(prev => ({
//         ...prev,
//         dateRange: { from, to },
//         isCustomDateRange: true,
//       }));
//     } 
//     // Handle date range selection
//     else if (fromDate && toDate) {
//       // Adjust 'from' - one day before the first date, set to 07:00:00
//       const from = new Date(fromDate);
//       from.setDate(from.getDate() - 1);
//       from.setHours(7, 0, 0, 0);
    
//       // Adjust 'to' - set to 06:00:00 on the end date
//       const to = new Date(toDate);
//       to.setHours(6, 0, 0, 0);
      
//       setFilters(prev => ({
//         ...prev,
//         dateRange: { from, to },
//         isCustomDateRange: true,
//       }));
//     }
//   };

//   const handleEquipmentChange = (newFilters) => {
//     const updated = typeof newFilters === "function" ? newFilters(filters) : newFilters;

//     // Update selected equipment info
//     const selectedEquipmentsData = equips.filter((equip) =>
//       (updated.equipments || []).includes(equip.value)
//     );

//     const info = {};
//     selectedEquipmentsData.forEach((equip) => {
//       info[equip.label] = equip.tags?.map((tag) => tag.TagName);
//     });

//     // Update selected tags by equipment - retain only tags for selected equipment
//     const newSelectedTagsByEquipment = {};
//     Object.keys(info).forEach((equipment) => {
//       if (selectedTagsByEquipment[equipment]) {
//         newSelectedTagsByEquipment[equipment] = selectedTagsByEquipment[equipment];
//       }
//     });

//     // Calculate all selected tags from the updated equipment selection
//     const allSelectedTags = Object.values(newSelectedTagsByEquipment)
//       .flat()
//       .filter(Boolean);

//     // Update filters with both equipment and recalculated tags
//     setFilters((prev) => ({
//       ...prev,
//       equipments: updated.equipments || [],
//       tags: allSelectedTags,
//       dateRange: prev.dateRange,
//       isCustomDateRange: prev.isCustomDateRange,
//     }));

//     setDisplayedEquipmentInfo(info);
//     setSelectedTagsByEquipment(newSelectedTagsByEquipment);
//   };

//   const handleEquipmentTagsSelected = (equipment, selectedTags) => {
//     // Update the selectedTagsByEquipment state
//     setSelectedTagsByEquipment((prev) => ({
//       ...prev,
//       [equipment]: selectedTags,
//     }));
    
//     // Update the filters.tags array with all selected tags from all equipment
//     setFilters((prev) => {
//       // Create an object with the updated selectedTagsByEquipment
//       const updatedSelectedTags = {
//         ...selectedTagsByEquipment,
//         [equipment]: selectedTags,
//       };
      
//       // Flatten all selected tags from all equipment into a single array
//       const allSelectedTags = Object.values(updatedSelectedTags)
//         .flat()
//         .filter(Boolean); // Remove any null/undefined values
      
//       return {
//         ...prev,
//         tags: allSelectedTags,
//       };
//     });
//   };

//   const handleComplianceChange = (value) => {
//     setComplianceFilter(value);
//   };

//   console.log("Filters:", filters);
//   console.log("Raw Records by Equipment:", rawRecordsByEquipment);
  
//   const isEquipmentSelected = filters.equipments.length > 0;
//   const isLoadingOverall = recordsLoading || tasksLoading;

//   return (
//     <div className="container mx-auto pt-4 relative">
//       <div className="sticky top-0 z-20 pb-4">
//         <div className="w-full mb-[10px] flex justify-between items-center border-b-[1px] pb-[10px]">
//           <h1 className="text-2xl font-bold">Performance Trends</h1>
//         </div>

//         <div className="flex flex-col gap-y-[2rem] items-start border-b-[1px] pb-[10px] mb-4 md:flex-row md:justify-between md:gap-y-0">
//           <div className={`flex items-center gap-4 ${isLoadingOverall && "opacity-50"}`}>
//             <EquipmentsSelect
//               onEquipmentChange={handleEquipmentChange}
//               availableEquipments={equips.map((eq) => ({ label: eq, value: eq }))}
//             />
//           </div>

//           <div className="flex flex-col gap-y-[10px] md:flex-row md:items-center md:space-x-4 md:gap-y-0">
//             <label className="md:mr-2">
//               Select Production Date:
//             </label>
//             <DateRangePicker
//               className="w-[250px]"
//               disabled={!isEquipmentSelected}
//               onChange={handleDateRangeChange}
//               value={filters.dateRange}
//               mode="range"
//             />
//           </div>
//         </div>
//       </div>

//       {isEquipmentSelected ? (
//         <div className="equip_container w-full overflow-y-scroll h-full lg:h-[22rem] 2xl:h-[40rem]">
//           {filters.equipments.map((equipmentValue) => {
//             const transformedEquipmentValue = equipmentValue.replace(
//               /^(\d+)([A-Z]+)(\d+)$/, 
//               (_, num1, letters, num2) => `${num1}-${letters.toLowerCase()}-${num2}`
//             );
            
//             const equipmentSpecificTasks = equipmentTasks[transformedEquipmentValue.toLowerCase()] || [];
            
//             // Get the specific records for this equipment
//             const equipmentRecords = rawRecordsByEquipment?.[equipmentValue] || [];

//             return (
//               <div key={equipmentValue}>
//                 <div className="grid grid-cols-1 gap-x-[5px] lg:grid-cols-3">
//                   <div className="lg:col-span-2">
//                     <EquipmentCard
//                       equipment={equipmentValue}
//                       onTagsSelected={handleEquipmentTagsSelected}
//                       dateRange={filters.dateRange}
//                       filteredRecords={{ tags: equipmentRecords }} // Pass equipment-specific records
//                     />
//                   </div>
//                   <div className="lg:col-span-1">
//                     <Compliance
//                       tasks={equipmentSpecificTasks}
//                       isLoading={tasksLoading}
//                       dateRange={filters.dateRange}
//                       onComplianceChange={handleComplianceChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="w-full">
//                   <TaskTable
//                     tasks={equipmentSpecificTasks}
//                     isLoading={tasksLoading}
//                     dateRange={filters.dateRange}
//                     complianceFilter={complianceFilter}
//                   />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className="text-center p-8">
//           No equipment selected. Please choose an equipment to begin.
//         </div>
//       )}
//     </div>
//   );
// };

// export default Engineering;


// "use client";

// import React, { useState, useEffect } from "react";
// import { DateRangePicker } from "../../_components/DateRangePicker";
// import EquipmentsSelect from "../../_components/EquipmentsSelect";
// import EquipmentCard from "../../_components/EquipmentCard";
// import Compliance from "../../_components/Compliance";
// import TaskTable from "../../_components/TaskTable";

// import { equips } from "@/data";
// import { useEquipmentTasks } from "@/hooks/useLimble";
// import { useGetEngRecords } from "@/hooks/useEng";
// import useTransformedRecordStore from "@/store/engStore";

// const Engineering = () => {
//   const [filters, setFilters] = useState({
//     equipments: [],
//     tags: [],
//     dateRange: null,
//     isCustomDateRange: false,
//   });

//   const [complianceFilter, setComplianceFilter] = useState('all');

//   const [displayedEquipmentInfo, setDisplayedEquipmentInfo] = useState({});
//   const [selectedTagsByEquipment, setSelectedTagsByEquipment] = useState({});

//   const equipmentTasks = useTransformedRecordStore((state) => state.equipmentTasks);
//   const setEquipmentTasks = useTransformedRecordStore((state) => state.setEquipmentTasks);

//   const selectedEquipment = filters.equipments[0] || null;


//   const { data: rawRecords, isLoading: recordsLoading } = useGetEngRecords({
//     assets: selectedEquipment,
//     fromDate: filters.dateRange?.from,
//     toDate: filters.dateRange?.to,
//   });

//   const equipmentSlugs = filters.equipments.map((equip) => encodeURIComponent(equip));
//   const { data: tasks, isLoading: tasksLoading } = useEquipmentTasks(["tasks", ...equipmentSlugs]);

//   useEffect(() => {
//     if (tasks && !tasksLoading) {
//       setEquipmentTasks(tasks);
//     }
//   }, [tasks, tasksLoading, setEquipmentTasks]);

//   const setDefaultDateRange = () => {
//     const today = new Date();
//     const from = new Date(today);
//     from.setDate(today.getDate() - 1);
//     from.setHours(7, 0, 0, 0);

//     const to = new Date(today);
//     to.setHours(6, 0, 0, 0);

//     const defaultRange = { from, to };
//     setFilters((prev) => ({ ...prev, dateRange: defaultRange, isCustomDateRange: false }));
//   };

//   useEffect(() => {
//     if (filters.equipments.length > 0 && !filters.dateRange) {
//       setDefaultDateRange();
//     }
//   }, [filters.equipments]);

//   const handleDateRangeChange = (fromDate, toDate) => {
//     console.log("Date range changed:", fromDate, toDate);
    
//     // If no dates provided or both are null, clear the filter
//     if (!fromDate && !toDate) {
//       setFilters(prev => ({
//         ...prev,
//         dateRange: null,
//         isCustomDateRange: false,
//       }));
//       return;
//     }
    
//     // Handle single date selection
//     if (fromDate && !toDate) {
//       // Adjust 'from' - one day before, set to 07:00:00
//       const from = new Date(fromDate);
//       from.setDate(from.getDate() - 1);
//       from.setHours(7, 0, 0, 0);
    
//       // Adjust 'to' - set to 06:00:00
//       const to = new Date(fromDate);
//       to.setHours(6, 0, 0, 0);
      
//       setFilters(prev => ({
//         ...prev,
//         dateRange: { from, to },
//         isCustomDateRange: true,
//       }));
//     } 
//     // Handle date range selection
//     else if (fromDate && toDate) {
//       // Adjust 'from' - one day before the first date, set to 07:00:00
//       const from = new Date(fromDate);
//       from.setDate(from.getDate() - 1);
//       from.setHours(7, 0, 0, 0);
    
//       // Adjust 'to' - set to 06:00:00 on the end date
//       const to = new Date(toDate);
//       to.setHours(6, 0, 0, 0);
      
//       setFilters(prev => ({
//         ...prev,
//         dateRange: { from, to },
//         isCustomDateRange: true,
//       }));
//     }
    
//     console.log("Updated Filters:", {
//       from: fromDate ? new Date(fromDate).toISOString() : null,
//       to: toDate ? new Date(toDate).toISOString() : null,
//     });
//   };
  
  

//   const handleEquipmentChange = (newFilters) => {
//     const updated = typeof newFilters === "function" ? newFilters(filters) : newFilters;

//     setFilters((prev) => ({
//       ...prev,
//       equipments: updated.equipments || [],
//       dateRange: prev.dateRange, // ✅ Preserve existing date range
//       isCustomDateRange: prev.isCustomDateRange,
//     }));

//     const selectedEquipmentsData = equips.filter((equip) =>
//       (updated.equipments || []).includes(equip.value)
//     );

//     const info = {};
//     selectedEquipmentsData.forEach((equip) => {
//       info[equip.label] = equip.tags?.map((tag) => tag.TagName);
//     });

//     const newSelectedTagsByEquipment = {};
//     Object.keys(info).forEach((equipment) => {
//       if (selectedTagsByEquipment[equipment]) {
//         newSelectedTagsByEquipment[equipment] = selectedTagsByEquipment[equipment];
//       }
//     });

//     setDisplayedEquipmentInfo(info);
//     setSelectedTagsByEquipment(newSelectedTagsByEquipment);
//   };

//   const handleEquipmentTagsSelected = (equipment, selectedTags) => {
//     setSelectedTagsByEquipment((prev) => ({
//       ...prev,
//       [equipment]: selectedTags,
//     }));
//   };

//   const handleComplianceChange = (value) => {
//     setComplianceFilter(value);
//   };

//   console.log("Filters:", filters);
//   console.log("Selected Equipment:", selectedEquipment);
//   console.log("Selected Tags by Equipment:", selectedTagsByEquipment);
//   console.log("Displayed Equipment Info:", displayedEquipmentInfo);
  
  
//   const isEquipmentSelected = filters.equipments.length > 0;
//   const isLoadingOverall = recordsLoading || tasksLoading;

//   return (
//     <div className="container mx-auto pt-4 relative">
//       <div className="sticky top-0 z-20 pb-4">
//         <div className="w-full mb-[10px] flex justify-between items-center border-b-[1px] pb-[10px]">
//           <h1 className="text-2xl font-bold">Performance Trends</h1>
//         </div>

//         <div className="flex flex-col gap-y-[2rem] items-start border-b-[1px] pb-[10px] mb-4 md:flex-row md:justify-between md:gap-y-0">
//           <div className={`flex items-center gap-4 ${isLoadingOverall && "opacity-50"}`}>
//             <EquipmentsSelect
//               onEquipmentChange={handleEquipmentChange}
//               availableEquipments={equips.map((eq) => ({ label: eq, value: eq }))}
//             />
//           </div>

//           <div className="flex flex-col gap-y-[10px] md:flex-row md:items-center md:space-x-4 md:gap-y-0">
//             <label className="md:mr-2">
//               {/* {filters.isCustomDateRange ? "Custom Production Period:" : "Select Production Date:"} */}
//               Select Production Date:
//             </label>
//             <DateRangePicker
//               className="w-[250px]"
//               disabled={!isEquipmentSelected}
//               onChange={handleDateRangeChange}
//               value={filters.dateRange}
//               mode="range"
//             />
//           </div>
//         </div>
//       </div>

//       {isEquipmentSelected ? (
//         <div className="equip_container w-full overflow-y-scroll h-full lg:h-[22rem] 2xl:h-[40rem]">
//           {filters.equipments.map((equipmentValue) => {
//             const transformedEquipmentValue = equipmentValue.replace(/^(\d+)([A-Z]+)(\d+)$/, (_, num1, letters, num2) => {
//               return `${num1}-${letters.toLowerCase()}-${num2}`;
//             });
//             const equipmentSpecificTasks = equipmentTasks[transformedEquipmentValue.toLowerCase()] || [];

//             console.log("EquipmentValue:", equipmentValue);
//             console.log("EquipmentSpecificTasks:", equipmentSpecificTasks);
            

//             return (
//               <div key={equipmentValue}>
//                 <div className="grid grid-cols-1 gap-x-[5px] lg:grid-cols-3">
//                   <div className="lg:col-span-2">
//                     <EquipmentCard
//                       equipment={equipmentValue}
//                       onTagsSelected={handleEquipmentTagsSelected}
//                       dateRange={filters.dateRange}
//                       filteredRecords={{ tags: rawRecords || [] }}
                      
//                     />
//                   </div>
//                   <div className="lg:col-span-1">
//                     <Compliance
//                       tasks={equipmentSpecificTasks}
//                       isLoading={tasksLoading}
//                       dateRange={filters.dateRange}
//                       onComplianceChange={handleComplianceChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="w-full">
//                   <TaskTable
//                     tasks={equipmentSpecificTasks}
//                     isLoading={tasksLoading}
//                     dateRange={filters.dateRange}
//                     complianceFilter={complianceFilter}
//                   />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className="text-center p-8">
//           No equipment selected. Please choose an equipment to begin.
//         </div>
//       )}
//     </div>
//   );
// };

// export default Engineering;


// "use client";

// import React, { useState, useEffect } from "react";
// import { DateRangePicker } from "../../_components/DateRangePicker";
// import EquipmentsSelect from "../../_components/EquipmentsSelect";
// import EquipmentCard from "../../_components/EquipmentCard";
// import Compliance from "../../_components/Compliance";
// import TaskTable from "../../_components/TaskTable";

// import { equips } from "@/data";
// import { useEquipmentTasks } from "@/hooks/useLimble";
// import { useGetEngRecords } from "@/hooks/useEng";
// import useTransformedRecordStore from "@/store/engStore";

// const Engineering = () => {
//   const [filters, setFilters] = useState({
//     equipments: [],
//     tags: [],
//     dateRange: null,
//     isCustomDateRange: false,
//   });

//   const [complianceFilter, setComplianceFilter] = useState('all');

//   const [displayedEquipmentInfo, setDisplayedEquipmentInfo] = useState({});
//   const [selectedTagsByEquipment, setSelectedTagsByEquipment] = useState({});
//   const [loadedEquipments, setLoadedEquipments] = useState(new Set());

//   const equipmentTasks = useTransformedRecordStore((state) => state.equipmentTasks);
//   const setEquipmentTasks = useTransformedRecordStore((state) => state.setEquipmentTasks);
//   const rawRecords = useTransformedRecordStore((state) => state.rawRecords);

//   console.log("Selected Equipment:", filters.equipments);
//   console.log("Selected Tags by Equipment:", selectedTagsByEquipment);
//   console.log("Displayed Equipment Info:", displayedEquipmentInfo);
  
//   // For each equipment, fetch its data individually
//   useEffect(() => {
//     filters.equipments.forEach(async (equipment) => {
//       // Only fetch if we haven't loaded this equipment yet
//       if (!loadedEquipments.has(equipment)) {
//         const { data } = await useGetEngRecords({
//           assets: equipment,
//           fromDate: filters.dateRange?.from,
//           toDate: filters.dateRange?.to,
//         });
        
//         // Mark this equipment as loaded
//         setLoadedEquipments(prev => new Set([...prev, equipment]));
//       }
//     });
//   }, [filters.equipments, filters.dateRange, loadedEquipments]);

//   // Fetch records for all selected equipment
//   const { data: allRecords, isLoading: recordsLoading } = useGetEngRecords({
//     assets: filters.equipments.join(','),
//     fromDate: filters.dateRange?.from,
//     toDate: filters.dateRange?.to,
//   });

//   const equipmentSlugs = filters.equipments.map((equip) => encodeURIComponent(equip));
//   const { data: tasks, isLoading: tasksLoading } = useEquipmentTasks(["tasks", ...equipmentSlugs]);

//   useEffect(() => {
//     if (tasks && !tasksLoading) {
//       // Ensure we handle tasks properly for multiple equipment
//       const tasksByEquipment = {};
      
//       if (Array.isArray(tasks)) {
//         tasks.forEach((task) => {
//           const assetName = task.assetName || 'unknown';
//           const normalizedAsset = assetName.toLowerCase();
          
//           if (!tasksByEquipment[normalizedAsset]) {
//             tasksByEquipment[normalizedAsset] = [];
//           }
//           tasksByEquipment[normalizedAsset].push(task);
//         });
        
//         // Update the store with merged data
//         Object.entries(tasksByEquipment).forEach(([asset, assetTasks]) => {
//           setEquipmentTasks({
//             success: true,
//             data: assetTasks,
//             assetName: asset,
//             associatedAssetIDs: []
//           });
//         });
//       } else {
//         // If tasks is not an array, use the original approach
//         setEquipmentTasks(tasks);
//       }
//     }
//   }, [tasks, tasksLoading, setEquipmentTasks]);

//   const setDefaultDateRange = () => {
//     const today = new Date();
//     const from = new Date(today);
//     from.setDate(today.getDate() - 1);
//     from.setHours(7, 0, 0, 0);

//     const to = new Date(today);
//     to.setHours(6, 0, 0, 0);

//     const defaultRange = { from, to };
//     setFilters((prev) => ({ ...prev, dateRange: defaultRange, isCustomDateRange: false }));
//   };

//   useEffect(() => {
//     if (filters.equipments.length > 0 && !filters.dateRange) {
//       setDefaultDateRange();
//     }
//   }, [filters.equipments]);

//   const handleDateRangeChange = (fromDate, toDate) => {
//     console.log("Date range changed:", fromDate, toDate);
    
//     // If no dates provided or both are null, clear the filter
//     if (!fromDate && !toDate) {
//       setFilters(prev => ({
//         ...prev,
//         dateRange: null,
//         isCustomDateRange: false,
//       }));
//       return;
//     }
    
//     // Handle single date selection
//     if (fromDate && !toDate) {
//       // Adjust 'from' - one day before, set to 07:00:00
//       const from = new Date(fromDate);
//       from.setDate(from.getDate() - 1);
//       from.setHours(7, 0, 0, 0);
    
//       // Adjust 'to' - set to 06:00:00
//       const to = new Date(fromDate);
//       to.setHours(6, 0, 0, 0);
      
//       setFilters(prev => ({
//         ...prev,
//         dateRange: { from, to },
//         isCustomDateRange: true,
//       }));
      
//       // Reset loaded equipments so we refetch with new date range
//       setLoadedEquipments(new Set());
//     } 
//     // Handle date range selection
//     else if (fromDate && toDate) {
//       // Adjust 'from' - one day before the first date, set to 07:00:00
//       const from = new Date(fromDate);
//       from.setDate(from.getDate() - 1);
//       from.setHours(7, 0, 0, 0);
    
//       // Adjust 'to' - set to 06:00:00 on the end date
//       const to = new Date(toDate);
//       to.setHours(6, 0, 0, 0);
      
//       setFilters(prev => ({
//         ...prev,
//         dateRange: { from, to },
//         isCustomDateRange: true,
//       }));
      
//       // Reset loaded equipments so we refetch with new date range
//       setLoadedEquipments(new Set());
//     }
    
//     console.log("Updated Filters:", {
//       from: fromDate ? new Date(fromDate).toISOString() : null,
//       to: toDate ? new Date(toDate).toISOString() : null,
//     });
//   };
  
//   const handleEquipmentChange = (newFilters) => {
//     const updated = typeof newFilters === "function" ? newFilters(filters) : newFilters;

//     setFilters((prev) => ({
//       ...prev,
//       equipments: updated.equipments || [],
//       dateRange: prev.dateRange, // Preserve existing date range
//       isCustomDateRange: prev.isCustomDateRange,
//     }));

//     const selectedEquipmentsData = equips.filter((equip) =>
//       (updated.equipments || []).includes(equip.value)
//     );

//     const info = {};
//     selectedEquipmentsData.forEach((equip) => {
//       info[equip.label] = equip.tags?.map((tag) => tag.TagName);
//     });

//     const newSelectedTagsByEquipment = {};
//     Object.keys(info).forEach((equipment) => {
//       if (selectedTagsByEquipment[equipment]) {
//         newSelectedTagsByEquipment[equipment] = selectedTagsByEquipment[equipment];
//       }
//     });

//     setDisplayedEquipmentInfo(info);
//     setSelectedTagsByEquipment(newSelectedTagsByEquipment);
    
//     // Check if any equipment was removed and clear it from loadedEquipments
//     const removedEquipments = prev.equipments?.filter(
//       eq => !(updated.equipments || []).includes(eq)
//     );
    
//     if (removedEquipments?.length) {
//       setLoadedEquipments(prev => {
//         const newSet = new Set(prev);
//         removedEquipments.forEach(eq => newSet.delete(eq));
//         return newSet;
//       });
//     }
//   };

//   const handleEquipmentTagsSelected = (equipment, selectedTags) => {
//     setSelectedTagsByEquipment((prev) => ({
//       ...prev,
//       [equipment]: selectedTags,
//     }));
//   };

//   const handleComplianceChange = (value) => {
//     setComplianceFilter(value);
//   };
  
//   const isEquipmentSelected = filters.equipments.length > 0;
//   const isLoadingOverall = recordsLoading || tasksLoading;

//   // Get records for a specific equipment
//   const getRecordsForEquipment = (equipmentValue) => {
//     if (!rawRecords || !rawRecords.length) return [];
    
//     // Transform equipment value to match the format used in records
//     const transformedEquipmentValue = equipmentValue.replace(/^(\d+)([A-Z]+)(\d+)$/, (_, num1, letters, num2) => {
//       return `${num1}-${letters.toLowerCase()}-${num2}`;
//     });
    
//     // Filter records that contain this equipment value
//     return rawRecords.filter(record => 
//       record.TagName && record.TagName.includes(transformedEquipmentValue)
//     );
//   };

//   return (
//     <div className="container mx-auto pt-4 relative">
//       <div className="sticky top-0 z-20 pb-4">
//         <div className="w-full mb-[10px] flex justify-between items-center border-b-[1px] pb-[10px]">
//           <h1 className="text-2xl font-bold">Performance Trends</h1>
//         </div>

//         <div className="flex flex-col gap-y-[2rem] items-start border-b-[1px] pb-[10px] mb-4 md:flex-row md:justify-between md:gap-y-0">
//           <div className={`flex items-center gap-4 ${isLoadingOverall && "opacity-50"}`}>
//             <EquipmentsSelect
//               onEquipmentChange={handleEquipmentChange}
//               availableEquipments={equips.map((eq) => ({ label: eq, value: eq }))}
//             />
//           </div>

//           <div className="flex flex-col gap-y-[10px] md:flex-row md:items-center md:space-x-4 md:gap-y-0">
//             <label className="md:mr-2">
//               Select Production Date:
//             </label>
//             <DateRangePicker
//               className="w-[250px]"
//               disabled={!isEquipmentSelected}
//               onChange={handleDateRangeChange}
//               value={filters.dateRange}
//               mode="range"
//             />
//           </div>
//         </div>
//       </div>

//       {isEquipmentSelected ? (
//         <div className="equip_container w-full overflow-y-scroll h-full lg:h-[22rem] 2xl:h-[40rem]">
//           {filters.equipments.map((equipmentValue) => {
//             const transformedEquipmentValue = equipmentValue.replace(/^(\d+)([A-Z]+)(\d+)$/, (_, num1, letters, num2) => {
//               return `${num1}-${letters.toLowerCase()}-${num2}`;
//             });
//             const equipmentSpecificTasks = equipmentTasks[transformedEquipmentValue.toLowerCase()] || [];
//             // Get records specific to this equipment
//             const equipmentRecords = getRecordsForEquipment(equipmentValue);

//             return (
//               <div key={equipmentValue}>
//                 <div className="grid grid-cols-1 gap-x-[5px] lg:grid-cols-3">
//                   <div className="lg:col-span-2">
//                     <EquipmentCard
//                       equipment={equipmentValue}
//                       onTagsSelected={handleEquipmentTagsSelected}
//                       dateRange={filters.dateRange}
//                       filteredRecords={{ tags: equipmentRecords }} // Pass equipment-specific records
//                     />
//                   </div>
//                   <div className="lg:col-span-1">
//                     <Compliance
//                       tasks={equipmentSpecificTasks}
//                       isLoading={tasksLoading}
//                       dateRange={filters.dateRange}
//                       onComplianceChange={handleComplianceChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="w-full">
//                   <TaskTable
//                     tasks={equipmentSpecificTasks}
//                     isLoading={tasksLoading}
//                     dateRange={filters.dateRange}
//                     complianceFilter={complianceFilter}
//                   />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className="text-center p-8">
//           No equipment selected. Please choose an equipment to begin.
//         </div>
//       )}
//     </div>
//   );
// };

// export default Engineering;

// "use client";

// import React, { useState, useEffect } from "react";
// import { DateRangePicker } from "../../_components/DateRangePicker";
// import EquipmentsSelect from "../../_components/EquipmentsSelect";
// import EquipmentCard from "../../_components/EquipmentCard";
// import Compliance from "../../_components/Compliance";
// import TaskTable from "../../_components/TaskTable";

// import { equips } from "@/data";
// import { useEquipmentTasks } from "@/hooks/useLimble";
// import { useGetEngRecords } from "@/hooks/useEng";
// import useTransformedRecordStore from "@/store/engStore";

// const Engineering = () => {
//   const [filters, setFilters] = useState({
//     equipments: [],
//     tags: [],
//     dateRange: null,
//     isCustomDateRange: false,
//   });

//   const [complianceFilter, setComplianceFilter] = useState('all');

//   const [displayedEquipmentInfo, setDisplayedEquipmentInfo] = useState({});
//   const [selectedTagsByEquipment, setSelectedTagsByEquipment] = useState({});
//   const [loadedEquipments, setLoadedEquipments] = useState(new Set());

//   const equipmentTasks = useTransformedRecordStore((state) => state.equipmentTasks);
//   const setEquipmentTasks = useTransformedRecordStore((state) => state.setEquipmentTasks);
//   const rawRecords = useTransformedRecordStore((state) => state.rawRecords);

//   console.log("Selected Equipment:", filters.equipments);
//   console.log("Selected Tags by Equipment:", selectedTagsByEquipment);
//   console.log("Displayed Equipment Info:", displayedEquipmentInfo);
  
//   // For each equipment, fetch its data individually
//   useEffect(() => {
//     filters.equipments.forEach(async (equipment) => {
//       // Only fetch if we haven't loaded this equipment yet
//       if (!loadedEquipments.has(equipment)) {
//         const { data } = await useGetEngRecords({
//           assets: equipment,
//           fromDate: filters.dateRange?.from,
//           toDate: filters.dateRange?.to,
//         });
        
//         // Mark this equipment as loaded
//         setLoadedEquipments(prev => new Set([...prev, equipment]));
//       }
//     });
//   }, [filters.equipments, filters.dateRange, loadedEquipments]);

//   // Fetch records for all selected equipment
//   const { data: allRecords, isLoading: recordsLoading } = useGetEngRecords({
//     assets: filters.equipments.join(','),
//     fromDate: filters.dateRange?.from,
//     toDate: filters.dateRange?.to,
//   });

//   const equipmentSlugs = filters.equipments.map((equip) => encodeURIComponent(equip));
//   const { data: tasks, isLoading: tasksLoading } = useEquipmentTasks(["tasks", ...equipmentSlugs]);

//   useEffect(() => {
//     if (tasks && !tasksLoading) {
//       // Ensure we handle tasks properly for multiple equipment
//       const tasksByEquipment = {};
      
//       if (Array.isArray(tasks)) {
//         tasks.forEach((task) => {
//           const assetName = task.assetName || 'unknown';
//           const normalizedAsset = assetName.toLowerCase();
          
//           if (!tasksByEquipment[normalizedAsset]) {
//             tasksByEquipment[normalizedAsset] = [];
//           }
//           tasksByEquipment[normalizedAsset].push(task);
//         });
        
//         // Update the store with merged data
//         Object.entries(tasksByEquipment).forEach(([asset, assetTasks]) => {
//           setEquipmentTasks({
//             success: true,
//             data: assetTasks,
//             assetName: asset,
//             associatedAssetIDs: []
//           });
//         });
//       } else {
//         // If tasks is not an array, use the original approach
//         setEquipmentTasks(tasks);
//       }
//     }
//   }, [tasks, tasksLoading, setEquipmentTasks]);

//   const setDefaultDateRange = () => {
//     const today = new Date();
//     const from = new Date(today);
//     from.setDate(today.getDate() - 1);
//     from.setHours(7, 0, 0, 0);

//     const to = new Date(today);
//     to.setHours(6, 0, 0, 0);

//     const defaultRange = { from, to };
//     setFilters((prev) => ({ ...prev, dateRange: defaultRange, isCustomDateRange: false }));
//   };

//   useEffect(() => {
//     if (filters.equipments.length > 0 && !filters.dateRange) {
//       setDefaultDateRange();
//     }
//   }, [filters.equipments]);

//   const handleDateRangeChange = (fromDate, toDate) => {
//     console.log("Date range changed:", fromDate, toDate);
    
//     // If no dates provided or both are null, clear the filter
//     if (!fromDate && !toDate) {
//       setFilters(prev => ({
//         ...prev,
//         dateRange: null,
//         isCustomDateRange: false,
//       }));
//       return;
//     }
    
//     // Handle single date selection
//     if (fromDate && !toDate) {
//       // Adjust 'from' - one day before, set to 07:00:00
//       const from = new Date(fromDate);
//       from.setDate(from.getDate() - 1);
//       from.setHours(7, 0, 0, 0);
    
//       // Adjust 'to' - set to 06:00:00
//       const to = new Date(fromDate);
//       to.setHours(6, 0, 0, 0);
      
//       setFilters(prev => ({
//         ...prev,
//         dateRange: { from, to },
//         isCustomDateRange: true,
//       }));
      
//       // Reset loaded equipments so we refetch with new date range
//       setLoadedEquipments(new Set());
//     } 
//     // Handle date range selection
//     else if (fromDate && toDate) {
//       // Adjust 'from' - one day before the first date, set to 07:00:00
//       const from = new Date(fromDate);
//       from.setDate(from.getDate() - 1);
//       from.setHours(7, 0, 0, 0);
    
//       // Adjust 'to' - set to 06:00:00 on the end date
//       const to = new Date(toDate);
//       to.setHours(6, 0, 0, 0);
      
//       setFilters(prev => ({
//         ...prev,
//         dateRange: { from, to },
//         isCustomDateRange: true,
//       }));
      
//       // Reset loaded equipments so we refetch with new date range
//       setLoadedEquipments(new Set());
//     }
    
//     console.log("Updated Filters:", {
//       from: fromDate ? new Date(fromDate).toISOString() : null,
//       to: toDate ? new Date(toDate).toISOString() : null,
//     });
//   };
  
//   const handleEquipmentChange = (newFilters) => {
//     const updated = typeof newFilters === "function" ? newFilters(filters) : newFilters;
//     const prevEquipments = filters.equipments; // Capture the previous equipments before state update
  
//     setFilters((prev) => ({
//       ...prev,
//       equipments: updated.equipments || [],
//       dateRange: prev.dateRange,
//       isCustomDateRange: prev.isCustomDateRange,
//     }));
  
//     const selectedEquipmentsData = equips.filter((equip) =>
//       (updated.equipments || []).includes(equip.value)
//     );
  
//     const info = {};
//     selectedEquipmentsData.forEach((equip) => {
//       info[equip.label] = equip.tags?.map((tag) => tag.TagName);
//     });
  
//     const newSelectedTagsByEquipment = {};
//     Object.keys(info).forEach((equipment) => {
//       if (selectedTagsByEquipment[equipment]) {
//         newSelectedTagsByEquipment[equipment] = selectedTagsByEquipment[equipment];
//       }
//     });
  
//     setDisplayedEquipmentInfo(info);
//     setSelectedTagsByEquipment(newSelectedTagsByEquipment);
  
//     const removedEquipments = prevEquipments?.filter(
//       eq => !(updated.equipments || []).includes(eq)
//     );
  
//     if (removedEquipments?.length) {
//       setLoadedEquipments(prev => {
//         const newSet = new Set(prev);
//         removedEquipments.forEach(eq => newSet.delete(eq));
//         return newSet;
//       });
//     }
//   };
  

//   const handleEquipmentTagsSelected = (equipment, selectedTags) => {
//     setSelectedTagsByEquipment((prev) => ({
//       ...prev,
//       [equipment]: selectedTags,
//     }));
//   };

//   const handleComplianceChange = (value) => {
//     setComplianceFilter(value);
//   };
  
//   const isEquipmentSelected = filters.equipments.length > 0;
//   const isLoadingOverall = recordsLoading || tasksLoading;

//   // Get records for a specific equipment
//   const getRecordsForEquipment = (equipmentValue) => {
//     if (!rawRecords || !rawRecords.length) return [];
    
//     // Transform equipment value to match the format used in records
//     const transformedEquipmentValue = equipmentValue.replace(/^(\d+)([A-Z]+)(\d+)$/, (_, num1, letters, num2) => {
//       return `${num1}-${letters.toLowerCase()}-${num2}`;
//     });
    
//     // Filter records that contain this equipment value
//     return rawRecords.filter(record => 
//       record.TagName && record.TagName.includes(transformedEquipmentValue)
//     );
//   };

//   return (
//     <div className="container mx-auto pt-4 relative">
//       <div className="sticky top-0 z-20 pb-4">
//         <div className="w-full mb-[10px] flex justify-between items-center border-b-[1px] pb-[10px]">
//           <h1 className="text-2xl font-bold">Performance Trends</h1>
//         </div>

//         <div className="flex flex-col gap-y-[2rem] items-start border-b-[1px] pb-[10px] mb-4 md:flex-row md:justify-between md:gap-y-0">
//           <div className={`flex items-center gap-4 ${isLoadingOverall && "opacity-50"}`}>
//             <EquipmentsSelect
//               onEquipmentChange={handleEquipmentChange}
//               availableEquipments={equips.map((eq) => ({ label: eq, value: eq }))}
//             />
//           </div>

//           <div className="flex flex-col gap-y-[10px] md:flex-row md:items-center md:space-x-4 md:gap-y-0">
//             <label className="md:mr-2">
//               Select Production Date:
//             </label>
//             <DateRangePicker
//               className="w-[250px]"
//               disabled={!isEquipmentSelected}
//               onChange={handleDateRangeChange}
//               value={filters.dateRange}
//               mode="range"
//             />
//           </div>
//         </div>
//       </div>

//       {isEquipmentSelected ? (
//         <div className="equip_container w-full overflow-y-scroll h-full lg:h-[22rem] 2xl:h-[40rem]">
//           {filters.equipments.map((equipmentValue) => {
//             const transformedEquipmentValue = equipmentValue.replace(/^(\d+)([A-Z]+)(\d+)$/, (_, num1, letters, num2) => {
//               return `${num1}-${letters.toLowerCase()}-${num2}`;
//             });
//             const equipmentSpecificTasks = equipmentTasks[transformedEquipmentValue.toLowerCase()] || [];
//             // Get records specific to this equipment
//             const equipmentRecords = getRecordsForEquipment(equipmentValue);

//             return (
//               <div key={equipmentValue}>
//                 <div className="grid grid-cols-1 gap-x-[5px] lg:grid-cols-3">
//                   <div className="lg:col-span-2">
//                     <EquipmentCard
//                       equipment={equipmentValue}
//                       onTagsSelected={handleEquipmentTagsSelected}
//                       dateRange={filters.dateRange}
//                       filteredRecords={{ tags: equipmentRecords }} // Pass equipment-specific records
//                     />
//                   </div>
//                   <div className="lg:col-span-1">
//                     <Compliance
//                       tasks={equipmentSpecificTasks}
//                       isLoading={tasksLoading}
//                       dateRange={filters.dateRange}
//                       onComplianceChange={handleComplianceChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="w-full">
//                   <TaskTable
//                     tasks={equipmentSpecificTasks}
//                     isLoading={tasksLoading}
//                     dateRange={filters.dateRange}
//                     complianceFilter={complianceFilter}
//                   />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className="text-center p-8">
//           No equipment selected. Please choose an equipment to begin.
//         </div>
//       )}
//     </div>
//   );
// };

// export default Engineering;


// "use client";

// import React, { useState, useEffect } from "react";
// import { DateRangePicker } from "../../_components/DateRangePicker";
// import EquipmentsSelect from "../../_components/EquipmentsSelect";
// import EquipmentCard from "../../_components/EquipmentCard";
// import Compliance from "../../_components/Compliance";
// import TaskTable from "../../_components/TaskTable";

// import { equips } from "@/data";
// import { useEquipmentTasks } from "@/hooks/useLimble";
// import { useGetEngRecords } from "@/hooks/useEng";
// import useTransformedRecordStore from "@/store/engStore";

// const Engineering = () => {
//   const [filters, setFilters] = useState({
//     equipments: [],
//     tags: [],
//     dateRange: null,
//     isCustomDateRange: false,
//   });

//   const [complianceFilter, setComplianceFilter] = useState('all');
//   const [displayedEquipmentInfo, setDisplayedEquipmentInfo] = useState({});
//   const [selectedTagsByEquipment, setSelectedTagsByEquipment] = useState({});

//   const equipmentTasks = useTransformedRecordStore((state) => state.equipmentTasks);
//   const setEquipmentTasks = useTransformedRecordStore((state) => state.setEquipmentTasks);

//   const selectedEquipment = filters.equipments[0] || null;

//   const { data: rawRecords, isLoading: recordsLoading } = useGetEngRecords({
//     assets: selectedEquipment,
//     fromDate: filters.dateRange?.from,
//     toDate: filters.dateRange?.to,
//   });

//   const equipmentSlugs = filters.equipments.map((equip) => encodeURIComponent(equip));
//   const { data: tasks, isLoading: tasksLoading } = useEquipmentTasks(["tasks", ...equipmentSlugs]);

//   useEffect(() => {
//     if (tasks && !tasksLoading) {
//       setEquipmentTasks(tasks);
//     }
//   }, [tasks, tasksLoading, setEquipmentTasks]);

//   const setDefaultDateRange = () => {
//     const today = new Date();
//     const from = new Date(today);
//     from.setDate(today.getDate() - 1);
//     from.setHours(7, 0, 0, 0);

//     const to = new Date(today);
//     to.setHours(6, 0, 0, 0);

//     const defaultRange = { from, to };
//     setFilters((prev) => ({ ...prev, dateRange: defaultRange, isCustomDateRange: false }));
//   };

//   useEffect(() => {
//     if (filters.equipments.length > 0 && !filters.dateRange) {
//       setDefaultDateRange();
//     }
//   }, [filters.equipments]);

//   const handleDateRangeChange = (date) => {
//     console.log("Date range changed:", date);

//     if (!date || (Array.isArray(date) && date.length !== 2)) {
//       setFilters((prev) => ({
//         ...prev,
//         dateRange: null,
//         isCustomDateRange: false,
//       }));
//       return;
//     }

//     let from;
//     let to;

//     if (Array.isArray(date) && date.length === 2) {
//       from = new Date(date[0]);
//       from.setDate(from.getDate() - 1);
//       from.setHours(7, 0, 0, 0);

//       to = new Date(date[1]);
//       to.setHours(6, 0, 0, 0);
//     } else {
//       const selected = new Date(date);
//       from = new Date(selected);
//       from.setDate(from.getDate() - 1);
//       from.setHours(7, 0, 0, 0);

//       to = new Date(selected);
//       to.setHours(6, 0, 0, 0);
//     }

//     setFilters((prev) => ({
//       ...prev,
//       dateRange: { from, to },
//       isCustomDateRange: true,
//     }));
//   };

//   const handleEquipmentChange = (newFilters) => {
//     const updated = typeof newFilters === "function" ? newFilters(filters) : newFilters;

//     setFilters((prev) => ({
//       ...prev,
//       equipments: updated.equipments || [],
//       dateRange: prev.dateRange,
//       isCustomDateRange: prev.isCustomDateRange,
//     }));

//     const selectedEquipmentsData = equips.filter((equip) =>
//       (updated.equipments || []).includes(equip.value)
//     );

//     const info = {};
//     selectedEquipmentsData.forEach((equip) => {
//       info[equip.label] = equip.tags?.map((tag) => tag.TagName);
//     });

//     const newSelectedTagsByEquipment = {};
//     Object.keys(info).forEach((equipment) => {
//       if (selectedTagsByEquipment[equipment]) {
//         newSelectedTagsByEquipment[equipment] = selectedTagsByEquipment[equipment];
//       }
//     });

//     setDisplayedEquipmentInfo(info);
//     setSelectedTagsByEquipment(newSelectedTagsByEquipment);
//   };

//   const handleEquipmentTagsSelected = (equipment, selectedTags) => {
//     setSelectedTagsByEquipment((prev) => ({
//       ...prev,
//       [equipment]: selectedTags,
//     }));
//   };

//   const handleComplianceChange = (value) => {
//     setComplianceFilter(value);
//   };

//   const isEquipmentSelected = filters.equipments.length > 0;
//   const isLoadingOverall = recordsLoading || tasksLoading;

//   const getFullDayRange = (range) => {
//     if (!range) return null;

//     const from = new Date(range.from);
//     const to = new Date(range.to);

//     from.setHours(0, 0, 0, 0);
//     to.setHours(23, 59, 59, 999);

//     return { from, to };
//   };

//   return (
//     <div className="container mx-auto pt-4 relative">
//       <div className="sticky top-0 z-20 pb-4">
//         <div className="w-full mb-[10px] flex justify-between items-center border-b-[1px] pb-[10px]">
//           <h1 className="text-2xl font-bold">Performance Trends</h1>
//         </div>

//         <div className="flex justify-between items-start border-b-[1px] pb-[10px] mb-4">
//           <div className={`flex items-center gap-4 ${isLoadingOverall && "opacity-50"}`}>
//             <EquipmentsSelect
//               onEquipmentChange={handleEquipmentChange}
//               availableEquipments={equips.map((eq) => ({ label: eq, value: eq }))}
//             />
//           </div>

//           <div className="flex items-center space-x-4">
//             <label className="mr-2">
//               {filters.isCustomDateRange ? "Custom Production Period:" : "Select Production Date:"}
//             </label>
//             <DateRangePicker
//               className="w-[250px]"
//               disabled={!isEquipmentSelected}
//               onChange={handleDateRangeChange}
//               value={filters.dateRange}
//             />
//           </div>
//         </div>
//       </div>

//       {isEquipmentSelected ? (
//         <div className="equip_container w-full overflow-y-scroll h-[22rem] 2xl:h-[42rem]">
//           {filters.equipments.map((equipmentValue) => {
//             const transformedEquipmentValue = equipmentValue.replace(/([A-Z]+)(\d+)/, (match, p1, p2) => {
//               return p1.toLowerCase() + '-' + p2;
//             });
//             const equipmentSpecificTasks = equipmentTasks[transformedEquipmentValue.toLowerCase()] || [];

//             return (
//               <div key={equipmentValue}>
//                 <div className="grid grid-cols-3 gap-x-[5px]">
//                   <div className="col-span-2">
//                     <EquipmentCard
//                       equipment={equipmentValue}
//                       onTagsSelected={handleEquipmentTagsSelected}
//                       dateRange={filters.dateRange}
//                       filteredRecords={{ tags: rawRecords || [] }}
//                     />
//                   </div>
//                   <div className="col-span-1">
//                     <Compliance
//                       tasks={equipmentSpecificTasks}
//                       isLoading={tasksLoading}
//                       dateRange={getFullDayRange(filters.dateRange)}
//                       onComplianceChange={handleComplianceChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="w-full">
//                   <TaskTable
//                     tasks={equipmentSpecificTasks}
//                     isLoading={tasksLoading}
//                     dateRange={getFullDayRange(filters.dateRange)}
//                     complianceFilter={complianceFilter}
//                   />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className="text-center p-8 bg-slate-50 rounded-lg">
//           No equipment selected. Please choose an equipment to begin.
//         </div>
//       )}
//     </div>
//   );
// };

// export default Engineering;
