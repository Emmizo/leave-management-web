export interface ExportData {
  [key: string]: string | number | boolean | null | { firstName: string; lastName: string };
}

export const exportToCSV = (data: ExportData[], filename: string) => {
  // Convert data to CSV format
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle nested objects and arrays
        if (typeof value === 'object' && value !== null) {
          if ('firstName' in value && 'lastName' in value) {
            return `"${value.firstName} ${value.lastName}"`;
          }
          return `"${JSON.stringify(value)}"`;
        }
        // Escape quotes and wrap in quotes if contains comma
        return value?.toString().includes(',') ? `"${value}"` : value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 