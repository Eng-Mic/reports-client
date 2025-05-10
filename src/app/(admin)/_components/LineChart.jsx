// import React from 'react';
// import { 
//   ResponsiveContainer, 
//   LineChart, 
//   Line, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   Legend,
//   ReferenceLine
// } from 'recharts';
// import { CustomLegend } from './CustomLegend';
// import { formatValue, getLineColor } from '@/utils/formatter';

// export const LineChartComponent = ({ data, midnightIndex, selectedTags }) => {
//   return (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart
//         data={data}
//         margin={{ top: 30, right: 40, left: 20, bottom: 20 }}
//         style={{ backgroundColor: 'white' }}
//       >
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis 
//           dataKey="hourFormatted" 
//           interval={0}
//           angle={-30}
//           textAnchor="end"
//           height={80}
//           tickMargin={15}
//           tickFormatter={(value, index) => {
//             return `${value} ${data[index].daySection}`;
//           }}
//         />
//         <YAxis 
//           tickFormatter={formatValue}
//           domain={['auto', 'auto']}
//           width={70}
//         />
//         <Tooltip 
//           formatter={(value, name) => [formatValue(value), name.split('.').pop()]}
//           labelFormatter={(label, payload) => {
//             return payload.length > 0 ? payload[0].payload.fullTime : label;
//           }}
//           contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
//         />
//         <Legend content={CustomLegend} />
        
//         {/* Add reference line at midnight */}
//         {midnightIndex > 0 && (
//             <ReferenceLine
//                 x={data[midnightIndex].hourFormatted}
//                 stroke="#666"
//                 strokeDasharray="5 5"
//                 label={{
//                     value: 'Day Change',
//                     position: 'top',
//                     fill: '#666',
//                     dy: -10,
//                 }}
//             />
//         )}
        
//         {selectedTags.map((tag, index) => (
//           <Line
//             key={tag}
//             type="monotone"
//             dataKey={tag}
//             name={tag.split('.').pop()}
//             stroke={getLineColor(index)}
//             strokeWidth={2.5}
//             activeDot={{ r: 6 }}
//             dot={{ r: 3 }}
//             connectNulls
//           />
//         ))}
//       </LineChart>
//     </ResponsiveContainer>
//   );
// };


import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine
} from 'recharts';
import { CustomLegend } from './CustomLegend';
import { formatValue, getLineColor } from '@/utils/formatter';

export const LineChartComponent = ({ data, midnightIndex, selectedTags }) => {
  const getTickLabelDisplay = (index) => {
    const interval = data.length < 100 ? 4 : (data.length < 200 ? 6 : 12);
    return index % interval === 0;
  };

  const formatTimeLabel = (value, index) => {
    const item = data[index];
    if (!item) return '';
    if (item.minute === 0) {
      return `${item.hour}:00 ${item.daySection}`;
    }
    return `${item.hour}:${item.minute.toString().padStart(2, '0')}`;
  };

  // Generate the Y-axis ticks based on desired intervals (e.g., 25, 50, 75, 100)
  const yMin = Math.floor(Math.min(...data.flatMap(d => selectedTags.map(t => d[t] || 0))) / 50) * 50;
  const yMax = Math.ceil(Math.max(...data.flatMap(d => selectedTags.map(t => d[t] || 0))) / 50) * 50;

  // Create ticks for 25, 50, 75, 100...
  const yTicks = Array.from({ length: (yMax - yMin) / 25 + 1 }, (_, i) => yMin + i * 25);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 30, right: 40, left: 20, bottom: 20 }}
        style={{ backgroundColor: 'white' }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        {/* Bold vertical lines for each hour */}
        {data.filter(item => item.minute === 0).map((item, idx) => (
          <ReferenceLine
            key={`x-hour-line-${idx}`}
            x={item.timeKey}
            stroke="#333"
            strokeWidth={item.hour % 1 === 0 ? 1.5 : 1}
            strokeDasharray="3 3"
          />
        ))}

        {/* Bold horizontal Y-axis lines at 50-unit intervals */}
        {yTicks.map((value) => (
          <ReferenceLine
            key={`y-line-${value}`}
            y={value}
            stroke="#333"
            strokeWidth={2}
            strokeDasharray="3 3"
          />
        ))}

        <XAxis 
          dataKey="timeKey" 
          interval={0}
          angle={-45}
          textAnchor="end"
          height={80}
          tickMargin={15}
          tick={(props) => {
            const { x, y, payload } = props;
            const index = data.findIndex(d => d.timeKey === payload.value);
            if (!getTickLabelDisplay(index)) return null;

            const item = data[index];
            if (!item) return null;
            const timeLabel = item.minute === 0
              ? `${item.hour}:00 ${item.daySection}`
              : `${item.hour}:${item.minute.toString().padStart(2, '0')}`;

            return (
              <g transform={`translate(${x},${y})`}>
                <text 
                  x={0} 
                  y={0} 
                  dy={16} 
                  textAnchor="end" 
                  fill="#666"
                  fontSize={item.minute === 0 ? "0.9em" : "0.8em"}
                  fontWeight={item.minute === 0 ? "bold" : "normal"}
                  transform="rotate(-45)"
                >
                  {timeLabel}
                </text>
              </g>
            );
          }}
        />

        <YAxis 
          tickFormatter={formatValue}
          domain={['auto', 'auto']}
          width={70}
          tick={({ x, y, payload, index }) => (
            <g transform={`translate(${x},${y})`}>
              <text
                x={0}
                y={0}
                dy={10}
                textAnchor="end"
                fill="#666"
                fontWeight= "bold" // Example: skip bold for last value
              >
                {formatValue(payload.value)}
              </text>
            </g>
          )}
        />


        <Tooltip 
          formatter={(value, name) => [formatValue(value), name.split('.').pop()]}
          labelFormatter={(label, payload) => {
            if (payload.length === 0) return label;
            const dataPoint = data.find(d => d.timeKey === label);
            return dataPoint ? dataPoint.fullTime : label;
          }}
          contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
        />

        <Legend content={CustomLegend} />

        {/* Reference line for midnight */}
        {midnightIndex > 0 && (
          <ReferenceLine
            x={data[midnightIndex].timeKey}
            stroke="#666"
            strokeDasharray="5 5"
            label={{
              value: 'Day Change',
              position: 'top',
              fill: '#666',
              dy: -10,
            }}
          />
        )}

        {selectedTags.map((tag, index) => (
          <Line
            key={tag}
            type="monotone"
            dataKey={tag}
            name={tag}
            stroke={getLineColor(index)}
            strokeWidth={2.5}
            activeDot={{ r: 6 }}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
