import React from 'react';
import { X, TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

export const TrendReport = ({ analysis = {}, onClose }) => {
  // Format date without date-fns dependency
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  };

  // Helper function to format values with proper units based on tag name
  const formatValue = (value, tagName) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    
    // Round to 2 decimal places for readability
    const formattedValue = parseFloat(value).toFixed(2);
    
    // Determine units based on tag name (customize based on your actual tags)
    if (tagName.toLowerCase().includes('temp')) return `${formattedValue} °F`;
    if (tagName.toLowerCase().includes('pressure')) return `${formattedValue} PSI`;
    if (tagName.toLowerCase().includes('flow')) return `${formattedValue} GPM`;
    if (tagName.toLowerCase().includes('level')) return `${formattedValue} %`;
    if (tagName.toLowerCase().includes('speed')) return `${formattedValue} RPM`;
    
    // Default
    return formattedValue;
  };

  // Get actual tags with data from the analysis
  const tagsWithData = Object.keys(analysis).filter(tag => 
    analysis[tag] && typeof analysis[tag] === 'object' && 
    !['period', 'dataQuality'].includes(tag)
  );

  // Check if we have any valid tag data
  const hasValidData = tagsWithData.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Performance Trend Analysis</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!hasValidData ? (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600">No valid data available for analysis</p>
              <p className="text-gray-500 mt-2">
                Please ensure that your selected tags contain sufficient data points for trend analysis.
              </p>
            </div>
          ) : (
            <>
              {/* Overall summary section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Overall Trends</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock size={18} className="mr-2 text-gray-600" />
                      <h4 className="text-sm font-medium text-gray-700">Analysis Period</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(analysis.period?.start)} - {formatDate(analysis.period?.end)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Activity size={18} className="mr-2 text-gray-600" />
                      <h4 className="text-sm font-medium text-gray-700">Data Quality</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {analysis.dataQuality || 'Data quality assessment not available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual tag analysis */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tag Performance</h3>
                
                <div className="space-y-6">
                  {tagsWithData.map(tag => {
                    const tagData = analysis[tag];
                    const tagName = tag.split('.').pop(); // Get simple name from path
                    const trendIcon = tagData.trend === 'upward' ? 
                      <TrendingUp size={18} className="text-green-500" /> : 
                      tagData.trend === 'downward' ? 
                      <TrendingDown size={18} className="text-red-500" /> : 
                      <Activity size={18} className="text-blue-500" />;

                    return (
                      <div key={tag} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-3 flex items-center">
                          {trendIcon}
                          <h4 className="ml-2 font-medium">{tagName}</h4>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Average Value</p>
                              <p className="font-semibold">
                                {formatValue(tagData.average, tagName)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Peak Value</p>
                              <p className="font-semibold">
                                {formatValue(tagData.peak, tagName)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Variance</p>
                              <p className="font-semibold">
                                {tagData.variance !== undefined ? 
                                  parseFloat(tagData.variance).toFixed(2) : 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-sm text-gray-500">Key Observations</p>
                            <p className="text-sm mt-1">
                              {tagData.observations || 'No significant observations'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};