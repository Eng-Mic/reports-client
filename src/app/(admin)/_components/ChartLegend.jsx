import { getLineColor } from '@/utils/formatter';
import React from 'react';

export const ChartLegend = ({ selectedTags }) => {
  return (
    <div className="hidden sm:flex items-center gap-4">
      {selectedTags.slice(0, 3).map((tag, index) => (
        <div key={tag} className="flex items-center">
          <div 
            className="w-3 h-3 mr-1 rounded-sm" 
            style={{ backgroundColor: getLineColor(index) }}
          />
          <span className="text-xs text-slate-600">{tag.split('.').pop()}</span>
        </div>
      ))}
      {selectedTags.length > 3 && (
        <span className="text-xs text-slate-500">+{selectedTags.length - 3} more</span>
      )}
    </div>
  );
};