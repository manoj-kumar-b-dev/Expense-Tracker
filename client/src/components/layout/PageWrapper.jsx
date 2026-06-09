/**
 * @file PageWrapper.jsx
 * @description Orchestrates the layout structure, rendering responsive Sidebar, Navbar, and inner pages alongside premium background blur backdrops.
 */

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export const PageWrapper = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-darkBg text-gray-900 dark:text-gray-100 flex transition-colors duration-300 relative overflow-hidden">
      {/* Premium ambient glow backdrops (visible in dark mode primarily) */}
      <div className="glow-primary -top-40 -left-40 w-96 h-96 opacity-30 dark:opacity-40" />
      <div className="glow-success top-1/2 -right-40 w-[450px] h-[450px] opacity-25 dark:opacity-30" />

      {/* 1. Sidebar layout */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* 2. Main content viewport */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 min-h-screen">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Content panel */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-fadeIn overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageWrapper;
