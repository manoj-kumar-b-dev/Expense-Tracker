/**
 * @file Sidebar.jsx
 * @description Sidebar layout displaying links to routes, dark/light toggle controls, and logout keys.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  ReceiptText,
  PlusCircle,
  BarChart3,
  PiggyBank,
  User,
  Settings,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logoutUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ReceiptText },
    { name: 'Add Transaction', path: '/transactions/add', icon: PlusCircle },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Budgets', path: '/budget', icon: PiggyBank },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/45 dark:bg-black/60 backdrop-blur-xs md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40
          w-64 bg-white/80 dark:bg-darkBg-card/85 backdrop-blur-md
          border-r border-gray-200/50 dark:border-gray-800/40
          flex flex-col justify-between py-6 px-4
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 px-3">
            <div className="bg-primary p-2.5 rounded-xl shadow-md shadow-primary/30 flex items-center justify-center">
              <span className="text-white text-lg font-black tracking-wider leading-none">A</span>
            </div>
            <div className="text-left leading-none">
              <span className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">Aura Wealth</span>
              <span className="block text-[9px] font-bold text-primary dark:text-primary-light mt-0.5 tracking-wider uppercase">Fintech SaaS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200
                    ${isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <IconComponent className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer actions: Theme switch and logout */}
        <div className="space-y-2.5 pt-4 border-t border-gray-200/50 dark:border-gray-800/40">
          {/* Theme switch button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold tracking-wide text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
          >
            <span className="flex items-center gap-3">
              {isDarkMode ? <Sun className="w-5 h-5 text-warning" /> : <Moon className="w-5 h-5 text-primary" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </span>
            <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}>
              <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Logout button */}
          <button
            onClick={logoutUser}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold tracking-wide text-danger dark:text-danger/90 hover:bg-danger/10 dark:hover:bg-danger/10 hover:text-danger-dark transition-all duration-200"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
