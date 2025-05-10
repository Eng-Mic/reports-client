"use client"

import React, { useMemo } from 'react'

const TaskTable = ({ tasks, isLoading, dateRange, complianceFilter }) => {

    // console.log("Tasks in TaskTable:", tasks, "isLoading:", isLoading, "dateRange:", dateRange, "complianceFilter:", complianceFilter);
    
    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        
        let filtered = tasks;
        
        // Date range filtering
        if (dateRange) {
            filtered = filtered.filter(task => {
                const taskDate = new Date(task.dueDate);
                const extendedFromDate = new Date(dateRange.from);
                extendedFromDate.setDate(extendedFromDate.getDate() - 1);
                return taskDate >= extendedFromDate && taskDate <= dateRange.to;
            });
        }
        
        // Compliance type filtering
        if (complianceFilter === 'Preventive') {
            filtered = filtered.filter(task => task.taskType === 'Preventative Maintenance (PM)');
        } else if (complianceFilter === 'Corrective') {
            filtered = filtered.filter(task => task.taskType !== 'Preventative Maintenance (PM)');
        } else if (complianceFilter === 'Performance') {
            filtered = filtered.filter(task => task.description.toLowerCase().includes("@downtime"));
        } else if (complianceFilter === 'Breakdown') {
            filtered = filtered.filter(task => task.description.toLowerCase().includes("@downtime"));
        }
        
        return filtered;
    }, [tasks, dateRange, complianceFilter]);

  return (
    <div>
        {filteredTasks.length > 0 ? (
            <div className="min-w-full overflow-x-auto relative">
                <div className="max-h-[75vh] overflow-y-auto">
                    <table className="table-auto border-collapse min-w-full">
                        <thead className="bg-gray-100 border-b-[1px] border-zinc-300 sticky top-0 z-10 table-header-group">
                            <tr>
                                {["TaskName", "Asset Name", "Expense Class", "Status", "Due Date", "Downtime", "description", "time spent", "Completion Notes"]?.map((column, index) => (
                                    <th
                                        key={index}
                                        className={`px-[1rem] py-[12px] text-left text-[0.9rem] font-semibold text-gray-700 min-w-[15rem] sticky top-0 z-10 bg-gray-100`}
                                    >
                                        <div className="flex items-center">
                                            {column}
                                        </div>
                                    </th>
                                ))}
                                
                            </tr>
                        </thead>
                        <tbody className="table-row-group">
                            {filteredTasks.map((task, rowIndex) => (
                                <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}>
                                    <td className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap 2xl:whitespace-pre-wrap">{task.taskName}</td>
                                    <td className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap">{task.assetName}</td>
                                    <td className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap">{task.expenseClass}</td>
                                    <td className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap">{task.status}</td>
                                    <td className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap">{task.dueDate}</td>
                                    <td className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap">{task.downtime}</td>
                                    <td className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap">{task.description}</td>
                                    <td className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap">{task.estimatedTime}</td>
                                    <td className="px-[1rem] py-[1rem] text-sm text-gray-700 whitespace-nowrap">{task.completionNotes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className='w-full flex justify-center items-center my-[10px]'>{!isLoading && "No data available."}</div>
        )}
    </div>
  )
}

export default TaskTable