
// import { create } from 'zustand';

// const useTransformedRecordStore = create((set, get) => ({
//   rawRecords: [],
//   equipmentTasks: {},
//   filters: {
//     dateRange: null, // default to null, will set later
//     isCustomDateRange: false,
//   },

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

//   setFilters: (newFilters) => set({ filters: { ...get().filters, ...newFilters } }),

//   // Apply default date range
//   setDefaultDateRange: () => {
//     const today = new Date();
//     const from = new Date(today);
//     from.setHours(0, 0, 0, 0); // 12:00 AM
  
//     const to = new Date(today);
//     to.setHours(23, 59, 59, 999); // 11:59:59.999 PM
  
//     set({
//       filters: {
//         dateRange: { from, to },
//         isCustomDateRange: false,
//       },
//     });
//   },
  
//   // Handle custom date range changes (full days)
//   handleDateRangeChange: (date) => {
//     if (!date) {
//       set({
//         filters: {
//           ...get().filters,
//           dateRange: null,
//           isCustomDateRange: false,
//         },
//       });
//       return;
//     }
  
//     if (Array.isArray(date) && date.length === 2) {
//       const [from, to] = date;
//       from.setHours(0, 0, 0, 0); // start of day
//       to.setHours(23, 59, 59, 999); // end of day
  
//       set({
//         filters: {
//           dateRange: { from, to },
//           isCustomDateRange: true,
//         },
//       });
//     }
//   },

//   // Filter tasks by date range
//   filterTasksByDateRange: (tasks) => {
//     const { dateRange } = get().filters;
//     if (!dateRange || !Array.isArray(tasks)) return tasks;

//     return tasks.filter((task) => {
//       const taskDate = new Date(task.dueDate);
//       return taskDate >= dateRange.from && taskDate <= dateRange.to;
//     });
//   },

//   // Clear all records and reset filters
//   clearRecords: () => set({
//     rawRecords: [],
//     equipmentTasks: {},
//     filters: {
//       dateRange: null,
//       isCustomDateRange: false,
//     },
//   }),

// }));

// export default useTransformedRecordStore;


// Modified Zustand store to properly handle multiple equipment selections

import { create } from 'zustand';

const useTransformedRecordStore = create((set, get) => ({
  rawRecords: [],
  equipmentTasks: {},
  selectedEquipment: [], // Track selected equipment IDs/names
  filters: {
    dateRange: null,
    isCustomDateRange: false,
  },

  setRawRecords: (records) => {
    set({ rawRecords: records });
  },

  // Add equipment to selection
  selectEquipment: (equipmentName) => {
    const normalized = equipmentName.toLowerCase();
    const currentSelected = get().selectedEquipment;
    
    if (!currentSelected.includes(normalized)) {
      set({ selectedEquipment: [...currentSelected, normalized] });
    }
  },

  // Remove equipment from selection
  deselectEquipment: (equipmentName) => {
    const normalized = equipmentName.toLowerCase();
    const currentSelected = get().selectedEquipment;
    
    set({ 
      selectedEquipment: currentSelected.filter(eq => eq !== normalized) 
    });
  },

  // Toggle equipment selection
  toggleEquipmentSelection: (equipmentName) => {
    const normalized = equipmentName.toLowerCase();
    const currentSelected = get().selectedEquipment;
    
    if (currentSelected.includes(normalized)) {
      get().deselectEquipment(normalized);
    } else {
      get().selectEquipment(normalized);
    }
  },

  // Check if equipment is selected
  isEquipmentSelected: (equipmentName) => {
    const normalized = equipmentName.toLowerCase();
    return get().selectedEquipment.includes(normalized);
  },

  // Get selected equipment data
  getSelectedEquipmentData: () => {
    const selectedEquipment = get().selectedEquipment;
    const equipmentTasks = get().equipmentTasks;
    
    const selectedData = {};
    selectedEquipment.forEach(eqName => {
      selectedData[eqName] = equipmentTasks[eqName] || [];
    });
    
    return selectedData;
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
      // Merge with existing tasks instead of overwriting the entire object
      set(state => ({
        equipmentTasks: {
          ...state.equipmentTasks,
          [normalizedAsset]: tasksArray,
        }
      }));
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

      // Merge with existing tasks instead of replacing
      set(state => ({
        equipmentTasks: {
          ...state.equipmentTasks,
          ...tasksByEquipment
        }
      }));
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
    selectedEquipment: [],
    filters: {
      dateRange: null,
      isCustomDateRange: false,
    },
  }),
}));

export default useTransformedRecordStore;


