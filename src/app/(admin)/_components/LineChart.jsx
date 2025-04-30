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
  // Only show tick labels at regular intervals to avoid overcrowding
  // Show every Nth label based on data density
  const getTickLabelDisplay = (index) => {
    // For less than 100 data points, show every 4th point (20 min intervals)
    // For 100-200 data points, show every 6th point (30 min intervals)
    // For more than 200 data points, show every 12th point (hourly)
    const interval = data.length < 100 ? 4 : (data.length < 200 ? 6 : 12);
    return index % interval === 0;
  };

  // Format the x-axis time label
  const formatTimeLabel = (value, index) => {
    const item = data[index];
    if (!item) return '';
    
    // For hour marks, show hour with AM/PM
    if (item.minute === 0) {
      return `${item.hour}:00 ${item.daySection}`;
    }
    
    // For other points, show hour:minute
    return `${item.hour}:${item.minute.toString().padStart(2, '0')}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 30, right: 40, left: 20, bottom: 20 }}
        style={{ backgroundColor: 'white' }}
      >
        <CartesianGrid strokeDasharray="3 3" />
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
            
            // Only display certain tick labels to avoid overcrowding
            if (!getTickLabelDisplay(index)) {
              return null;
            }
            
            const item = data[index];
            if (!item) return null;
            
            // Format time based on whether it's an hour mark or not
            let timeLabel;
            if (item.minute === 0) {
              timeLabel = `${item.hour}:00 ${item.daySection}`;
            } else {
              timeLabel = `${item.hour}:${item.minute.toString().padStart(2, '0')}`;
            }
            
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
          tick={({ x, y, payload }) => (
            <g transform={`translate(${x},${y})`}>
              <text
                x={0}
                y={0}
                dy={10}
                textAnchor="end"
                fill="#666"
                fontWeight="bold"  // Add this to make it bold
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
        
        {/* Add reference line at midnight */}
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
            name={tag.split('.').pop()}
            stroke={getLineColor(index)}
            strokeWidth={2.5}
            activeDot={{ r: 6 }}
            dot={false} // Hide dots for 5-minute data to reduce visual clutter
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};