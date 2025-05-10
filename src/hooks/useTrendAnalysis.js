import { useState } from 'react';

/**
 * Custom hook for analyzing trend data from time series data
 * @param {Array} data - Array of data points with timestamps and tag values
 * @param {Array} selectedTags - Array of tag names to analyze
 * @param {Date} startDate - Start date of the analysis period
 * @param {Date} endDate - End date of the analysis period
 * @returns {Object} - Analysis results and control functions
 */
export const useTrendAnalysis = (data, selectedTags, startDate, endDate) => {
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Determine the trend direction (upward, downward, stable, fluctuating)
  const determineTrend = (values) => {
    if (!values || values.length < 2) return 'insufficient-data';
    
    // Filter out undefined/null values
    const cleanValues = values.filter(val => val !== undefined && val !== null);
    if (cleanValues.length < 2) return 'insufficient-data';
    
    // Calculate linear regression for trend direction
    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_xx = 0;
    
    for (let i = 0; i < cleanValues.length; i++) {
      const x = i;
      const y = cleanValues[i];
      
      sum_x += x;
      sum_y += y;
      sum_xy += x * y;
      sum_xx += x * x;
    }
    
    const n = cleanValues.length;
    const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    
    // Calculate variance to determine stability
    const mean = sum_y / n;
    const variance = cleanValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const coeffOfVar = stdDev / Math.abs(mean);
    
    // Thresholds for trend determination
    const SLOPE_THRESHOLD = 0.01;
    const VARIANCE_THRESHOLD = 0.1;
    
    if (Math.abs(slope) < SLOPE_THRESHOLD) {
      return coeffOfVar < VARIANCE_THRESHOLD ? 'stable' : 'fluctuating';
    } else {
      return slope > 0 ? 'upward' : 'downward';
    }
  };

  // Generate observations based on the data
  const generateObservations = (values, tagName) => {
    if (!values || values.length < 2) return 'Insufficient data points for analysis';
    
    // Filter out undefined/null values
    const cleanValues = values.filter(val => val !== undefined && val !== null);
    if (cleanValues.length < 2) return 'Insufficient data points for analysis';
    
    const mean = cleanValues.reduce((a, b) => a + b, 0) / cleanValues.length;
    const max = Math.max(...cleanValues);
    const min = Math.min(...cleanValues);
    const range = max - min;
    
    // Get the last few values to detect recent changes
    const recentValues = cleanValues.slice(-5);
    const recentMean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const recentTrend = recentMean > mean ? 'increasing' : recentMean < mean ? 'decreasing' : 'stable';
    
    // Count periods of stability
    let stableCount = 0;
    let maxStableCount = 0;
    let prevValue = null;
    
    for (const value of cleanValues) {
      if (prevValue !== null && Math.abs(value - prevValue) < 0.01 * range) {
        stableCount++;
        maxStableCount = Math.max(maxStableCount, stableCount);
      } else {
        stableCount = 0;
      }
      prevValue = value;
    }
    
    // Build observations
    let observations = [];
    
    // Recent trend observation
    if (recentTrend === 'increasing') {
      observations.push(`Recently ${tagName} has been trending upward.`);
    } else if (recentTrend === 'decreasing') {
      observations.push(`Recently ${tagName} has been trending downward.`);
    } else {
      observations.push(`${tagName} has been relatively stable recently.`);
    }
    
    // Range observation
    if (range > 0.25 * mean) {
      observations.push(`Shows significant variation with a range of ${range.toFixed(2)}.`);
    } else {
      observations.push(`Maintains relatively consistent values within a narrow range.`);
    }
    
    // Stability periods
    if (maxStableCount > cleanValues.length / 4) {
      observations.push(`Extended periods of stability detected.`);
    }
    
    return observations.join(' ');
  };

  // Function to analyze all selected tags
  const analyzeAllTags = async () => {
    if (!data || data.length === 0 || !selectedTags || selectedTags.length === 0) {
      return;
    }
    
    try {
      setIsAnalyzing(true);
      
      const analysisResults = {
        period: {
          start: startDate?.toISOString(),
          end: endDate?.toISOString()
        },
        dataQuality: data.length > 50 ? 'Good data density' : 'Limited data points'
      };
      
      // Process each selected tag
      for (const tag of selectedTags) {
        // Extract values for this tag, filtering out undefined/null
        const tagValues = data
          .map(point => point[tag])
          .filter(val => val !== undefined && val !== null && !isNaN(val));
        
        if (tagValues.length === 0) {
          analysisResults[tag] = {
            average: null,
            peak: null,
            trend: 'insufficient-data',
            variance: null,
            observations: 'No data points found for this tag'
          };
          continue;
        }
        
        // Calculate statistics
        const sum = tagValues.reduce((a, b) => a + b, 0);
        const average = sum / tagValues.length;
        const peak = Math.max(...tagValues);
        
        // Calculate variance
        const squaredDiffs = tagValues.map(value => Math.pow(value - average, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / tagValues.length;
        
        // Determine trend and generate observations
        const trend = determineTrend(tagValues);
        const tagName = tag.split('.').pop(); // Get simple name without path
        const observations = generateObservations(tagValues, tagName);
        
        // Store analysis for this tag
        analysisResults[tag] = {
          average,
          peak,
          trend,
          variance,
          observations
        };
      }
      
      setTrendAnalysis(analysisResults);
      return analysisResults;
    } catch (error) {
      console.error('Error analyzing trends:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    trendAnalysis,
    isAnalyzing,
    analyzeAllTags
  };
};