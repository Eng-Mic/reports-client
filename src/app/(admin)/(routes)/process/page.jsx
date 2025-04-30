// // "use client";

// // import React, { useState, useEffect, useMemo } from "react";
// // import { format, startOfHour, isWithinInterval, parse } from "date-fns";
// // import { useGetRecords } from "@/hooks/useRecords";
// // import { DateRangePicker } from "../../_components/DateRangePicker";
// // import useRecordStore from "@/store/recordsStore";

// // // Helper function to calculate date range based on selected dates
// // const calculateDateRange = (fromDate, toDate) => {
// //   if (!fromDate) return { start: null, end: null };

// //   const effectiveToDate = toDate || fromDate;

// //   const normalizedFromDate = fromDate instanceof Date ? fromDate : new Date(fromDate);
// //   const normalizedToDate = effectiveToDate instanceof Date ? effectiveToDate : new Date(effectiveToDate);

// //   // Set start range to 7:00 AM on the previous day of the selected 'from' date (Sierra Leone time)
// //   const startOfRangeSL = new Date(normalizedFromDate);
// //   startOfRangeSL.setDate(startOfRangeSL.getDate() - 1);
// //   startOfRangeSL.setHours(7, 0, 0, 0);
// //   startOfRangeSL.setMinutes(0, 0, 0, 0);

// //   // Set end range to 6:00 AM on the selected 'to' date (Sierra Leone time)
// //   const endOfRangeSL = new Date(normalizedToDate);
// //   endOfRangeSL.setHours(6, 0, 0, 0);
// //   endOfRangeSL.setMinutes(0, 0, 0, 0);

// //   return {
// //       start: startOfRangeSL,
// //       end: endOfRangeSL
// //   };
// // };

// // export default function Dashboard() {
// //   const [selectedDateRange, setSelectedDateRange] = useState({
// //     from: null,
// //     to: null,
// //   });
// //   const [productionDateRange, setProductionDateRange] = useState({
// //     from: null,
// //     to: null,
// //   });

// //   // Use Zustand store to get transformed records and unique tags
// //   const { transformedRecords, uniqueTags } = useRecordStore();
// //   const { data, isLoading, error } = useGetRecords();

// //   // More robust date range calculation
// //   useEffect(() => {
// //     const range = calculateDateRange(selectedDateRange.from, selectedDateRange.to);
// //     setProductionDateRange(range);

// //     console.group('Date Range Calculation');
// //     console.log('Selected Date Range:', selectedDateRange);
// //     console.log('Calculated Production Date Range:', range);
// //     console.groupEnd();
// //   }, [selectedDateRange]);


// //   console.log("Transformed Records for Debugging:", transformedRecords);

// //   const filteredData = useMemo(() => {
// //     const { start, end } = productionDateRange;

// //     console.log("productionDateRange (UTC):", {
// //         start: start ? start.toISOString() : null,
// //         end: end ? end.toISOString() : null,
// //     });

// //     if (!start || !end) {
// //         return transformedRecords;
// //     }

// //     const filtered = transformedRecords.filter((item) => {
// //         const dateTimeString = `${item.productionDate} ${item.time}`;
// //         const itemDate = parse(dateTimeString, "MM/dd/yy HH:mm", new Date());
// //         console.log("Parsed itemDate (UTC):", itemDate.toISOString(), "Original:", dateTimeString);

// //         const isInRange = isWithinInterval(itemDate.toISOString(), { start, end });
// //         console.log("isInRange:", isInRange);
// //         return isInRange;
// //     });
// //     return filtered;
// // }, [transformedRecords, productionDateRange]);


// //   const handleDateRangeSelect = (from, to) => {
// //     console.log('Date Range Selected:', { from, to });
// //     setSelectedDateRange({ from, to });
// //   };

// //   const columns = [
// //     { key: "productionDate", label: "Production Date" },
// //     { key: "time", label: "Time" },
// //     ...uniqueTags.map((tag) => ({ key: tag, label: tag })),
// //   ];

// //   return (
// //     <div className="container mx-auto pt-4">
// //       <div className="w-full mb-[1rem] flex justify-between items-center border-b-[1px] pb-[10px]">
// //         <h1 className="text-2xl font-bold">Hourly Report</h1>
// //         <div className="flex items-center space-x-4">
// //           <label className="mr-2">Select Production Date:</label>
// //           <DateRangePicker onChange={handleDateRangeSelect} className="w-[250px]" />
// //         </div>
// //       </div>

// //       {error && <div className="text-red-500">Error: {error.message}</div>}
// //       {isLoading && <div>Loading data...</div>}

// //       {selectedDateRange.from && productionDateRange.start && productionDateRange.end && (
// //         <div className="mt-2">
// //           <p>
// //             Showing data from {format(productionDateRange.start, "MM/dd/yy HH:00")} to{" "}
// //             {format(productionDateRange.end, "MM/dd/yy HH:00")}
// //           </p>
// //         </div>
// //       )}

// //       {filteredData.length > 0 ? (
// //         <div className="min-w-full overflow-x-scroll">
// //           <div 
// //             className="min-w-full grid capitalize font-medium text-[1rem] mt-12 border-b-[1px] border-zinc-400 pb-[10px]"
// //             style={{ 
// //               gridTemplateColumns: `repeat(3, minmax(100px, 1fr)) repeat(${uniqueTags.length}, minmax(180px, 1fr))`,
// //               columnGap: '0px',
// //               gap: '8rem' 
// //             }}
// //           >
// //             {columns.map((column, index) => (
// //               <div 
// //                 key={index} 
// //                 className="w-fit relative cursor-pointer whitespace-nowrap"
// //                 style={{
// //                   ...(index < 3 ? { gap: '2rem' } : { gap: '8rem', marginLeft: '5rem' })
// //                 }}
// //               >
// //                 <h2 className="flex items-center justify-between">{column.label}</h2>
// //               </div>
// //             ))}
// //           </div>

// //           <div className="min-w-full hourly_data mt-2 pb-[15px] h-[40rem] overflow-x-scroll">
// //             {filteredData.map((item, rowIndex) => (
// //               <div
// //                 key={rowIndex}
// //                 className="min-w-full grid capitalize font-medium text-[12px] px-1 mt-4 border-b-[1px] pb-[10px]"
// //                 style={{ 
// //                   gridTemplateColumns: `repeat(3, minmax(100px, 1fr)) repeat(${uniqueTags.length}, minmax(180px, 1fr))`,
// //                   columnGap: '0px',
// //                   gap: '8rem'
// //                 }}
// //               >
// //                 {columns.map((column, colIndex) => (
// //                   <div 
// //                     key={`${rowIndex}-${colIndex}`} 
// //                     className={`whitespace-nowrap text-ellipsis ${colIndex < 3 ? 'text-left' : 'text-right'}`}
// //                     style={{
// //                       ...(colIndex < 3 ? { gap: '2rem' } : { gap: '8rem', marginLeft: '5rem' })
// //                     }}
// //                   >
// //                     {item[column.key] !== undefined ? item[column.key] : "-"}
// //                   </div>
// //                 ))}
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       ) : (
// //         <div>No data available for the selected date range.</div>
// //       )}
// //     </div>
// //   );
// // }










// "use client";

// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { format, isWithinInterval, parse } from "date-fns";
// import { useGetRecords } from "@/hooks/useRecords";
// import { DateRangePicker } from "../../_components/DateRangePicker";
// import useRecordStore from "@/store/recordsStore";

// const calculateDateRange = (fromDate, toDate) => {
//     if (!fromDate) return { start: null, end: null };
//     const effectiveToDate = toDate || fromDate;
//     const normalizedFromDate = fromDate instanceof Date ? fromDate : new Date(fromDate);
//     const normalizedToDate = effectiveToDate instanceof Date ? effectiveToDate : new Date(effectiveToDate);
//     const startOfRangeSL = new Date(normalizedFromDate);
//     startOfRangeSL.setDate(startOfRangeSL.getDate() - 1);
//     startOfRangeSL.setHours(7, 0, 0, 0);
//     startOfRangeSL.setMinutes(0, 0, 0, 0);
//     const endOfRangeSL = new Date(normalizedToDate);
//     endOfRangeSL.setHours(6, 0, 0, 0);
//     endOfRangeSL.setMinutes(0, 0, 0, 0);
//     return { start: startOfRangeSL, end: endOfRangeSL };
// };

// export default function Dashboard() {
//     const [selectedDateRange, setSelectedDateRange] = useState({ from: null, to: null });
//     const [productionDateRange, setProductionDateRange] = useState({ from: null, to: null });
//     const tableBodyRef = useRef(null);

//     const { transformedRecords, uniqueTags } = useRecordStore();
//     const { data, isLoading, error } = useGetRecords();

//     useEffect(() => {
//         const range = calculateDateRange(selectedDateRange.from, selectedDateRange.to);
//         setProductionDateRange(range);
//     }, [selectedDateRange]);

//     const filteredData = useMemo(() => {
//         const { start, end } = productionDateRange;
//         if (!start || !end) return transformedRecords;
//         return transformedRecords.filter((item) => {
//             const dateTimeString = `${item.productionDate} ${item.time}`;
//             const itemDate = parse(dateTimeString, "MM/dd/yy HH:mm", new Date());
//             return isWithinInterval(itemDate, { start, end });
//         });
//     }, [transformedRecords, productionDateRange]);

//     const handleDateRangeSelect = (from, to) => {
//         setSelectedDateRange({ from, to });
//     };

//     const columns = useMemo(() => {
//         return [
//             { key: "productionDate", label: "Production Date" },
//             { key: "time", label: "Time" },
//             ...uniqueTags.map((tag) => ({ key: tag, label: tag })),
//         ];
//     }, [uniqueTags]);

//     return (
//         <div className="container mx-auto pt-4">
//             <div className="w-full mb-[1rem] flex justify-between items-center border-b-[1px] pb-[10px]">
//                 <h1 className="text-2xl font-bold">Hourly Report</h1>
//                 <div className="flex items-center space-x-4">
//                     <label className="mr-2">Select Production Date:</label>
//                     <DateRangePicker onChange={handleDateRangeSelect} className="w-[250px]" />
//                 </div>
//             </div>

//             {error && <div className="text-red-500">Error: {error.message}</div>}
//             {isLoading && <div>Loading data...</div>}

//             {selectedDateRange.from && productionDateRange.start && productionDateRange.end && (
//                 <div className="mt-2">
//                     <p>
//                         Showing data from {format(productionDateRange.start, "MM/dd/yy HH:00")} to{" "}
//                         {format(productionDateRange.end, "MM/dd/yy HH:00")}
//                     </p>
//                 </div>
//             )}

//             {filteredData.length > 0 ? (
//                 <div className="min-w-full relative">
//                     <div className="max-h-[75vh] overflow-y-auto">
//                         <table className="table-auto border-collapse min-w-full">
//                             <thead className="bg-gray-100 border-b-[1px] border-zinc-400 sticky top-0 z-10">
//                                 <tr>
//                                     {columns.map((column) => (
//                                         <th
//                                             key={column.key}
//                                             className="px-[1rem] py-[12px] text-left text-[0.9rem] font-semibold text-gray-700 min-w-[15rem] sticky top-0 z-10 bg-gray-100"
//                                         >
//                                             <div className="flex items-center justify-between">
//                                                 {column.label}
//                                             </div>
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody ref={tableBodyRef} className="table-row-group">
//                                 {filteredData.map((item, rowIndex) => (
//                                     <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}>
//                                         {columns.map((column) => (
//                                             <td key={`${rowIndex}-${column.key}`} className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap">
//                                                 {item[column.key] !== undefined ? item[column.key] : "-"}
//                                             </td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             ) : (
//                 <div>{!isLoading && "No data available."}</div>
//             )}
//         </div>
//     );
// }




// // page.jsx (or your Dashboard component file)
// "use client";

// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { format, parse, isValid } from "date-fns";
// import { useGetRecords } from "@/hooks/useRecords";
// import { DateRangePicker } from "../../_components/DateRangePicker";
// import useRecordStore, { filterTransformedRecordsByDateRange } from "@/store/recordsStore";

// export default function Dashboard() {
//   const [selectedDateRange, setSelectedDateRange] = useState({ from: null, to: null });
//   const { transformedRecords, timeSlots, setSelectedDateRange: storeSetSelectedDateRange } = useRecordStore();
//   const { data, isLoading, error } = useGetRecords();
//   const tableBodyRef = useRef(null);
//   const tableContainerRef = useRef(null);
//   const [sortColumn, setSortColumn] = useState('ProductionDate'); // Initialize sortColumn
//   const [sortOrder, setSortOrder] = useState('asc'); // Default sort order

//   useEffect(() => {
//       if (data && Array.isArray(data)) {
//           useRecordStore.getState().setRecords(data);
//       }
//   }, [data]);

//   const handleDateRangeSelect = (from, to) => {
//       setSelectedDateRange({ from, to });
//       storeSetSelectedDateRange(from, to); // Update the store
//   };

//   const filteredData = useMemo(() => {
//       return filterTransformedRecordsByDateRange(transformedRecords, selectedDateRange);
//   }, [transformedRecords, selectedDateRange]);

//   const handleSort = (columnKey) => {
//     if (columnKey === sortColumn) {
//       setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortColumn(columnKey);
//       setSortOrder('asc'); // Default to ascending when a new column is clicked
//     }
//   };

//   const columns = useMemo(() => {
//       return [
//           { key: "TagName", label: "Tag Name" },
//           { key: "Description", label: "Description" },
//           { key: "ProductionDate", label: "Production Date" },
//           ...timeSlots.map((slot) => ({ key: slot, label: slot })),
//       ];
//   }, [timeSlots]);

//   const timeSpannedData = useMemo(() => {
//     if (!timeSlots.length || !filteredData) return [];

//     const sortedData = [...filteredData]; // Create a copy

//     if (sortColumn === 'ProductionDate') {
//       sortedData.sort((a, b) => {
//         const dateA = parse(a.ProductionDate, 'MM/dd/yy', new Date());
//         const dateB = parse(b.ProductionDate, 'MM/dd/yy', new Date());

//         if (!isValid(dateA) || !isValid(dateB)) {
//           return 0; // Handle invalid dates
//         }

//         return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
//       });
//     } else if (sortColumn) {
//       sortedData.sort((a, b) => {
//         const valueA = a[sortColumn];
//         const valueB = b[sortColumn];

//         if (valueA === undefined) return sortOrder === 'asc' ? 1 : -1;
//         if (valueB === undefined) return sortOrder === 'asc' ? -1 : 1;

//         let comparison = 0;
//         if (typeof valueA === 'string' && typeof valueB === 'string') {
//           comparison = valueA.localeCompare(valueB);
//         } else if (typeof valueA === 'number' && typeof valueB === 'number') {
//           comparison = valueA - valueB;
//         } else {
//           comparison = String(valueA).localeCompare(String(valueB));
//         }

//         return sortOrder === 'asc' ? comparison : comparison * -1;
//       });
//     }

//     return sortedData.map(record => {
//       const row = {
//         TagName: record.TagName,
//         Description: record.Description,
//         ProductionDate: record.ProductionDate,
//         ...record, // Hourly values will be directly on the record
//       };
//       return row;
//     });
//   }, [filteredData, timeSlots, sortColumn, sortOrder]);

//   return (
//     <div className="container mx-auto pt-4">
//       {/* Header and DateRangePicker remain the same */}
//       <div className="w-full mb-[1rem] flex justify-between items-center border-b-[1px] pb-[10px]">
//         <h1 className="text-2xl font-bold">Hourly Report</h1>
//         <div className="flex items-center space-x-4">
//             <label className="mr-2">Select Production Date Range:</label>
//             <DateRangePicker onChange={handleDateRangeSelect} className="w-[250px]" />
//         </div>
//       </div>

//       {error && <div className="text-red-500">Error: {error.message}</div>}
//       {isLoading && <div>Loading data...</div>}

//       {selectedDateRange.from && (
//         <div className="mt-2">
//           <p>
//               Showing data from {format(new Date(selectedDateRange.from), "yyyy-MM-dd")}
//               {selectedDateRange.to && ` to ${format(new Date(selectedDateRange.to), "yyyy-MM-dd")}`}
//           </p>
//         </div>
//       )}

//     {timeSpannedData.length > 0 && timeSlots.length > 0 ? (
//         <div className="min-w-full overflow-x-auto relative">
//           <div className="max-h-[75vh] overflow-y-auto">
//             <table className="table-auto border-collapse min-w-full">
//               <thead className="bg-gray-100 border-b-[1px] border-zinc-300 sticky top-0 z-10 table-header-group">
//                 <tr>
//                   {columns.map((column) => (
//                     <th
//                       key={column.key}
//                       className={`px-[1rem] py-[12px] text-left text-[0.9rem] font-semibold text-gray-700 min-w-[15rem] sticky top-0 z-10 bg-gray-100 cursor-pointer ${sortColumn === column.key ? 'font-bold' : ''}`}
//                       onClick={() => handleSort(column.key)}
//                     >
//                       <div className="flex items-center">
//                         {column.label}
//                         {sortColumn === column.key && (
//                           <span className="ml-2">
//                             {sortOrder === 'asc' ? '▲' : '▼'}
//                           </span>
//                         )}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody ref={tableBodyRef} className="table-row-group">
//                 {timeSpannedData.map((item, rowIndex) => (
//                   <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}>
//                     {columns.map((column) => (
//                       <td key={`${rowIndex}-${column.key}`} className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap">
//                         {item[column.key] !== undefined ? item[column.key] : '-'}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//     ) : (
//         <div>{!isLoading && "No data available."}</div>
//     )}
//     </div>
//   );
// }





"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { format, parse, isValid } from "date-fns";
import { useGetRecords } from "@/hooks/useRecords";
import { DateRangePicker } from "../../_components/DateRangePicker";
import useRecordStore, { filterTransformedRecordsByDateRange } from "@/store/recordsStore";

export default function Dashboard() {
    const [selectedDateRange, setSelectedDateRange] = useState({ from: null, to: null });
    const { transformedRecords, timeSlots, setSelectedDateRange: storeSetSelectedDateRange } = useRecordStore();
    const { data, isLoading, error } = useGetRecords();
    const tableBodyRef = useRef(null);
    const tableContainerRef = useRef(null);

    useEffect(() => {
        if (data && Array.isArray(data)) {
            useRecordStore.getState().setRecords(data);
        }
    }, [data]);

    const handleDateRangeSelect = (from, to) => {
        setSelectedDateRange({ from, to });
        storeSetSelectedDateRange(from, to); // Update the store
    };

    const filteredData = useMemo(() => {
        return filterTransformedRecordsByDateRange(transformedRecords, selectedDateRange);
    }, [transformedRecords, selectedDateRange]);

    const columns = useMemo(() => {
        return [
            { key: "TagName", label: "Tag Name" },
            { key: "Description", label: "Description" },
            { key: "ProductionDate", label: "Production Date" },
            ...timeSlots.map((slot) => ({ key: slot, label: slot })),
        ];
    }, [timeSlots]);

    const dailyDataWithTotal = useMemo(() => {
        if (!filteredData) return [];
    
        const groupedByDate = {};
        filteredData.forEach(item => {
            let groupingDate = item.ProductionDate;
    
            if (item.TagName === 'Marampa_1C.A1226WIT004_TOT_DayCurrent' || item.TagName === 'Marampa_1B.A2251WQIT5114_TOT_DayCurrent') {
                const parsedDate = parse(item.ProductionDate, 'MM/dd/yy', new Date());
                if (isValid(parsedDate)) {
                    const previousDay = new Date(parsedDate);
                    previousDay.setDate(previousDay.getDate() - 1);
                    groupingDate = format(previousDay, 'MM/dd/yy');
                }
            }
    
            if (!groupedByDate[groupingDate]) {
                groupedByDate[groupingDate] = [];
            }
            groupedByDate[groupingDate].push(item);
        });
    
        return Object.entries(groupedByDate).flatMap(([date, items]) => {
            console.log("items: ", items);
    
            const record1C = items.find(i => i.TagName === 'Marampa_1C.A1226WIT004_TOT_DayCurrent');
            const recordIB = items.find(i => i.TagName === 'Marampa_1B.A2251WQIT5114_TOT_DayCurrent');
    
            console.log("record1C: ", record1C);
            console.log("recordIB: ", recordIB);
    
            // Access the value from the '06:00' property
            const cumulative1C = record1C?.['06:00'];
            const cumulativeIB = recordIB?.['06:00'];
            const totalConcentrate =
                cumulative1C !== undefined && cumulativeIB !== undefined
                    ? parseFloat(cumulative1C) + parseFloat(cumulativeIB)
                    : null;
    
            console.log(`cumulative1C: ${cumulative1C}, cumulativeIB ${cumulativeIB}`);
            console.log(`Date: ${date}, Total Concentrate: ${totalConcentrate}`);
            console.log(`Items for ${date}:`, items);
    
            return [
                ...items,
                {
                    'TagName': 'Total Concentrate',
                    'Description': 'Total Concentrate (7:00 AM Previous Day to 6:00 AM Today)',
                    'ProductionDate': date,
                    ...Object.fromEntries(timeSlots.map(slot => [slot, null])),
                    'Total Concentrate': totalConcentrate !== null ? totalConcentrate.toFixed(2) : 'Data not available',
                },
            ];
        });
    }, [filteredData, timeSlots]);

    return (
        <div className="container mx-auto pt-4">
            <div className="w-full mb-[1rem] flex justify-between items-center border-b-[1px] pb-[10px]">
                <h1 className="text-2xl font-bold">Hourly Report</h1>
                <div className="flex items-center space-x-4">
                    <label className="mr-2">Select Production Date Range:</label>
                    <DateRangePicker onChange={handleDateRangeSelect} className="w-[250px]" />
                </div>
            </div>

            {error && <div className="text-red-500">Error: {error.message}</div>}
            {isLoading && <div>Loading data...</div>}

            {selectedDateRange.from && (
                <div className="mt-2">
                    <p>
                        Showing data from {format(new Date(selectedDateRange.from), "yyyy-MM-dd")}
                        {selectedDateRange.to && ` to ${format(new Date(selectedDateRange.to), "yyyy-MM-dd")}`}
                    </p>
                </div>
            )}

            {dailyDataWithTotal.length > 0 && timeSlots.length > 0 ? (
                <div className="min-w-full overflow-x-auto relative">
                    <div className="max-h-[75vh] overflow-y-auto">
                        <table className="table-auto border-collapse min-w-full">
                            <thead className="bg-gray-100 border-b-[1px] border-zinc-300 sticky top-0 z-10 table-header-group">
                                <tr>
                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            className={`px-[1rem] py-[12px] text-left text-[0.9rem] font-semibold text-gray-700 min-w-[15rem] sticky top-0 z-10 bg-gray-100`}
                                        >
                                            <div className="flex items-center">
                                                {column.label}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-[1rem] py-[12px] text-left text-[0.9rem] font-semibold text-gray-700 min-w-[15rem] sticky top-0 z-10 bg-gray-100">
                                        Total Concentrate
                                    </th>
                                </tr>
                            </thead>
                            <tbody ref={tableBodyRef} className="table-row-group">
                                {dailyDataWithTotal.map((item, rowIndex) => (
                                    <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}>
                                        {columns.map((column) => (
                                            <td key={`${rowIndex}-${column.key}`} className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap">
                                                {item[column.key] !== undefined ? item[column.key] : '-'}
                                            </td>
                                        ))}
                                        <td className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap">
                                            {item['Total Concentrate']}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div>{!isLoading && "No data available."}</div>
            )}
        </div>
    );
}