import { format } from 'date-fns';

export default class ExportService {
  static renderCustomLegendContent(selectedTags, getLineColor) {
    const legendItems = selectedTags.map((tag, index) => {
      const color = getLineColor(index);
      const displayName = tag.split('.').pop();
      return { 
        name: displayName,
        fullTag: tag,
        color: color
      };
    });

    return `
      <div style="display: flex; flex-wrap: wrap; justify-content: center; padding: 15px; font-family: Arial, sans-serif;">
        <style>
          .legend-item {
            display: flex;
            align-items: center;
            margin: 0 15px 10px 0;
            padding: 8px 15px;
            border-radius: 4px;
            background-color: #f8f8f8;
            border: 1px solid #eaeaea;
            font-size: 14px;
          }
          .color-box {
            display: inline-block;
            width: 16px;
            height: 16px;
            margin-right: 8px;
            border-radius: 3px;
          }
        </style>
        ${legendItems.map(item => `
          <div class="legend-item">
            <span class="color-box" style="background-color: ${item.color};"></span>
            <span title="${item.fullTag}">${item.name}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  static exportDataAsCSV(dataToUse, selectedTags) {
    if (dataToUse.length === 0) return;
    
    try {
      const headers = ['Time', 'Full Time', ...selectedTags.map(tag => tag.split('.').pop())];
      
      const csvContent = [
        headers.join(','),
        ...dataToUse.map(row => {
          return [
            row.hourFormatted + ' ' + row.daySection,
            row.fullTime,
            ...selectedTags.map(tag => row[tag])
          ].join(',');
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `chart-data-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again later.');
    }
  }

  static downloadAsImage(chartRef, productionDayStart, productionDayEnd, selectedTags, getLineColor) {
    if (!chartRef.current) return;
    
    const svgElement = chartRef.current.querySelector('svg');
    if (!svgElement) return;
    
    try {
      // Get the SVG data
      const svgData = new XMLSerializer().serializeToString(svgElement);
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match the SVG
      const bbox = svgElement.getBoundingClientRect();
      canvas.width = bbox.width;
      canvas.height = bbox.height + 100; // Add extra space for the legend
      
      // Create an image element
      const img = document.createElement('img');
      
      // When the image loads, draw it to the canvas and create a download link
      img.onload = function() {
        // Fill background with white
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);
        
        // Add the title at the top
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(`Production Day: ${format(productionDayStart, "MMM dd")} 7:00 AM - ${format(productionDayEnd, "MMM dd")} 6:00 AM`, 
                    canvas.width / 2, bbox.height + 30);
        
        // Add color-coded legend below the chart
        selectedTags.forEach((tag, index) => {
          const color = getLineColor(index);
          const displayName = tag.split('.').pop();
          
          // Position the legends in a row
          const legendsPerRow = 3;
          const legendWidth = canvas.width / legendsPerRow;
          const legendX = (index % legendsPerRow) * legendWidth + 20;
          const legendY = bbox.height + 60 + Math.floor(index / legendsPerRow) * 25;
          
          // Draw color box
          ctx.fillStyle = color;
          ctx.fillRect(legendX, legendY - 12, 16, 16);
          
          // Draw text
          ctx.font = '14px Arial';
          ctx.fillStyle = '#333';
          ctx.textAlign = 'left';
          ctx.fillText(displayName, legendX + 25, legendY);
        });
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.download = `chart-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.png`;
        
        // Convert canvas to blob and set as href
        canvas.toBlob(function(blob) {
          downloadLink.href = URL.createObjectURL(blob);
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        });
      };
      
      // Set image source to SVG data URI
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error('Error downloading chart as image:', err);
      alert('Failed to download chart as image. Please try again later.');
    }
  }

  static printChart(chartRef, selectedTags, productionDayStart, productionDayEnd, getLineColor) {
    if (!chartRef.current) return;
    
    const svgElement = chartRef.current.querySelector('svg');
    if (!svgElement) return;
    
    try {
      // Get SVG data
      const svgData = new XMLSerializer().serializeToString(svgElement);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups for this site to print the chart.');
        return;
      }
      
      // Generate the legend HTML
      const legendHtml = this.renderCustomLegendContent(selectedTags, getLineColor);
      
      // Write print-ready HTML to the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Chart</title>
            <style>
              body { 
                margin: 0; 
                padding: 10px; 
                background-color: white; 
                font-family: Arial, sans-serif;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .chart-container { 
                width: 100%; 
                margin: 0 auto; 
                background-color: white;
                page-break-inside: avoid;
              }
              h2 { 
                font-family: Arial, sans-serif; 
                color: #333; 
                margin-bottom: 10px;
                font-size: 16px;
              }
              .svg-container {
                height: 60vh;
                width: 100%;
                overflow: hidden;
              }
              .svg-container svg {
                width: 100% !important;
                height: 100% !important;
                max-height: 60vh;
              }
              .legend-container {
                margin-top: 10px;
                border-top: 1px solid #eaeaea;
                padding-top: 10px;
              }
              h3 {
                font-size: 14px;
                margin-bottom: 5px;
              }
              @media print {
                body { 
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .chart-container {
                  page-break-inside: avoid;
                  break-inside: avoid;
                  display: flex;
                  flex-direction: column;
                  height: 100vh;
                }
                .svg-container {
                  flex: 1;
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
                .legend-container {
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="chart-container">
              <h2>Production Day: ${format(productionDayStart, "MMM dd")} 7:00 AM - ${format(productionDayEnd, "MMM dd")} 6:00 AM</h2>
              <div class="svg-container">
                ${svgData}
              </div>
              <div class="legend-container">
                <h3>Tag Legend</h3>
                ${legendHtml}
              </div>
            </div>
            <script>
              // Wait for SVG to load before printing
              window.onload = function() { 
                // Find and adjust the SVG element
                const svg = document.querySelector('svg');
                if (svg) {
                  // Preserve aspect ratio and ensure it fits in one page
                  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                  svg.style.width = '100%';
                  svg.style.height = '100%';
                  svg.style.maxHeight = '60vh';
                  
                  // Remove any fixed width/height that would prevent responsive scaling
                  svg.removeAttribute('width');
                  svg.removeAttribute('height');
                }
                
                setTimeout(function() {
                  window.print(); 
                  setTimeout(function() {
                    window.close();
                  }, 250);
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('Error preparing chart for printing:', err);
      alert('Failed to print chart. Please try again later.');
    }
  }
}