// import { create } from 'zustand';

// const useTransformedRecordStore = create((set, get) => ({
//   rawRecords: [],
//   equipmentTasks: {},

//   setRawRecords: (records) => {
//     set({ rawRecords: records });
//   },

//   setEquipmentTasks: (input) => {
//     let tasksArray = [];
//     let baseAssetName = 'unknown';

//     if (
//       input &&
//       input.success === true &&
//       Array.isArray(input.data) &&
//       input.assetName &&
//       Array.isArray(input.associatedAssetIDs)
//     ) {
//       tasksArray = input.data;
//       baseAssetName = input.assetName;

//       const normalizedAsset = baseAssetName.toLowerCase();
//       set({
//         equipmentTasks: {
//           [normalizedAsset]: tasksArray,
//         },
//       });
//       return;
//     }

//     if (Array.isArray(input)) {
//       const tasksByEquipment = {};
//       input.forEach((task) => {
//         const assetName = (task.assetName || 'unknown').toLowerCase();
//         if (!tasksByEquipment[assetName]) {
//           tasksByEquipment[assetName] = [];
//         }
//         tasksByEquipment[assetName].push(task);
//       });

//       set({ equipmentTasks: tasksByEquipment });
//     }
//   },

//   clearRecords: () => set({
//     rawRecords: [],
//     equipmentTasks: {},
//   }),
// }));

// export default useTransformedRecordStore;

import { create } from 'zustand';

const useTransformedRecordStore = create((set, get) => ({
  rawRecords: [],
  equipmentTasks: {},
  filters: {
    dateRange: null, // default to null, will set later
    isCustomDateRange: false,
  },

  setRawRecords: (records) => {
    set({ rawRecords: records });
  },

  setEquipmentTasks: (input) => {
    let tasksArray = [];
    let baseAssetName = 'unknown';

    if (
      input &&
      input.success === true &&
      Array.isArray(input.data) &&
      input.assetName &&
      Array.isArray(input.associatedAssetIDs)
    ) {
      tasksArray = input.data;
      baseAssetName = input.assetName;

      const normalizedAsset = baseAssetName.toLowerCase();
      set({
        equipmentTasks: {
          [normalizedAsset]: tasksArray,
        },
      });
      return;
    }

    if (Array.isArray(input)) {
      const tasksByEquipment = {};
      input.forEach((task) => {
        const assetName = (task.assetName || 'unknown').toLowerCase();
        if (!tasksByEquipment[assetName]) {
          tasksByEquipment[assetName] = [];
        }
        tasksByEquipment[assetName].push(task);
      });

      set({ equipmentTasks: tasksByEquipment });
    }
  },

  setFilters: (newFilters) => set({ filters: { ...get().filters, ...newFilters } }),

  // Apply default date range
  setDefaultDateRange: () => {
    const today = new Date();
    const from = new Date(today);
    from.setHours(0, 0, 0, 0); // 12:00 AM
  
    const to = new Date(today);
    to.setHours(23, 59, 59, 999); // 11:59:59.999 PM
  
    set({
      filters: {
        dateRange: { from, to },
        isCustomDateRange: false,
      },
    });
  },
  
  // Handle custom date range changes (full days)
  handleDateRangeChange: (date) => {
    if (!date) {
      set({
        filters: {
          ...get().filters,
          dateRange: null,
          isCustomDateRange: false,
        },
      });
      return;
    }
  
    if (Array.isArray(date) && date.length === 2) {
      const [from, to] = date;
      from.setHours(0, 0, 0, 0); // start of day
      to.setHours(23, 59, 59, 999); // end of day
  
      set({
        filters: {
          dateRange: { from, to },
          isCustomDateRange: true,
        },
      });
    }
  },

  // Filter tasks by date range
  filterTasksByDateRange: (tasks) => {
    const { dateRange } = get().filters;
    if (!dateRange || !Array.isArray(tasks)) return tasks;

    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= dateRange.from && taskDate <= dateRange.to;
    });
  },

  // Clear all records and reset filters
  clearRecords: () => set({
    rawRecords: [],
    equipmentTasks: {},
    filters: {
      dateRange: null,
      isCustomDateRange: false,
    },
  }),

}));

export default useTransformedRecordStore;

