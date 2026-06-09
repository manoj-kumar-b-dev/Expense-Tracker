/**
 * @file Modal.jsx
 * @description Premium glassmorphic Modal wrapper.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

/**
 * Custom glassmorphic Modal component.
 * @component Modal
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton = true,
}) => {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* 1. Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* 2. Modal Body */}
      <div className={`relative w-full ${sizeClass} glass-modal p-6 overflow-hidden transition-all duration-300 animate-slideUp`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/50 dark:border-gray-800/40">
          {title && (
            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {title}
            </h3>
          )}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-850 p-1.5 rounded-xl transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mt-4 max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
