"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { Check, ChevronsUpDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';

import { TrendingUp } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import BarChartExpenseClass from './BarChartExpenseClass';
import Breakdown from './Breakdown';
import EquipmentAvailability from './Availability';


const chartConfig = {
    completed: {
        label: "Completed",
        color: "#2563eb",
    },
    scheduled: {
        label: "Scheduled",
        color: "#60a5fa",
    },
    emptyValue: {
        label: "No Tasks",
        color: "#ef4444", // Red color (tailwind red-500)
    }
}

// Define this outside the component since it never changes
const scheduledStatuses = ["Open", "In Progress", "On-Hold For Parts", "Scheduled", "On-Hold For Labor", "On-Hold For Resources"];

const Compliance = ({ tasks, isLoading, dateRange, onComplianceChange }) => {
    const [open, setOpen] = useState(false);
    const [selectedCompliance, setSelectedCompliance] = useState('all');
    const [chartData, setChartData] = useState([{ completed: 0, scheduled: 0, completedPercentage: 0, scheduledPercentage: 0 }]);

    // console.log("selectedCompliance", selectedCompliance);
    

    // console.log("dateRange", dateRange);
    // console.log("tasks --", tasks);
    
    
    

    // Use useMemo to memoize filteredTasks so it only recalculates when needed
    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        
        // First filter by date range if available
        let filtered = tasks;
        if (dateRange) {
            filtered = filtered.filter(task => {
                const taskDate = new Date(task.dueDate);
                const extendedFromDate = new Date(dateRange.from);
                extendedFromDate.setDate(extendedFromDate.getDate() - 1);
                return taskDate >= extendedFromDate && taskDate <= dateRange.to;
            });
        }
        
        // Then filter by compliance type if not "all"
        if (selectedCompliance === 'Preventive') {
            filtered = filtered.filter(task => task.taskType === 'Preventative Maintenance (PM)');
        } else if (selectedCompliance === 'Corrective') {
            filtered = filtered.filter(task => task.taskType !== 'Preventative Maintenance (PM)');
        }
        
        return filtered;
    }, [tasks, dateRange, selectedCompliance]);

    // console.log("Filtered Tasks Compliance:", filteredTasks);
    

    useEffect(() => {
        if (filteredTasks && filteredTasks.length > 0) {
            const completedTasks = filteredTasks.filter(task => task.status?.includes("Completed"));
            const scheduledTasks = filteredTasks.filter(task =>
                scheduledStatuses.some(status => task.status?.includes(status))
            );

            const totalTasks = filteredTasks.length;
            const completedCount = completedTasks.length;
            const scheduledCount = scheduledTasks.length;

            const completedPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
            const scheduledPercentage = totalTasks > 0 ? (scheduledCount / totalTasks) * 100 : 0;

            setChartData([{
                completed: completedCount,
                scheduled: scheduledCount,
                completedPercentage: completedPercentage,
                scheduledPercentage: scheduledPercentage,
            }]);
        } else {
            setChartData([{ completed: 0, scheduled: 0, completedPercentage: 0, scheduledPercentage: 0,  emptyValue: 100 }]);
        }
    }, [filteredTasks]); // Only depend on filteredTasks which is now memoized

    const toggleCompliance = (tag) => {
        const newValue = selectedCompliance === tag ? "all" : tag;
        setSelectedCompliance(newValue);
        // Pass the value up to the parent component
        if (onComplianceChange) {
            onComplianceChange(newValue);
        }
    };

    const totalWO = chartData[0]?.completed + chartData[0]?.scheduled || 0;

    const getCountByStatus = (status) =>
        filteredTasks?.filter((task) => task.status?.includes(status)).length || 0;

    // console.log("getCountByStatus", getCountByStatus("Completed"));
    

    return (
        <div className='bg-[#f8f8f8] rounded-md border overflow-hidden relative'>
            {isLoading ? (
                <div className="w-full py-12 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between px-4 py-[5px] border-b sticky top-0 z-10">
                        <h2 className="text-[16px] font-semibold">
                            {selectedCompliance === "Breakdown" ? "Breakdown" : selectedCompliance === "Performance" ? "Performance" : "Compliance"}
                        </h2>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[250px] justify-between",
                                        selectedCompliance?.length > 0 && "min-w-fit"
                                    )}
                                    role="combobox"
                                    aria-expanded={open}
                                >
                                    {selectedCompliance !== 'all' ? (
                                        selectedCompliance
                                    ) : (
                                        "Select compliance"
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="min-w-fit p-0">
                                <Command>
                                    <CommandInput placeholder="Search compliance..." />
                                    <CommandList>
                                        {["Preventive", "Corrective", "Breakdown", "Performance"].map((tag, index) => (
                                            <CommandItem
                                                key={index}
                                                onSelect={() => toggleCompliance(tag)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedCompliance.includes(tag) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {tag}
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="p-[5px]">
                        <div className="w-full h-full bg-white rounded-md overflow-y-scroll 2xl:min-h-[37.5rem]">
                            {selectedCompliance === 'Breakdown' ? (
                                <Breakdown
                                    tasks={filteredTasks}
                                    dateRange={dateRange}
                                />
                            ) : selectedCompliance === "Performance" ? (
                                
                                <EquipmentAvailability 
                                    tasks={filteredTasks} 
                                    dateRange={dateRange}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col justify-center p-[1rem] relative">
                                    <div className="w-full flex flex-col justify-center items-center pb-0 mb-[1rem]">
                                        <h2 className='flex items-center gap-2 text-[1.25rem] font-bold'>
                                            <ShieldCheck  size={18} className="text-green-500" />
                                            {selectedCompliance === "all" ? "Overall" : selectedCompliance } Compliance
                                        </h2>
                                        <p className='text-[12px] text-zinc-500'>
                                            {dateRange?.from && dateRange?.to ? (
                                                `${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`
                                            ) : (
                                                'Select a date range'
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex flex-1 items-center pb-0 md:min-h-[12.5rem] overflow-hidden">
                                        <ChartContainer
                                            config={chartConfig}
                                            className="mx-auto w-full"
                                        >
                                            {totalWO > 0 ? (
                                                <RadialBarChart
                                                    data={chartData}
                                                    endAngle={180}
                                                    innerRadius={80}
                                                    outerRadius={130}
                                                >
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={<ChartTooltipContent hideLabel />}
                                                    />
                                                    <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                                        <Label
                                                            content={({ viewBox }) => {
                                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                                    return (
                                                                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                                                            <tspan
                                                                                x={viewBox.cx}
                                                                                y={(viewBox.cy || 0) - 16}
                                                                                className="fill-foreground text-[1.5rem] font-bold"
                                                                            >
                                                                                {totalWO.toLocaleString()}
                                                                            </tspan>
                                                                            <tspan
                                                                                x={viewBox.cx}
                                                                                y={(viewBox.cy || 0) + 4}
                                                                                className="text-[13px] pt-[10px] fill-muted-foreground"
                                                                            >
                                                                                Total Tasks
                                                                            </tspan>
                                                                        </text>
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                    </PolarRadiusAxis>
                                                    <RadialBar
                                                        dataKey="completed"
                                                        stackId="a"
                                                        cornerRadius={5}
                                                        fill="var(--color-completed)"
                                                        className="stroke-transparent stroke-2"
                                                    />
                                                    <RadialBar
                                                        dataKey="scheduled"
                                                        fill="var(--color-scheduled)"
                                                        stackId="a"
                                                        cornerRadius={5}
                                                        className="stroke-transparent stroke-2"
                                                    />
                                                </RadialBarChart>
                                            ) : (
                                                <RadialBarChart
                                                    data={chartData}
                                                    endAngle={180}
                                                    innerRadius={80}
                                                    outerRadius={130}
                                                >
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={<ChartTooltipContent hideLabel />}
                                                    />
                                                    <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                                        <Label
                                                            content={({ viewBox }) => {
                                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                                    return (
                                                                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                                                            <tspan
                                                                                x={viewBox.cx}
                                                                                y={(viewBox.cy || 0) - 16}
                                                                                className="fill-foreground text-[1.5rem] font-bold"
                                                                            >
                                                                                {totalWO.toLocaleString()}
                                                                            </tspan>
                                                                            <tspan
                                                                                x={viewBox.cx}
                                                                                y={(viewBox.cy || 0) + 4}
                                                                                className="text-[13px] pt-[10px] fill-muted-foreground"
                                                                            >
                                                                                Total Tasks
                                                                            </tspan>
                                                                        </text>
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                    </PolarRadiusAxis>
                                                    <RadialBar
                                                        dataKey="emptyValue"
                                                        stackId="a"
                                                        cornerRadius={5}
                                                        fill="#ef4444"
                                                        className="stroke-transparent stroke-2"
                                                    />
                                                    {/* <RadialBar
                                                        dataKey="emptyValue"
                                                        fill="#ef4444"
                                                        stackId="a"
                                                        cornerRadius={5}
                                                        className="stroke-transparent stroke-2"
                                                    /> */}
                                                </RadialBarChart>
                                            )}
                                        </ChartContainer>
                                    </div>
                                    <div className="w-full h-full flex flex-col text-sm p-[1rem] absolute left-0 right-0 bottom-[-13rem]">
                                        {/* Legend for Completed and Scheduled */}
                                        <div className="w-full flex justify-center gap-6 p-4 font-semibold">
                                            <div className="flex items-center">
                                                <div className="h-3 w-3 rounded-full bg-[#2563eb] mr-2"></div>
                                                <span>Completed ({chartData[0]?.completedPercentage?.toFixed(1)}%)</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="h-3 w-3 rounded-full bg-[#60a5fa] mr-2"></div>
                                                <span>Scheduled ({chartData[0]?.scheduledPercentage?.toFixed(1)}%)</span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        {totalWO > 0 ? (
                                            <>
                                                <div className="w-full grid grid-cols-2 rounded-lg px-[10px] my-[1rem] ">
                                                    {/* Top Left */}
                                                    <div className="p-4 border-b border-r border-zinc-300">
                                                        <p className="text-[1.1rem] font-bold text-foreground">
                                                            {getCountByStatus("Completed")}
                                                        </p>
                                                        <p className="text-[13px] text-muted-foreground">Completed</p>
                                                    </div>

                                                    {/* Top Right (no top border, has left border handled by left cell's right border) */}
                                                    <div className="p-4 border-b border-zinc-300">
                                                        <p className="pl-[2rem] text-[1.1rem] font-bold text-foreground">
                                                            {getCountByStatus("Open")}
                                                        </p>
                                                        <p className="pl-[2rem] text-[13px] text-muted-foreground">Open</p>
                                                    </div>


                                                    {/* Middle Left */}
                                                    <div className="p-4 border-b border-r border-zinc-300">
                                                        <p className="text-[1.1rem] font-bold text-foreground">
                                                            {getCountByStatus("Scheduled")}
                                                        </p>
                                                        <p className="text-[13px] text-muted-foreground">Scheduled</p>
                                                    </div>

                                                    {/* Middle Right */}
                                                    <div className="p-4 border-b border-zinc-300">
                                                        <p className="pl-[2rem] text-[1.1rem] font-bold text-foreground">
                                                            {getCountByStatus("In Progress")}
                                                        </p>
                                                        <p className="pl-[2rem] text-[13px] text-muted-foreground">In-progress</p>
                                                    </div>

                                                    {/* Bottom Left */}
                                                    <div className="p-4 border-r border-b border-zinc-300">
                                                        <p className="text-[1.1rem] font-bold text-foreground">
                                                            {getCountByStatus("On-Hold For Labor")}
                                                        </p>
                                                        <p className="text-[13px] text-muted-foreground">On-Hold for Labour</p>
                                                    </div>

                                                    {/* Bottom Right */}
                                                    <div className="border-b border-zinc-300 p-4">
                                                        <p className="pl-[2rem] text-[1.1rem] font-bold text-foreground">
                                                            {getCountByStatus("On-Hold For Parts")}
                                                        </p>
                                                        <p className="pl-[2rem] text-[13px] text-muted-foreground">On-Hold for Parts</p>
                                                    </div>
                                                    {/* Bottom Left */}
                                                    <div className="p-4 border-r border-b  border-zinc-300">
                                                        <p className="text-[1.1rem] font-bold text-foreground">
                                                            {getCountByStatus("On-Hold For Resources")}
                                                        </p>
                                                        <p className="text-[13px] text-muted-foreground">On-Hold for Resources</p>
                                                    </div>

                                                    {/* Bottom Right */}
                                                    <div className="border-b border-zinc-300 p-4">
                                                        <p className="pl-[2rem] text-[1.1rem] font-bold text-foreground">
                                                            {getCountByStatus("Plant Offline")}
                                                        </p>
                                                        <p className="pl-[2rem] text-[13px] text-muted-foreground">Plant Offline</p>
                                                    </div>
                                                    {/* Bottom Left */}
                                                    <div className="p-4 border-r border-zinc-300">
                                                        <p className="text-[1.1rem] font-bold text-foreground">
                                                            {getCountByStatus("PM Duplicate")}
                                                        </p>
                                                        <p className="text-[13px] text-muted-foreground">PM Duplicate</p>
                                                    </div>

                                                    {/* Bottom Right */}
                                                    <div className="p-4">
                                                        <p className="pl-[2rem] text-[1.1rem] font-bold text-foreground">
                                                            {getCountByStatus("Shutdown Maintenance Canceled")}
                                                        </p>
                                                        <p className="pl-[2rem] text-[13px] text-muted-foreground">Shutdown Maintenance Canceled</p>
                                                    </div>
                                                </div>
                                                <div className="mb-[10px]">
                                                    <BarChartExpenseClass tasks={filteredTasks} />
                                                </div>
                                            </>
                                        ) : null}
                                        
                                        
                                        <div className="flex flex-col justify-center items-center gap-y-[10px] pb-[10px]">
                                            {/* <div className="flex items-center gap-2 font-medium leading-none">
                                                Trending up by 5.2% this week <TrendingUp className="h-4 w-4" />
                                            </div> */}
                                            <div className="leading-none text-muted-foreground">
                                                Showing total tasks for the selected date range
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Compliance;