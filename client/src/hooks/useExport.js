/**
 * @file useExport.js
 * @description Custom hook to manage the state and logic for downloading PDF, Excel, and CSV report streams.
 */

import { useState } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Helper to trigger a browser file download from a Blob.
   * @param {Blob} blob - Binary blob content.
   * @param {string} defaultFilename - Fallback filename.
   * @param {string} contentType - Content response header.
   */
  const triggerDownload = (blob, defaultFilename, contentType) => {
    const fileBlob = new Blob([blob], { type: contentType });
    const downloadUrl = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', defaultFilename);
    document.body.appendChild(link);
    link.click();

    // Clean up DOM components
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  };

  /**
   * Universal export runner.
   * @param {string} format - pdf | excel | csv
   * @param {Object} params - Query filters.
   */
  const runExport = async (format, params = {}) => {
    setIsExporting(true);
    setError(null);

    // Map format to route suffix, content-type and filename extension
    const formatConfig = {
      pdf: {
        endpoint: '/transactions/export/pdf',
        contentType: 'application/pdf',
        extension: 'pdf'
      },
      excel: {
        endpoint: '/transactions/export/excel',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: 'xlsx'
      },
      csv: {
        endpoint: '/transactions/export/csv',
        contentType: 'text/csv',
        extension: 'csv'
      }
    };

    const config = formatConfig[format.toLowerCase()];
    if (!config) {
      const errMsg = `Unsupported export format: ${format}`;
      setError(errMsg);
      toast.error(errMsg);
      setIsExporting(false);
      return;
    }

    try {
      const response = await api.get(config.endpoint, {
        params,
        responseType: 'blob' // Explicitly set Axios to expect binary stream
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `expense_report_${timestamp}.${config.extension}`;

      triggerDownload(response.data, filename, config.contentType);
      toast.success(`${format.toUpperCase()} report downloaded successfully!`);
    } catch (err) {
      console.error(`Export failed for format ${format}:`, err);
      
      // Attempt to read error message from Blob if server returned JSON error instead of PDF/Excel
      if (err.response && err.response.data instanceof Blob) {
        try {
          const errorText = await err.response.data.text();
          const errorJson = JSON.parse(errorText);
          const msg = errorJson.message || 'Export generation failed';
          setError(msg);
          toast.error(msg);
          setIsExporting(false);
          return;
        } catch (e) {
          // Fall back to default error text extraction
        }
      }

      const msg = err.response?.data?.message || `Failed to generate ${format.toUpperCase()} export file`;
      setError(msg);
      toast.error(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = (params) => runExport('pdf', params);
  const exportExcel = (params) => runExport('excel', params);
  const exportCSV = (params) => runExport('csv', params);

  return {
    exportPDF,
    exportExcel,
    exportCSV,
    isExporting,
    error
  };
};

export default useExport;
