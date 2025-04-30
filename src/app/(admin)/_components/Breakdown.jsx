import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, Info } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import BreakdownExpenseClass from './BreakdownExpenseClass';

// Chart configuration for downtime colors
const downtimeChartConfig = {
    totalDowntime: {
        label: "Total Downtime",
        color: "#ef4444", // Red
    },
    resolved: {
        label: "Resolved",
        color: "#10b981", // Green
    },
    ongoing: {
        label: "Ongoing",
        color: "#f59e0b", // Amber
    },
    noData: {
        label: "No Data",
        color: "#d1d5db", // Light gray
    }
};

const Breakdown = ({ tasks, dateRange }) => {
    // Calculate breakdown statistics
    const breakdownStats = useMemo(() => {
        if (!tasks || tasks.length === 0) {
            return {
                totalDowntimeCount: 0,
                totalDowntimeDuration: 0,
                averageDowntimeDuration: 0,
                resolvedCount: 0,
                ongoingCount: 0,
                resolvedPercentage: 0,
                trend: 0,
                recentPeriodDuration: 0,
                previousPeriodDuration: 0,
                chartData: [{ noData: 100 }],
                impactLevel: "None",
                downtimeByCategory: [],
                mostImpactfulCategory: null,
                downtimeTasks: []
            };
        }

        // Find tasks that have @downtime in their description
        const downtimeTasks = tasks.filter(task => 
            task.description && task.description.toLowerCase().includes('@downtime')
        );
        
        // Calculate total downtime count
        const totalDowntimeCount = downtimeTasks.length;
        
        // Calculate total downtime duration from estimatedTime (assuming estimatedTime is in seconds)
        const totalDowntimeDuration = downtimeTasks.reduce((total, task) => {
            return total + (task.estimatedTime ? Number(task.estimatedTime) : 0);
        }, 0);
        
        // Calculate average downtime duration
        const averageDowntimeDuration = totalDowntimeCount > 0 
            ? totalDowntimeDuration / totalDowntimeCount 
            : 0;
            
        // Count resolved vs ongoing downtime tasks
        const resolvedCount = downtimeTasks.filter(task => task.completed).length;
        const ongoingCount = totalDowntimeCount - resolvedCount;
        
        // Calculate resolved percentage
        const resolvedPercentage = totalDowntimeCount > 0 
            ? (resolvedCount / totalDowntimeCount) * 100 
            : 0;

        // Extract dates for trend calculation
        const now = new Date();
        const midpoint = new Date(dateRange?.from ? dateRange.from : now);
        midpoint.setDate(midpoint.getDate() + 
            (dateRange?.to ? Math.floor((new Date(dateRange.to) - midpoint) / 2) : 0));
        
        // Recent vs previous period comparison
        const recentTasks = downtimeTasks.filter(task => 
            task.date && new Date(task.date) >= midpoint
        );
        
        const previousTasks = downtimeTasks.filter(task => 
            task.date && new Date(task.date) < midpoint
        );

        const recentPeriodDuration = recentTasks.reduce((total, task) => 
            total + (task.estimatedTime ? Number(task.estimatedTime) : 0), 0);
        
        const previousPeriodDuration = previousTasks.reduce((total, task) => 
            total + (task.estimatedTime ? Number(task.estimatedTime) : 0), 0);

        // Calculate trend percentage
        let trend = 0;
        if (previousPeriodDuration > 0) {
            trend = ((recentPeriodDuration - previousPeriodDuration) / previousPeriodDuration) * 100;
        } else if (recentPeriodDuration > 0) {
            trend = 100; // If previous period had no downtime but current does
        }

        // Calculate impact level (adjusted for seconds)
        let impactLevel = "Minimal";
        if (totalDowntimeDuration > 86400) impactLevel = "Critical"; // More than 24 hours (86400 seconds)
        else if (totalDowntimeDuration > 28800) impactLevel = "High"; // More than 8 hours (28800 seconds)
        else if (totalDowntimeDuration > 7200) impactLevel = "Moderate"; // More than 2 hours (7200 seconds)

        // Extract categories from descriptions (anything with @ symbol)
        const categoryMap = {};
        const categoryRegex = /@([a-zA-Z0-9_-]+)/g;
        
        downtimeTasks.forEach(task => {
            if (!task.description) return;
            
            const matches = task.description.match(categoryRegex);
            if (matches) {
                matches.forEach(match => {
                    const category = match.substring(1).toLowerCase();
                    if (category !== 'downtime') { // Skip the main @downtime tag
                        if (!categoryMap[category]) {
                            categoryMap[category] = {
                                name: category,
                                count: 0,
                                duration: 0
                            };
                        }
                        categoryMap[category].count += 1;
                        categoryMap[category].duration += (task.estimatedTime ? Number(task.estimatedTime) : 0);
                    }
                });
            }
        });

        const downtimeByCategory = Object.values(categoryMap).sort((a, b) => b.duration - a.duration);
        const mostImpactfulCategory = downtimeByCategory.length > 0 ? downtimeByCategory[0] : null;

        // Prepare chart data
        const chartData = [
            {
                track: 100,
                totalDowntime: 100,
                resolved: resolvedPercentage,
                ongoing: 100 - resolvedPercentage
            }
        ];

        return {
            totalDowntimeCount,
            totalDowntimeDuration,
            averageDowntimeDuration,
            resolvedCount,
            ongoingCount,
            resolvedPercentage,
            trend,
            recentPeriodDuration,
            previousPeriodDuration,
            chartData: totalDowntimeCount > 0 ? chartData : [{ noData: 100 }],
            impactLevel,
            downtimeByCategory,
            mostImpactfulCategory,
            downtimeTasks // Pass the filtered downtime tasks for the expense class chart
        };
    }, [tasks, dateRange]);
    
    // Format duration for display (convert seconds to hours, minutes, and seconds)
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

    const getColorClass = (level) => {
        switch(level) {
            case 'Critical': return 'text-red-600';
            case 'High': return 'text-orange-600';
            case 'Moderate': return 'text-amber-600';
            default: return 'text-green-600';
        }
    };

    const getExplanationText = () => {
        if (breakdownStats.totalDowntimeCount === 0) {
            return "No breakdown incidents recorded for this period.";
        }
        
        let text = `${breakdownStats.totalDowntimeCount} breakdowns totaling ${formatDuration(breakdownStats.totalDowntimeDuration)} of breakdown. `;
        
        if (breakdownStats.resolvedCount > 0) {
            text += `${breakdownStats.resolvedPercentage.toFixed(0)}% of breakdown have been resolved. `;
        }
        
        if (breakdownStats.trend > 5) {
            text += "Breakdown is increasing compared to previous period.";
        } else if (breakdownStats.trend < -5) {
            text += "Breakdown is decreasing compared to previous period.";
        } else {
            text += "Breakdown is stable compared to previous period.";
        }
        
        return text;
    };

    return (
        <div className="w-full flex flex-col justify-center p-4 relative">
            <div className="w-full flex flex-col justify-center items-center">
                <h3 className="text-[1.25rem] font-bold flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" />
                    Breakdown Analysis
                </h3>
                <p className='text-[12px] text-zinc-500'>
                    {dateRange?.from && dateRange?.to ? (
                        `${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`
                    ) : (
                        'All time'
                    )}
                </p>
            </div>

            <div className="flex flex-1 items-center min-h-[13rem] overflow-hidden">
                <ChartContainer
                    config={downtimeChartConfig}
                    className="mx-auto w-full"
                >
                    <RadialBarChart
                        data={breakdownStats.chartData}
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
                                                    className={`fill-foreground text-xl font-bold ${getColorClass(breakdownStats.impactLevel)}`}
                                                >
                                                    {formatDuration(breakdownStats.totalDowntimeDuration)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 4}
                                                    className="text-sm fill-muted-foreground"
                                                >
                                                    Total Breakdowns
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="text-xs fill-muted-foreground"
                                                >
                                                    {breakdownStats.totalDowntimeCount} breakdowns
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
                            fill="#E5E7EB" // light gray
                        />

                        {/* Resolved Incidents */}
                        <RadialBar
                            dataKey="resolved"
                            clockWise
                            fill="#10b981" // green
                            cornerRadius={breakdownStats.resolvedPercentage === 100 ? 0 : 5}
                        />
                    </RadialBarChart>
                </ChartContainer>
            </div>

            <div className="w-full h-full flex flex-col text-sm p-[1rem] absolute left-0 right-0 bottom-[-14rem]">
                <div className="p-4 bg-gray-50 rounded-md mt-4 flex items-start gap-2">
                    <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium">{getExplanationText()}</p>
                        {breakdownStats.mostImpactfulCategory && (
                            <p className="text-xs text-gray-500 mt-1">
                                Most impactful category: <span className="font-medium">{breakdownStats.mostImpactfulCategory.name}</span> ({formatDuration(breakdownStats.mostImpactfulCategory.duration)})
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500">Total Breakdowns</div>
                        <div className="font-medium">{breakdownStats.totalDowntimeCount}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500">Avg. Duration</div>
                        <div className="font-medium">{formatDuration(breakdownStats.averageDowntimeDuration)}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500">Impact Level</div>
                        <div className={`font-medium ${getColorClass(breakdownStats.impactLevel)}`}>{breakdownStats.impactLevel}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                        <div className="text-gray-500 flex items-center">
                            Trend
                            {breakdownStats.trend > 0 ? (
                                <TrendingUp className="h-4 w-4 ml-1 text-red-600" />
                            ) : (
                                <TrendingDown className="h-4 w-4 ml-1 text-green-600" />
                            )}
                        </div>
                        <div className={`font-medium ${breakdownStats.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {Math.abs(breakdownStats.trend).toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Add the Impact-Based Expense Class Chart Section */}
            <div className="w-full mt-60">
                <BreakdownExpenseClass tasks={breakdownStats.downtimeTasks || []} />
            </div>
        </div>
    );
};

export default Breakdown;