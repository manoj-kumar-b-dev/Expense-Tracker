/**
 * @file Navbar.jsx
 * @description Header Navbar displaying active page context and logged-in user avatar triggers.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, User as UserIcon } from 'lucide-react';

export const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Extract page title based on active path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/transactions') return 'Transactions Ledger';
    if (path === '/transactions/add') return 'Add Transaction';
    if (path === '/analytics') return 'Analytics & Trends';
    if (path === '/budget') return 'Budget Controls';
    if (path === '/recurring') return 'Recurring Rules';
    if (path === '/profile') return 'My Profile';
    if (path === '/settings') return 'Preferences & Settings';
    return 'Aura Wealth';
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-white/70 dark:bg-darkBg/60 backdrop-blur-md border-b border-gray-200/40 dark:border-gray-800/30 px-6 py-4 flex items-center justify-between">
      {/* Left side: Toggler & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 md:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight animate-fadeIn leading-none">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right side: User card */}
      {user && (
        <div className="flex items-center gap-3 p-1.5 pl-3.5 pr-2 rounded-2xl bg-white/45 dark:bg-darkBg-card/45 border border-gray-200/30 dark:border-gray-800/30 backdrop-blur-xs">
          <div className="text-right hidden sm:block leading-none">
            <span className="block text-xs font-bold text-gray-800 dark:text-gray-200 tracking-wide">
              {user.name}
            </span>
            <span className="block text-[9px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5 tracking-wider uppercase">
              Currency: {user.currency || 'USD'}
            </span>
          </div>

          {/* User profile picture */}
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-xl object-cover border border-primary/20 dark:border-primary-light/20 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 dark:border-primary-light/25 flex items-center justify-center text-primary dark:text-primary-light">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
