// import { useMemo } from 'react';
// import { format, parseISO, addHours } from 'date-fns';

// export const useChartData = (equipmentData, selectedTags, productionDayStart, productionDayEnd) => {
//   // Prepare chart data for the production day
//   const chartData = useMemo(() => {
//     if (!equipmentData || !selectedTags || selectedTags.length === 0) {
//       return [];
//     }

//     // Create data structure to hold values for each tag at each hour
//     const tagDataByHour = {};
    
//     // Initialize hourly slots
//     let currentHour = new Date(productionDayStart);
//     while (currentHour <= productionDayEnd) {
//       const hourKey = format(currentHour, "yyyy-MM-dd'T'HH:00:00");
      
//       tagDataByHour[hourKey] = {
//         hour: hourKey,
//         hourFormatted: format(currentHour, "H:00"),
//         fullTime: format(currentHour, "MMM dd, H:00"),
//         daySection: currentHour.getHours() < 12 ? 'AM' : 'PM',
//         isNewDay: currentHour.getHours() === 0,
//       };
      
//       // Initialize tag values to null
//       selectedTags.forEach(tag => {
//         tagDataByHour[hourKey][tag] = null;
//       });
      
//       currentHour = addHours(currentHour, 1);
//     }

//     // Fill in actual data where available
//     equipmentData?.forEach(record => {
//       if (selectedTags.includes(record.TagName)) {
//         const recordTime = parseISO(record.DateTime);
        
//         // Only include data within the production day timeframe
//         if (recordTime >= productionDayStart && recordTime <= productionDayEnd) {
//           const hourKey = format(recordTime, "yyyy-MM-dd'T'HH:00:00");
//           if (tagDataByHour[hourKey]) {
//             tagDataByHour[hourKey][record.TagName] = record.Value;
//           }
//         }
//       }
//     });
    
//     // Convert to array and sort by hour
//     return Object.values(tagDataByHour).sort((a, b) => a.hour.localeCompare(b.hour));
//   }, [equipmentData, selectedTags, productionDayStart, productionDayEnd]);

//   // Generate sample trend data if no real data is available
//   const dataToUse = useMemo(() => {
//     if (chartData.length > 0 && selectedTags.length > 0) {
//       // Check if we have any actual values
//       const hasRealData = chartData.some(hourData => 
//         selectedTags.some(tag => hourData[tag] !== null)
//       );
      
//       if (hasRealData) return chartData;
//     }
    
//     // Generate realistic trend data
//     const sampleData = [];
//     let currentHour = new Date(productionDayStart);
    
//     // Create a starting value for each tag
//     const tagValues = {};
//     selectedTags.forEach((tag, index) => {
//       tagValues[tag] = 1000 * (index + 1);
//     });
    
//     while (currentHour <= productionDayEnd) {
//       const hourKey = format(currentHour, "yyyy-MM-dd'T'HH:00:00");
//       const hourData = {
//         hour: hourKey,
//         hourFormatted: format(currentHour, "H:00"),
//         fullTime: format(currentHour, "MMM dd, H:00"),
//         daySection: currentHour.getHours() < 12 ? 'AM' : 'PM',
//         isNewDay: currentHour.getHours() === 0,
//       };
      
//       // Update tag values to create trend patterns
//       selectedTags.forEach(tag => {
//         // Different patterns based on tag index
//         const tagIndex = selectedTags.indexOf(tag);
//         const hour = currentHour.getHours();
        
//         // Create different trend patterns for different tags
//         if (tagIndex % 3 === 0) {
//           // Sine wave pattern
//           const amplitude = tagValues[tag] * 0.3;
//           const period = 24;
//           const phase = tagIndex;
//           const offset = tagValues[tag];
//           hourData[tag] = offset + amplitude * Math.sin(2 * Math.PI * (hour + phase) / period);
//         } else if (tagIndex % 3 === 1) {
//           // Sawtooth pattern - increases during day, drops at night
//           const dayProgress = hour < 7 ? (hour + 24 - 7) / 24 : (hour - 7) / 24;
//           const sawtoothValue = dayProgress < 0.7 ? dayProgress / 0.7 : (1 - dayProgress) / 0.3;
//           hourData[tag] = tagValues[tag] * (0.7 + 0.3 * sawtoothValue);
//         } else {
//           // Random walk with trend
//           const trend = hour > 12 ? 0.05 : -0.02; // Trend up after noon, down before
//           const randomFactor = (Math.random() - 0.5) * 0.1;
//           tagValues[tag] = tagValues[tag] * (1 + trend + randomFactor);
//           hourData[tag] = tagValues[tag];
//         }
//       });
      
//       sampleData.push(hourData);
//       currentHour = addHours(currentHour, 1);
//     }
    
//     return sampleData;
//   }, [chartData, selectedTags, productionDayStart, productionDayEnd]);

//   // Find index where day changes (midnight)
//   const midnightIndex = dataToUse.findIndex(data => data.isNewDay);

//   return { dataToUse, midnightIndex };
// };

import { useMemo } from 'react';
import { format, parseISO, addMinutes } from 'date-fns';

export const useChartData = (equipmentData, selectedTags, productionDayStart, productionDayEnd) => {
  // Prepare chart data for the production day with 5-minute intervals
  const chartData = useMemo(() => {
    if (!equipmentData || !selectedTags || selectedTags.length === 0) {
      return [];
    }

    // Create data structure to hold values for each tag at each 5-minute interval
    const tagDataByInterval = {};
    
    // Initialize 5-minute slots from production day start to end
    let currentTime = new Date(productionDayStart);
    while (currentTime <= productionDayEnd) {
      const timeKey = format(currentTime, "yyyy-MM-dd'T'HH:mm:00");
      const hour = currentTime.getHours();
      const minute = currentTime.getMinutes();
      
      // Format to match your existing component's expectations
      const hourFormatted = `${hour}:${minute.toString().padStart(2, '0')}`;
      
      tagDataByInterval[timeKey] = {
        timeKey: timeKey,
        hourFormatted: hourFormatted,
        fullTime: format(currentTime, "MMM dd, h:mm a"),
        hour: hour,
        minute: minute,
        daySection: hour < 12 ? 'AM' : 'PM',
        isNewDay: hour === 0 && minute === 0,
      };
      
      // Initialize tag values to null
      selectedTags.forEach(tag => {
        tagDataByInterval[timeKey][tag] = null;
      });
      
      currentTime = addMinutes(currentTime, 5); // Increment by 5 minutes
    }

    // Fill in actual data where available
    equipmentData?.forEach(record => {
      if (selectedTags.includes(record.TagName)) {
        const recordTime = parseISO(record.DateTime);
        
        // Only include data within the production day timeframe
        if (recordTime >= productionDayStart && recordTime <= productionDayEnd) {
          // Round to nearest 5-minute interval
          const minutes = recordTime.getMinutes();
          const roundedMinutes = Math.round(minutes / 5) * 5;
          const roundedTime = new Date(recordTime);
          roundedTime.setMinutes(roundedMinutes);
          roundedTime.setSeconds(0);
          roundedTime.setMilliseconds(0);
          
          const timeKey = format(roundedTime, "yyyy-MM-dd'T'HH:mm:00");
          if (tagDataByInterval[timeKey]) {
            tagDataByInterval[timeKey][record.TagName] = record.Value;
          }
        }
      }
    });
    
    // Convert to array and sort by time
    return Object.values(tagDataByInterval).sort((a, b) => a.timeKey.localeCompare(b.timeKey));
  }, [equipmentData, selectedTags, productionDayStart, productionDayEnd]);

  // Generate sample trend data if no real data is available
  const dataToUse = useMemo(() => {
    if (chartData.length > 0 && selectedTags.length > 0) {
      // Check if we have any actual values
      const hasRealData = chartData.some(intervalData => 
        selectedTags.some(tag => intervalData[tag] !== null)
      );
      
      if (hasRealData) return chartData;
    }
    
    // Generate realistic trend data with 5-minute intervals
    const sampleData = [];
    let currentTime = new Date(productionDayStart);
    
    // Create a starting value for each tag
    const tagValues = {};
    selectedTags.forEach((tag, index) => {
      tagValues[tag] = 1000 * (index + 1);
    });
    
    while (currentTime <= productionDayEnd) {
      const timeKey = format(currentTime, "yyyy-MM-dd'T'HH:mm:00");
      const hour = currentTime.getHours();
      const minute = currentTime.getMinutes();
      
      const hourFormatted = `${hour}:${minute.toString().padStart(2, '0')}`;
      
      const intervalData = {
        timeKey: timeKey,
        hourFormatted: hourFormatted,
        fullTime: format(currentTime, "MMM dd, h:mm a"),
        hour: hour,
        minute: minute,
        daySection: hour < 12 ? 'AM' : 'PM',
        isNewDay: hour === 0 && minute === 0,
      };
      
      // Update tag values to create trend patterns
      selectedTags.forEach(tag => {
        // Different patterns based on tag index
        const tagIndex = selectedTags.indexOf(tag);
        const timeInMinutes = hour * 60 + minute;
        
        // Create different trend patterns for different tags, now with more granular changes
        if (tagIndex % 3 === 0) {
          // Sine wave pattern with more detail
          const amplitude = tagValues[tag] * 0.3;
          const period = 24 * 60; // Period in minutes (24 hours)
          const phase = tagIndex * 30; // Phase offset in minutes
          const offset = tagValues[tag];
          intervalData[tag] = offset + amplitude * Math.sin(2 * Math.PI * (timeInMinutes + phase) / period);
        } else if (tagIndex % 3 === 1) {
          // Sawtooth pattern - increases during day, drops at night
          const morningStart = 7 * 60; // 7:00 AM in minutes
          const timeOffset = timeInMinutes < morningStart ? (timeInMinutes + 24 * 60 - morningStart) : (timeInMinutes - morningStart);
          const dayProgress = timeOffset / (24 * 60);
          const sawtoothValue = dayProgress < 0.7 ? dayProgress / 0.7 : (1 - dayProgress) / 0.3;
          intervalData[tag] = tagValues[tag] * (0.7 + 0.3 * sawtoothValue);
        } else {
          // Random walk with trend
          const trend = hour > 12 ? 0.002 : -0.001; // Smaller trend for 5-min intervals
          const randomFactor = (Math.random() - 0.5) * 0.005; // Smaller random factor
          tagValues[tag] = tagValues[tag] * (1 + trend + randomFactor);
          intervalData[tag] = tagValues[tag];
        }
      });
      
      sampleData.push(intervalData);
      currentTime = addMinutes(currentTime, 5); // Increment by 5 minutes
    }
    
    return sampleData;
  }, [chartData, selectedTags, productionDayStart, productionDayEnd]);

  // Find index where day changes (midnight)
  const midnightIndex = dataToUse.findIndex(data => data.isNewDay);

  return { dataToUse, midnightIndex };
};