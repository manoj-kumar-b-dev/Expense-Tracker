/**
 * @file ExportButton.jsx
 * @description Dropdown trigger button allowing users to initiate a PDF, Excel, or CSV export.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Download, ChevronDown, FileText, BarChart2, List } from 'lucide-react';
import { Button } from './ui/Button';
import ExportModal from './ExportModal';

export const ExportButton = ({ filters = {}, disabled = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleOptionClick = (format) => {
    setSelectedFormat(format);
    setDropdownOpen(false);
    setModalOpen(true);
  };

  return (
    <div className="relative inline-block text-left export-dropdown-container" ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={disabled}
        title="Export your filtered transactions"
        className="w-full sm:w-auto flex items-center justify-between gap-2 h-10 px-4"
      >
        <span className="flex items-center gap-2">
          <Download className="w-4 h-4 shrink-0" />
          <span>Export Ledger</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white dark:bg-darkBg-card border border-gray-200/50 dark:border-gray-800/40 shadow-xl z-50 py-1.5 focus:outline-none animate-fadeIn">
          {/* Option: PDF */}
          <button
            onClick={() => handleOptionClick('pdf')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-750 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-850/50 transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-danger shrink-0" />
            <span>📄 Export as PDF</span>
          </button>

          {/* Option: Excel */}
          <button
            onClick={() => handleOptionClick('excel')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-750 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-850/50 transition-colors text-left"
          >
            <BarChart2 className="w-4 h-4 text-primary shrink-0" />
            <span>📊 Export as Excel</span>
          </button>

          {/* Option: CSV */}
          <button
            onClick={() => handleOptionClick('csv')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-750 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-850/50 transition-colors text-left"
          >
            <List className="w-4 h-4 text-success shrink-0" />
            <span>📋 Export as CSV</span>
          </button>
        </div>
      )}

      {/* Export Options modal */}
      <ExportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialFormat={selectedFormat}
        initialFilters={filters}
      />
    </div>
  );
};

export default ExportButton;
