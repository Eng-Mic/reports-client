"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, Cell } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const chartConfig = {
  impact: { label: "Impact Duration", color: "#ef4444" },
}

const BreakdownExpenseClass = ({ tasks }) => {
  const [expenseClassData, setExpenseClassData] = useState([]);
  const [hasData, setHasData] = useState(true);
  const [maxDuration, setMaxDuration] = useState(0);

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setHasData(false);
      setExpenseClassData([]);
      return;
    }

    setHasData(true);

    const grouped = {};
    let maxDur = 0;

    tasks.forEach(task => {
      const cls = task.expenseClass || "Unspecified";
      const duration = task.estimatedTime ? Number(task.estimatedTime) : 0;
      
      if (!grouped[cls]) {
        grouped[cls] = { 
          duration: 0, 
          count: 0, 
          resolved: 0, 
          ongoing: 0 
        };
      }

      grouped[cls].duration += duration;
      grouped[cls].count += 1;
      task.completed ? grouped[cls].resolved++ : grouped[cls].ongoing++;
      
      if (grouped[cls].duration > maxDur) {
        maxDur = grouped[cls].duration;
      }
    });

    setMaxDuration(maxDur);

    const formatted = Object.entries(grouped).map(([name, stats]) => ({
      name,
      impact: stats.duration,
      count: stats.count,
      resolved: stats.resolved,
      ongoing: stats.ongoing,
      resolutionRate: stats.count > 0 ? Math.round((stats.resolved / stats.count) * 100) : 0
    }));

    // Sort by impact duration (highest to lowest)
    setExpenseClassData(formatted.sort((a, b) => b.impact - a.impact));
  }, [tasks]);

  // Format duration for display
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '—';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);
    
    if (hours === 0 && minutes === 0) {
      return `${secs}s`;
    } else if (hours === 0) {
      return `${minutes}m ${secs > 0 ? `${secs}s` : ''}`;
    }
    
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow text-sm">
          <p className="font-semibold">{d.name}</p>
          <p>Total Impact: {formatDuration(d.impact)}</p>
          <p>Incidents: {d.count}</p>
          <p>✅ Resolved: {d.resolved} ({d.resolutionRate}%)</p>
          <p>⌛ Ongoing: {d.ongoing}</p>
        </div>
      );
    }
    return null;
  };

  // Color function based on impact severity
  const getImpactColor = (duration, maxDur) => {
    const percentage = maxDur > 0 ? (duration / maxDur) * 100 : 0;
    
    if (percentage >= 75) return "#ef4444"; // Red for high impact
    if (percentage >= 50) return "#f97316"; // Orange for significant impact
    if (percentage >= 25) return "#f59e0b"; // Amber for moderate impact
    return "#10b981"; // Green for low impact
  };

  return (
    <div className="w-full py-[10px]">
      <h2 className="text-[1rem] font-semibold text-center mb-4 border-y-[1px] py-[10px]">
        Most Impactful Expense Classes by Downtime
      </h2>

      {!hasData ? (
        <div className="text-center text-gray-500 py-6">No downtime incidents available</div>
      ) : (
        <ChartContainer config={chartConfig}>
          <BarChart
            data={expenseClassData}
            layout="vertical"
            barSize={20}
            margin={{ top: 10, bottom: 10, left: 0, right: 70 }}
          >
            <XAxis 
              type="number" 
              tickFormatter={(val) => formatDuration(val)}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tickFormatter={label => label.length > 14 ? label.slice(0, 14) + "…" : label}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Bar dataKey="impact" name="Impact Duration" radius={[0, 4, 4, 0]}>
              {expenseClassData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getImpactColor(entry.impact, maxDuration)} />
              ))}
              <LabelList 
                dataKey="impact" 
                position="right" 
                formatter={val => formatDuration(val)} 
                style={{ fontWeight: 600 }} 
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  )
}

export default BreakdownExpenseClass;