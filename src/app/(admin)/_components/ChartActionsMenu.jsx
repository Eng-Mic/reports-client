import React, { useState } from 'react';
import { Menu, Maximize, Download, FileText, Printer } from 'lucide-react';

export const ChartActionsMenu = ({ onFullscreen, onExportData, onDownloadImage, onPrintChart }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const handleAction = (action) => {
    action();
    setIsDropdownOpen(false);
  };
  
  return (
    <div className="relative">
      <button 
        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1 px-3 rounded text-sm flex gap-x-1 items-center"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label="Chart Actions"
      >
        <Menu size={16} />
      </button>
      
      {isDropdownOpen && (
        <>
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
            <ul className="py-1">
              <li>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => handleAction(onFullscreen)}
                >
                  <Maximize className="w-4 h-4 mr-2" />
                  View Fullscreen
                </button>
              </li>
              <li>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => handleAction(onExportData)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export Data (CSV)
                </button>
              </li>
              <li>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => handleAction(onDownloadImage)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download as Image
                </button>
              </li>
              <li>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => handleAction(onPrintChart)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Chart
                </button>
              </li>
            </ul>
          </div>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsDropdownOpen(false)}
          />
        </>
      )}
    </div>
  );
};