// "use client";


// // Import modularized components and utilities
// import React, { useRef } from 'react';
// import { format, subDays, setHours, setMinutes } from 'date-fns';
// import { useFullscreen } from '@/hooks/useFullScreen';
// import { useChartData } from '@/hooks/useChartData';
// import ExportService from '@/services/ExportService';
// import { getLineColor } from '@/utils/formatter';
// import { ChartActionsMenu } from './ChartActionsMenu';
// import { LineChartComponent } from './LineChart';
// import { ChartLegend } from './ChartLegend';
// import { cn } from '@/lib/utils';


// const EngChart = ({ selectedTags, equipmentData, dateRange }) => {
//   const chartRef = useRef(null);
//   const chartContainerRef = useRef(null);
  
//   // Use provided dateRange if available, otherwise fall back to default
//   const productionDayEnd = dateRange?.to || setMinutes(setHours(new Date(), 6), 0); // 6:00 AM today
//   const productionDayStart = dateRange?.from || setMinutes(setHours(subDays(new Date(), 1), 7), 0); // 7:00 AM yesterday

//   // Calculate chart width based on data points
//   const hoursDifference = Math.max(1, Math.ceil((productionDayEnd - productionDayStart) / (60 * 60 * 1000)));
//   const chartWidth = Math.max(1200, hoursDifference * 80); // Minimum width of 1200px, or 80px per hour

//   // Use custom hooks
//   const { isFullscreen, toggleFullscreen } = useFullscreen(chartContainerRef);
//   const { dataToUse, midnightIndex } = useChartData(equipmentData, selectedTags, productionDayStart, productionDayEnd);

//   // Event handlers for chart actions
//   const handleExportData = () => {
//     ExportService.exportDataAsCSV(dataToUse, selectedTags);
//   };

//   const handleDownloadImage = () => {
//     ExportService.downloadAsImage(chartRef, productionDayStart, productionDayEnd, selectedTags, getLineColor);
//   };

//   const handlePrintChart = () => {
//     ExportService.printChart(chartRef, selectedTags, productionDayStart, productionDayEnd, getLineColor);
//   };

//   if (selectedTags.length === 0) {
//     return (
//       <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded p-4">
//         <p className="text-slate-400">Select tags to view performance data</p>
//       </div>
//     );
//   }

//   return (
//     <div 
//       className={`h-full w-full py-[5px] ${isFullscreen ? 'bg-white pt-[4rem] px-[1rem]' : ''}`} 
//       ref={chartContainerRef}
//     >
//       <div className={cn("flex justify-between items-center mb-[1rem] px-[1rem]", isFullscreen && 'px-[2rem] mb-[2rem]')}>
//         <h3 className={`font-medium ${isFullscreen ? 'text-[1.1rem font-semibold' : 'text-sm'}`}>
//           Production Day: {format(productionDayStart, "MMM dd")} 7:00 AM - {format(productionDayEnd, "MMM dd")} 6:00 AM
//         </h3>
        
//         {/* Legend tags summary */}
//         {/* <ChartLegend selectedTags={selectedTags} /> */}
        
//         {/* Actions dropdown */}
//         <ChartActionsMenu
//           onFullscreen={toggleFullscreen}
//           onExportData={handleExportData}
//           onDownloadImage={handleDownloadImage}
//           onPrintChart={handlePrintChart}
//         />
//       </div>
      
//       {/* Chart container with horizontal scrolling */}
//       <div className="w-full overflow-x-auto pb-4 pt-[1.5rem] bg-white">
//         <div 
//           style={{ width: `${chartWidth}px`, minWidth: '100%', height: '600px' }} 
//           ref={chartRef}
//           className="bg-white"
//         >
//           <LineChartComponent
//             data={dataToUse} 
//             midnightIndex={midnightIndex} 
//             selectedTags={selectedTags} 
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EngChart;




"use client";

// Import modularized components and utilities
import React, { useRef, useEffect, useState } from 'react';
import { format, subDays, setHours, setMinutes, addMinutes } from 'date-fns';
import { useFullscreen } from '@/hooks/useFullScreen';
import { useChartData } from '@/hooks/useChartData';
import ExportService from '@/services/ExportService';
import { getLineColor } from '@/utils/formatter';
import { ChartActionsMenu } from './ChartActionsMenu';
import { ChartLegend } from './ChartLegend';
import { cn } from '@/lib/utils';
import { LineChartComponent } from './LineChart';

const EngChart = ({ selectedTags, equipmentData, dateRange: propDateRange }) => {
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);
  const [productionDayStart, setProductionDayStart] = useState(null);
  const [productionDayEnd, setProductionDayEnd] = useState(null);

  useEffect(() => {
    if (propDateRange?.to) {
      // If a date is selected (the 'to' part of the range), calculate the start and end
      const selectedDate = new Date(propDateRange.to);
      const startDate = setMinutes(setHours(subDays(selectedDate, 1), 7), 0);
      const endDate = setMinutes(setHours(selectedDate, 6), 0);
      setProductionDayStart(startDate);
      setProductionDayEnd(endDate);
    } else {
      // Default to the last 23 hours (7 AM yesterday to 6 AM today)
      const endDate = setMinutes(setHours(new Date(), 6), 0);
      const startDate = setMinutes(setHours(subDays(new Date(), 1), 7), 0);
      setProductionDayStart(startDate);
      setProductionDayEnd(endDate);
    }
  }, [propDateRange]);

  // Calculate chart width based on the time difference (assuming 5-minute intervals)
  const minutesDifference = Math.max(1, Math.ceil((productionDayEnd?.getTime() - productionDayStart?.getTime()) / (60 * 1000)));
  const dataPoints = minutesDifference / 5 + 1; // +1 to include the start time
  const chartWidth = Math.max(1200, dataPoints * 10); // Adjust '10' based on desired width per data point

  // Use custom hooks
  const { isFullscreen, toggleFullscreen } = useFullscreen(chartContainerRef);
  const { dataToUse, midnightIndex } = useChartData(equipmentData, selectedTags, productionDayStart, productionDayEnd);

  // Event handlers for chart actions
  const handleExportData = () => {
    ExportService.exportDataAsCSV(dataToUse, selectedTags);
  };

  const handleDownloadImage = () => {
    ExportService.downloadAsImage(chartRef, productionDayStart, productionDayEnd, selectedTags, getLineColor);
  };

  const handlePrintChart = () => {
    ExportService.printChart(chartRef, selectedTags, productionDayStart, productionDayEnd, getLineColor);
  };

  if (!productionDayStart || !productionDayEnd) {
    return <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded p-4"><p className="text-slate-400">Loading chart...</p></div>;
  }

  if (selectedTags.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded p-4">
        <p className="text-slate-400">Select tags to view performance data</p>
      </div>
    );
  }

  return (
    <div
      className={`h-full w-full py-[5px] ${isFullscreen ? 'bg-white pt-[4rem] px-[1rem]' : ''}`}
      ref={chartContainerRef}
    >
      <div className={cn("flex justify-between items-center mb-[1rem] px-[1rem]", isFullscreen && 'px-[2rem] mb-[2rem]')}>
        <h3 className={`font-medium ${isFullscreen ? 'text-[1.1rem font-semibold' : 'text-sm'}`}>
          Production Day: {format(productionDayStart, "MMM dd hh:mm a")} - {format(productionDayEnd, "MMM dd hh:mm a")}
        </h3>

        {/* Actions dropdown */}
        <ChartActionsMenu
          onFullscreen={toggleFullscreen}
          onExportData={handleExportData}
          onDownloadImage={handleDownloadImage}
          onPrintChart={handlePrintChart}
        />
      </div>

      {/* Chart container with horizontal scrolling */}
      <div className="w-full overflow-x-auto pb-4 pt-[1.5rem] bg-white">
        <div
          style={{ width: `${chartWidth}px`, minWidth: '100%', height: '600px' }}
          ref={chartRef}
          className="bg-white"
        >
          <LineChartComponent
            data={dataToUse}
            midnightIndex={midnightIndex}
            selectedTags={selectedTags}
          />
        </div>
      </div>
    </div>
  );
};

export default EngChart;