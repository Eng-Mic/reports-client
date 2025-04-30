// import { create } from 'zustand';
// import { 
//   format, 
//   startOfHour, 
//   isWithinInterval, 
//   parse, 
//   parseISO, 
//   isValid 
// } from 'date-fns';

// const safeParseDate = (dateString) => {
//   const parseStrategies = [
//     () => parseISO(dateString),
//     () => parse(dateString, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", new Date()),
//     () => parse(dateString, "yyyy-MM-dd HH:mm:ss", new Date()),
//     () => new Date(dateString)
//   ];

//   for (const strategy of parseStrategies) {
//     const parsedDate = strategy();
//     if (isValid(parsedDate)) return parsedDate;
//   }

//   console.warn(`Unable to parse date: ${dateString}`);
//   return null;
// };

// const transformData = (originalData) => {
//   const groupedByHour = {};
//   const uniqueTags = new Set();

//   originalData.forEach((item) => {
//     const dateTimeFields = ['DateTime', 'dateTime', 'timestamp', 'date', 'createdAt'];
//     let dateToUse = dateTimeFields.map(field => item[field] && safeParseDate(item[field])).find(date => date);
//     if (!dateToUse) return;

//     const hourlyTimestamp = format(startOfHour(dateToUse), "yyyy-MM-dd HH:00:00");
//     const productionDate = format(dateToUse, "MM/dd/yy");
//     const time = format(startOfHour(dateToUse), "HH:00");
    
//     const tag = ['TagName', 'tagName', 'tag', 'name', 'identifier']
//       .map(candidate => item[candidate])
//       .find(value => value) || '';
    
//     const value = ['Value', 'value', 'data', 'measurement']
//       .map(candidate => item[candidate]?.toString())
//       .find(value => value) || '-';

//     uniqueTags.add(tag);

//     if (!groupedByHour[hourlyTimestamp]) {
//       groupedByHour[hourlyTimestamp] = { 
//         productionDate, time, timestamp: hourlyTimestamp,
//         originalDateTime: dateToUse.toISOString()
//       };
//     }

//     groupedByHour[hourlyTimestamp][tag] = value;
//   });

//   return {
//     transformedData: Object.values(groupedByHour).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
//     uniqueTags: Array.from(uniqueTags),
//   };
// };

// const useRecordsStore = create((set, get) => ({
//   records: [],
//   dateRange: { from: null, to: null },

//   setRecords: (records) => set({ records: Array.isArray(records) ? records : [] }),
//   clearRecords: () => set({ records: [], dateRange: { from: null, to: null } }),
//   setDateRange: (from, to) => set({ dateRange: { from, to: to || from } }),

//   getTransformedData: () => {
//     const { records, dateRange } = get();
//     const { transformedData, uniqueTags } = transformData(records);

//     if (!dateRange.from || !dateRange.to) return { transformedData, uniqueTags };
    
//     const productionDateRange = {
//       start: parse(format(dateRange.from, "MM/dd/yy"), "MM/dd/yy", new Date()),
//       end: parse(format(dateRange.to, "MM/dd/yy"), "MM/dd/yy", new Date())
//     };
    
//     return {
//       transformedData: transformedData.filter(item => isWithinInterval(parse(item.productionDate, "MM/dd/yy", new Date()), productionDateRange)),
//       uniqueTags,
//     };
//   }
// }));

// export default useRecordsStore;



// Worked Version - Initial
// import { format, startOfHour } from 'date-fns';
// import { create } from 'zustand';

// const useRecordStore = create((set) => ({
//   records: [], // Original records
//   transformedRecords: [], // New field to store transformed data
//   uniqueTags: [], // New field to store unique tags

//   // Update method to set both original and transformed records
//   setRecords: (records) => {
//     // Transform data when setting records
//     const { transformedData, uniqueTags } = transformData(records);
    
//     set((state) => ({
//       records: records,
//       transformedRecords: transformedData,
//       uniqueTags: uniqueTags
//     }));
//   },

//   // Optional: Clear method
//   clearRecords: () => set({ 
//     records: [], 
//     transformedRecords: [], 
//     uniqueTags: [] 
//   })
// }));

// // Move the transformData function here or import it
// const transformData = (originalData) => {
//   const groupedByHour = {};
//   const uniqueTags = new Set();
//   const parseErrors = [];
  
//   // Track all values for each hour and tag
//   const allValuesPerHourAndTag = {};

//   originalData.forEach((item, index) => {
//     try {
//       // More robust date parsing
//       const date = item.DateTime instanceof Date 
//         ? item.DateTime 
//         : new Date(item.DateTime);

//       if (isNaN(date.getTime())) {
//         parseErrors.push({
//           index,
//           item,
//           error: 'Invalid date'
//         });
//         return;
//       }

//       const hourlyTimestamp = format(startOfHour(date), "yyyy-MM-dd HH:00:00");
//       const productionDate = format(date, "MM/dd/yy");
//       const time = format(startOfHour(date), "HH:00");
//       const tag = item.TagName || "";
//       const value = item.Value ?? "-";

//       uniqueTags.add(tag);

//       // Initialize the hour entry if it doesn't exist
//       if (!groupedByHour[hourlyTimestamp]) {
//         groupedByHour[hourlyTimestamp] = { 
//           productionDate, 
//           time,
//           timestamp: hourlyTimestamp
//         };
//         allValuesPerHourAndTag[hourlyTimestamp] = {};
//       }

//       // Initialize the tag array if it doesn't exist
//       if (!allValuesPerHourAndTag[hourlyTimestamp][tag]) {
//         allValuesPerHourAndTag[hourlyTimestamp][tag] = [];
//       }

//       // Add this value to the collection for this hour and tag
//       if (value !== "-" && !isNaN(parseFloat(value))) {
//         allValuesPerHourAndTag[hourlyTimestamp][tag].push(parseFloat(value));
//       }
      
//       // For backward compatibility, keep the most recent value too
//       groupedByHour[hourlyTimestamp][tag] = value;
      
//       // You can also store aggregated values like:
//       if (allValuesPerHourAndTag[hourlyTimestamp][tag].length > 0) {
//         // Get the array of values for this hour and tag
//         const values = allValuesPerHourAndTag[hourlyTimestamp][tag];
        
//         // Store various aggregations
//         groupedByHour[hourlyTimestamp][`${tag}_last`] = values[values.length - 1];
//         groupedByHour[hourlyTimestamp][`${tag}_first`] = values[0];
//         groupedByHour[hourlyTimestamp][`${tag}_avg`] = values.reduce((sum, val) => sum + val, 0) / values.length;
//         groupedByHour[hourlyTimestamp][`${tag}_max`] = Math.max(...values);
//         groupedByHour[hourlyTimestamp][`${tag}_min`] = Math.min(...values);
//         groupedByHour[hourlyTimestamp][`${tag}_count`] = values.length;
//       }
//     } catch (error) {
//       parseErrors.push({
//         index,
//         item,
//         error: error.message
//       });
//     }
//   });

//   // Convert to array and sort
//   const transformedData = Object.values(groupedByHour)
//     .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

//   // Add more unique tags for the aggregation columns
//   const enhancedUniqueTags = new Set(uniqueTags);
//   uniqueTags.forEach(tag => {
//     enhancedUniqueTags.add(`${tag}_last`);
//     enhancedUniqueTags.add(`${tag}_first`);
//     enhancedUniqueTags.add(`${tag}_avg`);
//     enhancedUniqueTags.add(`${tag}_max`);
//     enhancedUniqueTags.add(`${tag}_min`);
//     enhancedUniqueTags.add(`${tag}_count`);
//   });

//   return {
//     transformedData,
//     uniqueTags: Array.from(uniqueTags), // Or use enhancedUniqueTags if you want the aggregated columns
//     parseErrors
//   };
// };

// export default useRecordStore;


// useRecordStore.js
// import { format, startOfHour, parseISO, isValid, parse } from 'date-fns';
// import { create } from 'zustand';

// const timeSlotsArray = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'];

// const useRecordStore = create((set, get) => ({
//     records: [], // Original records
//     transformedRecords: [], // Transformed data for the table
//     timeSlots: timeSlotsArray, // Fixed array of time slots
//     selectedDateRange: { from: null, to: null },

//     setSelectedDateRange: (from, to) => set({ selectedDateRange: { from, to } }),

//     // Update method to set original records and transform them
//     setRecords: (records) => {
//         const transformedData = transformData(records);
//         set({ records, transformedRecords: transformedData });
//     },

//     // Clear method
//     clearRecords: () => set({ records: [], transformedRecords: [], selectedDateRange: { from: null, to: null } }),
// }));

// // Helper function for safe date parsing
// const safeParseDate = (dateString) => {
//     try {
//         return parseISO(dateString);
//     } catch (error) {
//         console.error("Error parsing date:", dateString, error);
//         return null;
//     }
// };

// // Transform data function (grouping by hour and then by TagName)
// const transformData = (originalData) => {
//     const aggregatedDataByTagDate = {};

//     originalData.forEach((item) => {
//         const date = item.DateTime instanceof Date ? item.DateTime : safeParseDate(item.DateTime);
//         if (!date) return;
//         const productionDate = format(date, "MM/dd/yy");
//         const hourStart = startOfHour(date);
//         const time = format(hourStart, "HH:00");
//         const tagName = item.TagName || "";
//         const value = item.Value ?? "-";
//         const description = item.Description || '';
//         const tagDateKey = `${tagName}-${description}-${productionDate}`;

//         if (!aggregatedDataByTagDate[tagDateKey]) {
//             aggregatedDataByTagDate[tagDateKey] = {
//                 TagName: tagName,
//                 Description: description,
//                 ProductionDate: productionDate,
//             };
//         }

//         // Keep the first value encountered for each hour
//         if (!aggregatedDataByTagDate[tagDateKey][time]) {
//             aggregatedDataByTagDate[tagDateKey][time] = value;
//         }
//     });

//     const transformedArray = Object.values(aggregatedDataByTagDate);
//     return transformedArray;
// };

// // Helper function to filter transformed records by date range
// export const filterTransformedRecordsByDateRange = (transformedRecords, dateRange) => {
//     if (!dateRange.from) {
//         return transformedRecords; // Show all data when no start date is selected
//     }

//     const { from, to } = dateRange;
//     const formattedFromDate = format(new Date(from), "MM/dd/yy");
//     const formattedToDate = to ? format(new Date(to), "MM/dd/yy") : formattedFromDate;

//     return transformedRecords.filter(record => {
//         const recordDate = parse(record.ProductionDate, "MM/dd/yy", new Date());
//         if (!isValid(recordDate)) return false;

//         const fromDateObj = parse(formattedFromDate, "MM/dd/yy", new Date());
//         const toDateObj = parse(formattedToDate, "MM/dd/yy", new Date());

//         return recordDate >= fromDateObj && recordDate <= toDateObj;
//     });
// };

// export default useRecordStore;



import { format, startOfHour, parseISO, isValid, parse } from 'date-fns';
import { create } from 'zustand';

const timeSlotsArray = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'];

const tagMapping = {
    'Marampa_1C.A1241FIC043_PV': 'TSF Flow (m3/h)',
    'Marampa_1C.A1241DIC043_PV': 'TSF Density (t/m3)',
    'Marampa_1C.A1241PIT042_PV': 'TSF Pressure (kPa)',
    'Marampa_1B.A2251WQIT5114_TOT_HourLast': 'IB Concentrate Tonnes CV-06',
    'Marampa_1C.A1226WIT004_TOT_HourLast': '1C Concentrate Tonnes CV-19',
    'Marampa_1C.A1226WIT004_TOT_DayCurrent': 'Cumulative 1C Concentrate Tonnes CV-19',
    'Marampa_1B.A2251WQIT5114_TOT_DayCurrent': 'Cumulative 1B Concentrate Tonnes CV-06',
};

const useRecordStore = create((set, get) => ({
    records: [], // Original records
    transformedRecords: [], // Transformed data for the table
    timeSlots: timeSlotsArray, // Fixed array of time slots
    selectedDateRange: { from: null, to: null },

    setSelectedDateRange: (from, to) => set({ selectedDateRange: { from, to } }),

    // Update method to set original records and transform them
    setRecords: (records) => {
        const transformedData = transformData(records);
        set({ records, transformedRecords: transformedData });
    },

    // Clear method
    clearRecords: () => set({ records: [], transformedRecords: [], selectedDateRange: { from: null, to: null } }),
}));

// Helper function for safe date parsing
const safeParseDate = (dateString) => {
    try {
        return parseISO(dateString);
    } catch (error) {
        console.error("Error parsing date:", dateString, error);
        return null;
    }
};

// Transform data function (grouping by hour and then by TagName)
const transformData = (originalData) => {
    const aggregatedDataByTagDate = {};

    originalData.forEach((item) => {
        const date = item.DateTime instanceof Date ? item.DateTime : safeParseDate(item.DateTime);
        if (!date) return;
        const productionDate = format(date, "MM/dd/yy");
        const hourStart = startOfHour(date);
        const time = format(hourStart, "HH:00");
        const tagName = item.TagName || "";
        const tagDescription = tagMapping[tagName] || tagName; // Use mapped name or original if not found
        const value = item.Value ?? "-";
        // const description = item.Description || '';
        const tagDateKey = `${tagName}-${tagDescription}-${productionDate}`;
        // const tagDateKey = `${tagId}-${description}-${productionDate}`;

        if (!aggregatedDataByTagDate[tagDateKey]) {
            aggregatedDataByTagDate[tagDateKey] = {
                TagName: tagName,
                Description: tagDescription,
                ProductionDate: productionDate,
            };
        }

        // Keep the first value encountered for each hour
        if (!aggregatedDataByTagDate[tagDateKey][time]) {
            aggregatedDataByTagDate[tagDateKey][time] = value;
        }
    });

    const transformedArray = Object.values(aggregatedDataByTagDate);
    return transformedArray;
};

// Helper function to filter transformed records by date range
export const filterTransformedRecordsByDateRange = (transformedRecords, dateRange) => {
    if (!dateRange.from) {
        return transformedRecords; // Show all data when no start date is selected
    }

    const { from, to } = dateRange;
    const formattedFromDate = format(new Date(from), "MM/dd/yy");
    const formattedToDate = to ? format(new Date(to), "MM/dd/yy") : formattedFromDate;

    return transformedRecords.filter(record => {
        const recordDate = parse(record.ProductionDate, "MM/dd/yy", new Date());
        if (!isValid(recordDate)) return false;

        const fromDateObj = parse(formattedFromDate, "MM/dd/yy", new Date());
        const toDateObj = parse(formattedToDate, "MM/dd/yy", new Date());

        return recordDate >= fromDateObj && recordDate <= toDateObj;
    });
};

export default useRecordStore;




