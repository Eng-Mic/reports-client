import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, Info } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

// Chart configuration for availability colors
const availabilityChartConfig = {
    available: {
        label: "Available",
        color: "#10b981", // Green
    },
    downtime: {
        label: "Downtime",
        color: "#ef4444", // Red
    },
    noData: {
        label: "No Data",
        color: "#d1d5db", // Light gray
    }
};

const EquipmentAvailability = ({ tasks, dateRange }) => {
    const availabilityData = useMemo(() => {
        if (!tasks || tasks.length === 0) {
            return {
                availability: 0,
                totalProductionPeriod: 0,
                totalHours: 0,
                actualDowntime: 0,
                trend: 0,
                previousPeriodAvailability: 0,
                recentPeriodAvailability: 0,
                maintenanceEvents: 0,
                expenseClasses: [],
                primaryExpenseClass: null,
                chartData: [{ noData: 100 }]
            };
        }

        const dueDates = tasks
            .filter(task => task.dueDate)
            .map(task => new Date(task.dueDate));

        if (dueDates.length === 0) {
            return {
                availability: 0,
                totalProductionPeriod: 0,
                totalHours: 0,
                actualDowntime: 0,
                trend: 0,
                previousPeriodAvailability: 0,
                recentPeriodAvailability: 0,
                maintenanceEvents: 0,
                expenseClasses: [],
                primaryExpenseClass: null,
                chartData: [{ noData: 100 }]
            };
        }

        const minDate = new Date(Math.min(...dueDates));
        const maxDate = new Date(Math.max(...dueDates));
        
        const totalProductionPeriod = Math.floor(
            (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

        // console.log("Total Production Period:", totalProductionPeriod);
        
        
        const totalHours = totalProductionPeriod * 24;
        const totalSeconds = totalHours * 3600;

        // console.log("Total Hours:", totalHours);
        // console.log("Total Seconds:", totalSeconds);
        

        const downtimeTasks = tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            const inRange = dueDate >= minDate && dueDate <= maxDate;
            const isDowntime = task.description?.toLowerCase().includes('@downtime');
            return inRange && isDowntime;
        });

        
        
        // Calculate downtime in seconds
        const actualDowntimeSeconds = downtimeTasks.reduce((total, task) => {
            return total + (task.estimatedTime ? Number(task.estimatedTime) : 0);
        }, 0);
        
        // console.log("Actual Downtime Seconds:", actualDowntimeSeconds);
        
        
        // Convert to hours for display (but keep precision)
        const actualDowntimeHours = actualDowntimeSeconds / 3600;
        // console.log("Actual Downtime Hours:", actualDowntimeHours);
        
        
        const availability = totalSeconds > 0
            ? ((totalSeconds - actualDowntimeSeconds) / totalSeconds) * 100
            : 0;
        
        
        // Extract dates for trend calculation
        const now = new Date();
        const midpoint = new Date(dateRange?.from ? dateRange.from : now);
        midpoint.setDate(midpoint.getDate() + 
            (dateRange?.to ? Math.floor((new Date(dateRange.to) - midpoint) / 2) : 0));
        
        // Split tasks into recent and previous periods for trend analysis
        const recentTasks = tasks.filter(task => 
            task.dueDate && new Date(task.dueDate) >= midpoint
        );
        
        const previousTasks = tasks.filter(task => 
            task.dueDate && new Date(task.dueDate) < midpoint
        );
        
        // Calculate downtime for each period in seconds
        const recentDowntimeTasks = recentTasks.filter(task => 
            task.description?.toLowerCase().includes('@downtime')
        );
        
        const previousDowntimeTasks = previousTasks.filter(task => 
            task.description?.toLowerCase().includes('@downtime')
        );
        
        const recentDowntimeSeconds = recentDowntimeTasks.reduce((total, task) => {
            return total + (task.estimatedTime ? Number(task.estimatedTime) : 0);
        }, 0);
        
        const previousDowntimeSeconds = previousDowntimeTasks.reduce((total, task) => {
            return total + (task.estimatedTime ? Number(task.estimatedTime) : 0);
        }, 0);
        
        // Calculate seconds in each period
        const recentSeconds = recentTasks.length > 0 ? 
            Math.floor((maxDate.getTime() - midpoint.getTime()) / 1000) + 1 : 0;
        
        const previousSeconds = previousTasks.length > 0 ? 
            Math.floor((midpoint.getTime() - minDate.getTime()) / 1000) + 1 : 0;
        
        // Calculate availability for each period
        const recentPeriodAvailability = recentSeconds > 0 ? 
            ((recentSeconds - recentDowntimeSeconds) / recentSeconds) * 100 : 0;
        
        const previousPeriodAvailability = previousSeconds > 0 ? 
            ((previousSeconds - previousDowntimeSeconds) / previousSeconds) * 100 : 0;
        
        // Calculate trend
        let trend = 0;
        if (previousPeriodAvailability > 0) {
            trend = ((recentPeriodAvailability - previousPeriodAvailability) / previousPeriodAvailability) * 100;
        } else if (recentPeriodAvailability > 0) {
            trend = 100; // If previous period had no data but current does
        }
        
        // Calculate maintenance events (simulated data - in a real app this would be actual data)
        const maintenanceEvents = downtimeTasks.filter(task => 
            task.description?.toLowerCase().includes('@maintenance')
        ).length;

        // Extract expense classes from task descriptions or tags
        const expenseClassMap = {};
        const expenseClassRegex = /@expense[_-]?class[_-]?([a-zA-Z0-9_-]+)/i;
        
        // Alternative regex to find expense classes in different formats
        const altExpenseClassRegex = /@([a-zA-Z0-9_-]+)[_-]?expense/i;
        
        downtimeTasks.forEach(task => {
            if (!task.description) return;
            
            // Try primary regex first
            let match = task.description.toLowerCase().match(expenseClassRegex);
            
            // If not found, try alternative format
            if (!match) {
                match = task.description.match(altExpenseClassRegex);
            }
            
            
            if (match) {
                const expenseClass = match[1].toLowerCase();
                if (!expenseClassMap[expenseClass]) {
                    expenseClassMap[expenseClass] = {
                        name: expenseClass,
                        count: 0,
                        seconds: 0
                    };
                }
                expenseClassMap[expenseClass].count += 1;
                // Use estimated time in seconds
                expenseClassMap[expenseClass].seconds += (task.estimatedTime ? Number(task.estimatedTime) : 3600);
            }
        });

        // Convert seconds to hours for display in expense classes
        Object.values(expenseClassMap).forEach(expClass => {
            expClass.hours = expClass.seconds / 3600;
        });

        const expenseClasses = Object.values(expenseClassMap).sort((a, b) => b.hours - a.hours);
        const primaryExpenseClass = expenseClasses.length > 0 ? expenseClasses[0] : null;

        const chartData = [{
            track: 100,
            available: availability,
            downtime: 100 - availability
        }];

        return {
            availability,
            totalProductionPeriod,
            totalHours,
            actualDowntime: actualDowntimeHours,
            actualDowntimeSeconds,
            trend,
            previousPeriodAvailability,
            recentPeriodAvailability,
            maintenanceEvents,
            expenseClasses,
            primaryExpenseClass,
            chartData
        };
    }, [tasks, dateRange]);

    const formattedAvailability = availabilityData.availability.toFixed(1);

    const getColorClass = (value) => {
        if (value >= 90) return "text-green-600";
        if (value >= 75) return "text-yellow-600";
        return "text-red-600";
    };

    const getPerformanceLevel = (value) => {
        if (value >= 90) return "Optimal";
        if (value >= 75) return "Acceptable";
        if (value >= 60) return "Concerning";
        return "Critical";
    };

    const formatExpenseClassName = (name) => {
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    // Format duration for display (convert seconds to hours, minutes, seconds)
    const formatDuration = (seconds) => {
        if (!seconds && seconds !== 0) return '—';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.round(seconds % 60);
        
        if (hours === 0 && minutes === 0) {
            return `${secs} sec${secs !== 1 ? 's' : ''}`;
        } else if (hours === 0) {
            return `${minutes} min${minutes !== 1 ? 's' : ''} ${secs > 0 ? ` ${secs} sec${secs !== 1 ? 's' : ''}` : ''}`;
        }
        
        return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes > 0 ? ` ${minutes} min${minutes !== 1 ? 's' : ''}` : ''}`;
    };

    const getExplanationText = () => {
        if (availabilityData.totalHours === 0) {
            return "No production data available for this period.";
        }
        
        let text = `${formattedAvailability}% equipment availability over ${availabilityData.totalProductionPeriod} days. `;
        
        if (availabilityData.actualDowntimeSeconds > 0) {
            text += `${formatDuration(availabilityData.actualDowntimeSeconds)} of total downtime recorded. `;
        }
        
        if (availabilityData.primaryExpenseClass) {
            text += `Primary expense class: ${formatExpenseClassName(availabilityData.primaryExpenseClass.name)} (${formatDuration(availabilityData.primaryExpenseClass.seconds)}). `;
        }
        
        if (availabilityData.trend > 5) {
            text += "Availability is improving compared to previous period.";
        } else if (availabilityData.trend < -5) {
            text += "Availability is declining compared to previous period.";
        } else {
            text += "Availability is stable compared to previous period.";
        }
        
        return text;
    };

    return (
        <div className="w-full flex flex-col justify-center p-4 relative">
            <div className="w-full flex flex-col justify-center items-center">
                <h3 className="flex items-center gap-2 text-[1.25rem] font-bold">
                    <Clock size={18} className="text-blue-500" />
                    Equipment Availability
                </h3>
                <p className='text-[12px] text-zinc-500'>
                    {dateRange?.from && dateRange?.to ? (
                        `${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`
                    ) : (
                        'Select a date range'
                    )}
                </p>
            </div>

            <div className="flex flex-1 items-center min-h-[13rem] overflow-hidden">
                <ChartContainer
                    config={availabilityChartConfig}
                    className="mx-auto w-full"
                >
                    <RadialBarChart
                        data={availabilityData.chartData}
                        startAngle={180}
                        endAngle={0}
                        innerRadius={80}
                        outerRadius={130}
                        barSize={20}
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
                                                    className={`fill-foreground text-2xl font-bold ${getColorClass(availabilityData.availability)}`}
                                                >
                                                    {formattedAvailability}%
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 4}
                                                    className="text-sm fill-muted-foreground"
                                                >
                                                    Availability
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="text-xs fill-muted-foreground"
                                                >
                                                    {availabilityData.totalProductionPeriod} days
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </PolarRadiusAxis>

                        {/* Background Track */}
                        <RadialBar
                            dataKey="track"
                            background
                            clockWise
                            cornerRadius={0}
                            fill="#E5E7EB" // light gray (you can customize)
                        />

                        {/* Actual Progress */}
                        <RadialBar
                            dataKey="available"
                            clockWise
                            fill="#10b981" // green
                            cornerRadius={availabilityData.availability === 100 ? 0 : 5}
                        />
                    </RadialBarChart>
                </ChartContainer>
            </div>

            <div className="w-full h-full flex flex-col text-sm p-[1rem] absolute left-0 right-0 bottom-[-14rem]">
                <div className="p-4 bg-gray-50 rounded-md mt-4 flex items-start gap-2">
                    <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium">{getExplanationText()}</p>
                        {availabilityData.expenseClasses.length > 1 && (
                            <p className="text-xs text-gray-500 mt-1">
                                Secondary expense classes: {availabilityData.expenseClasses.slice(1, 3).map(ec => 
                                    `${formatExpenseClassName(ec.name)} (${formatDuration(ec.seconds)})`
                                ).join(', ')}
                                {availabilityData.expenseClasses.length > 3 ? ' and others' : ''}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500">Production Period</div>
                        <div className="font-medium">{availabilityData.totalProductionPeriod} days</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500">Total Hours</div>
                        <div className="font-medium">{availabilityData.totalHours} hrs</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500">Actual Downtime</div>
                        <div className="font-medium">{formatDuration(availabilityData.actualDowntimeSeconds)}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500 flex items-center">
                            Trend
                            {availabilityData.trend > 0 ? (
                                <TrendingUp className="h-4 w-4 ml-1 text-green-600" />
                            ) : (
                                <TrendingDown className="h-4 w-4 ml-1 text-red-600" />
                            )}
                        </div>
                        <div className={`font-medium ${availabilityData.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(availabilityData.trend).toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentAvailability;