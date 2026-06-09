/**
 * @file Settings.jsx
 * @description Application settings managing dark/light modes, notification presets, and danger-zone account purges.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axiosInstance';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Sun, Moon, Bell, ShieldAlert, Trash2, ArrowRight } from 'lucide-react';

export const Settings = () => {
  const { logoutUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // 1. Notification checkboxes states
  const [notifyLimit, setNotifyLimit] = useState(() => {
    const saved = localStorage.getItem('notify_limit');
    return saved ? saved === 'true' : true;
  });

  const [notifyWeekly, setNotifyWeekly] = useState(() => {
    const saved = localStorage.getItem('notify_weekly');
    return saved ? saved === 'true' : false;
  });

  // 2. Delete Confirmation Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleNotifyLimitToggle = () => {
    setNotifyLimit((prev) => {
      localStorage.setItem('notify_limit', !prev);
      toast.success('Budget alert notifications updated');
      return !prev;
    });
  };

  const handleNotifyWeeklyToggle = () => {
    setNotifyWeekly((prev) => {
      localStorage.setItem('notify_weekly', !prev);
      toast.success('Weekly report preferences updated');
      return !prev;
    });
  };

  // Danger zone account purging action
  const handlePurgeAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await api.delete('/users/account');
      toast.success(res.data.message || 'Account successfully deleted');
      // Wipe contexts state locally
      await logoutUser();
      setIsOpen(false);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-fadeIn text-left">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Application Preferences
        </h2>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Manage system theme selectors, financial notifications thresholds, and security portals.
        </p>
      </div>

      <div className="space-y-6">
        {/* Card 1: Appearance theme selectors */}
        <div className="glass-panel p-6 space-y-4 border border-gray-200/50 dark:border-gray-800/40">
          <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-200/50 dark:border-gray-800/40 flex items-center gap-2">
            {isDarkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-warning" />}
            <span>Visual Appearance Theme</span>
          </h3>

          <div className="flex items-center justify-between">
            <div className="text-left space-y-1">
              <span className="block text-sm font-bold text-gray-800 dark:text-gray-100">Dark Mode Preference</span>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 max-w-md">
                Enable low-contrast dark mode designs for premium look and easy reading at night.
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className={`w-12 h-6.5 rounded-full flex items-center p-1 transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}
              title="Toggle Theme"
            >
              <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${isDarkMode ? 'translate-x-5.5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Card 2: Notifications checkboxes toggles */}
        <div className="glass-panel p-6 space-y-4 border border-gray-200/50 dark:border-gray-800/40">
          <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-200/50 dark:border-gray-800/40 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span>Alerts & Notifications presets</span>
          </h3>

          <div className="space-y-4">
            {/* Limit notification alerts */}
            <div className="flex items-start justify-between gap-4">
              <div className="text-left space-y-0.5">
                <span className="block text-sm font-bold text-gray-850 dark:text-gray-150">Budget Overspent Alerts</span>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 max-w-sm">
                  Receive instant toast indicators when any category spent exceeds 75% or 90% caps.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifyLimit}
                onChange={handleNotifyLimitToggle}
                className="w-4 h-4 mt-1 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-700 bg-transparent"
                title="Toggle Budget alerts"
              />
            </div>

            {/* Weekly updates */}
            <div className="flex items-start justify-between gap-4 pt-3 border-t border-gray-200/40 dark:border-gray-800/20">
              <div className="text-left space-y-0.5">
                <span className="block text-sm font-bold text-gray-850 dark:text-gray-150">Weekly Flow Recaps</span>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 max-w-sm">
                  Receive weekly aggregate updates displaying balance gains and expense rates.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifyWeekly}
                onChange={handleNotifyWeeklyToggle}
                className="w-4 h-4 mt-1 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-700 bg-transparent"
                title="Toggle Weekly reports"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Danger Zone Account purges */}
        <div className="glass-panel p-6 border border-danger/25 bg-danger/[0.01] space-y-4">
          <h3 className="text-sm font-black text-danger uppercase tracking-wider pb-3 border-b border-danger/20 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-danger animate-bounce" />
            <span>Danger Zone Security Control</span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-left space-y-1">
              <span className="block text-sm font-bold text-gray-850 dark:text-gray-150">Delete Aura Wealth Account</span>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 max-w-md">
                Permanently wipe your account registration, category budget targets, and entire transaction history files. This action cannot be reversed.
              </p>
            </div>

            <Button
              variant="danger"
              onClick={() => setIsOpen(true)}
              className="shrink-0 shadow-lg shadow-danger/10"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Portal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Permanent Account Deletion"
      >
        <div className="space-y-6 text-left">
          <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-normal font-semibold">
              <strong>CRITICAL WARNING:</strong> Deleting your account will wipe your profile configurations, all defined budget caps, and your entire transaction history. All records will be lost forever.
            </div>
          </div>

          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            If you wish to proceed, click the button below to permanently remove all details.
          </p>

          <div className="flex gap-3 justify-end pt-5 border-t border-gray-200/50 dark:border-gray-800/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handlePurgeAccount}
              isLoading={deleteLoading}
            >
              <span>Permanently Delete My Data</span>
              <ArrowRight className="w-4 h-4 shrink-0 ml-1" />
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
