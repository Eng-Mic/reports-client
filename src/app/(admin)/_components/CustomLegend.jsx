import React from 'react';

export const CustomLegend = (props) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4 mb-2 px-4">
      {payload.map((entry, index) => (
        <div 
          key={`item-${index}`}
          className="flex items-center bg-slate-50 px-4 py-2 rounded-md border border-slate-200"
        >
          <div 
            className="w-4 h-4 mr-2 rounded-sm" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-slate-700">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};