"use client";

import React, { useState, useEffect } from "react";
import { DateRangePicker } from "../../_components/DateRangePicker";
import EquipmentsSelect from "../../_components/EquipmentsSelect";
import EquipmentCard from "../../_components/EquipmentCard";
import Compliance from "../../_components/Compliance";
import TaskTable from "../../_components/TaskTable";

import { equips } from "@/data";
import { useEquipmentTasks } from "@/hooks/useLimble";
import { useGetEngRecords } from "@/hooks/useEng";
import useTransformedRecordStore from "@/store/engStore";

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

  const equipmentTasks = useTransformedRecordStore((state) => state.equipmentTasks);
  const setEquipmentTasks = useTransformedRecordStore((state) => state.setEquipmentTasks);

  const selectedEquipment = filters.equipments[0] || null;

  const { data: rawRecords, isLoading: recordsLoading } = useGetEngRecords({
    assets: selectedEquipment,
    fromDate: filters.dateRange?.from,
    toDate: filters.dateRange?.to,
  });

  const equipmentSlugs = filters.equipments.map((equip) => encodeURIComponent(equip));
  const { data: tasks, isLoading: tasksLoading } = useEquipmentTasks(["tasks", ...equipmentSlugs]);

  useEffect(() => {
    if (tasks && !tasksLoading) {
      setEquipmentTasks(tasks);
    }
  }, [tasks, tasksLoading, setEquipmentTasks]);

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
    
    console.log("Updated Filters:", {
      from: fromDate ? new Date(fromDate).toISOString() : null,
      to: toDate ? new Date(toDate).toISOString() : null,
    });
  };
  
  

  const handleEquipmentChange = (newFilters) => {
    const updated = typeof newFilters === "function" ? newFilters(filters) : newFilters;

    setFilters((prev) => ({
      ...prev,
      equipments: updated.equipments || [],
      dateRange: prev.dateRange, // ✅ Preserve existing date range
      isCustomDateRange: prev.isCustomDateRange,
    }));

    const selectedEquipmentsData = equips.filter((equip) =>
      (updated.equipments || []).includes(equip.value)
    );

    const info = {};
    selectedEquipmentsData.forEach((equip) => {
      info[equip.label] = equip.tags?.map((tag) => tag.TagName);
    });

    const newSelectedTagsByEquipment = {};
    Object.keys(info).forEach((equipment) => {
      if (selectedTagsByEquipment[equipment]) {
        newSelectedTagsByEquipment[equipment] = selectedTagsByEquipment[equipment];
      }
    });

    setDisplayedEquipmentInfo(info);
    setSelectedTagsByEquipment(newSelectedTagsByEquipment);
  };

  const handleEquipmentTagsSelected = (equipment, selectedTags) => {
    setSelectedTagsByEquipment((prev) => ({
      ...prev,
      [equipment]: selectedTags,
    }));
  };

  const handleComplianceChange = (value) => {
    setComplianceFilter(value);
  };

  // console.log("Equipment Tasks:", equipmentTasks);
  
  const isEquipmentSelected = filters.equipments.length > 0;
  const isLoadingOverall = recordsLoading || tasksLoading;

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
              {filters.isCustomDateRange ? "Custom Production Period:" : "Select Production Date:"}
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
        <div className="equip_container w-full overflow-y-scroll h-full lg:h-[22rem] 2xl:h-[42rem]">
          {filters.equipments.map((equipmentValue) => {
            const transformedEquipmentValue = equipmentValue.replace(/^(\d+)([A-Z]+)(\d+)$/, (_, num1, letters, num2) => {
              return `${num1}-${letters.toLowerCase()}-${num2}`;
            });
            const equipmentSpecificTasks = equipmentTasks[transformedEquipmentValue.toLowerCase()] || [];

            return (
              <div key={equipmentValue}>
                <div className="grid grid-cols-1 gap-x-[5px] lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <EquipmentCard
                      equipment={equipmentValue}
                      onTagsSelected={handleEquipmentTagsSelected}
                      dateRange={filters.dateRange}
                      filteredRecords={{ tags: rawRecords || [] }}
                      
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
        <div className="text-center p-8 bg-slate-50 rounded-lg">
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
