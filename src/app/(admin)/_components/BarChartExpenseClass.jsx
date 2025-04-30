"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, Cell } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const chartConfig = {
  completed: { label: "Completed", color: "#2563eb" },
  pending: { label: "Pending", color: "#60a5fa" },
}

const BarChartExpenseClass = ({ tasks }) => {
  const [expenseClassData, setExpenseClassData] = useState([]);
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setHasData(false);
      setExpenseClassData([]);
      return;
    }

    setHasData(true);

    const grouped = {};

    tasks.forEach(task => {
      const cls = task.expenseClass || "Unspecified";
      if (!grouped[cls]) grouped[cls] = { completed: 0, pending: 0, total: 0 };

      grouped[cls].total += 1;
      task.status?.includes("Completed") ? grouped[cls].completed++ : grouped[cls].pending++;
    });

    const formatted = Object.entries(grouped).map(([name, { completed, pending, total }]) => ({
      name,
      completed: Math.round((completed / total) * 100),
      pending: 100 - Math.round((completed / total) * 100),
      totalTasks: total,
      completedCount: completed,
      pendingCount: pending,
    }));

    // Sort by completion percentage instead of total tasks
    setExpenseClassData(formatted.sort((a, b) => b.completed - a.completed));
  }, [tasks]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow text-sm">
          <p className="font-semibold">{d.name}</p>
          <p>Total Tasks: {d.totalTasks}</p>
          <p>✅ Completed: {d.completedCount} ({d.completed}%)</p>
          <p>⌛ Pending: {d.pendingCount} ({d.pending}%)</p>
        </div>
      );
    }
    return null;
  };

  // Color function based on completion percentage
  const getCompletionColor = (percentage) => {
    if (percentage >= 90) return "#2563eb"; // Green for high completion
    if (percentage >= 70) return "#3b82f6"; // Blue for good completion
    if (percentage >= 50) return "#f59e0b"; // Amber for medium completion
    return "#ef4444"; // Red for low completion
  };

  return (
    <div className="w-full py-[10x]">
      <h2 className="text-[1rem]] font-semibold text-center mb-4  border-y-[1px] py-[10px]">
        Compliance by Expense Classes
      </h2>

      {!hasData ? (
        <div className="text-center text-gray-500 py-6">No tasks available</div>
      ) : (
        <ChartContainer config={chartConfig}>
          <BarChart
            data={expenseClassData}
            layout="vertical"
            barSize={20}
            margin={{ top: 10, bottom: 10, left: 0, right: 60 }}
          >
            <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tickFormatter={label => label.length > 14 ? label.slice(0, 14) + "…" : label}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* <Legend /> */}
            
            {/* Only showing the completed percentage as a single bar */}
            <Bar dataKey="completed" name="Completed %" radius={[0, 4, 4, 0]}>
              {/* Color cells based on completion percentage */}
              {expenseClassData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getCompletionColor(entry.completed)} />
              ))}
              <LabelList 
                dataKey="completed" 
                position="right" 
                formatter={(val) => `${val}%`} 
                style={{ fontWeight: 600 }} 
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  )
}

export default BarChartExpenseClass;