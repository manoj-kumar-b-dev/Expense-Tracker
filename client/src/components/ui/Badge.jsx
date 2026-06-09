/**
 * @file Badge.jsx
 * @description Glassmorphism styled pills badges for categorical items.
 */

import React from 'react';

/**
 * Custom glassmorphism badge pills.
 * @component Badge
 */
export const Badge = ({
  children,
  variant = 'default', // 'default' | 'success' | 'danger' | 'warning' | 'primary'
  className = '',
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-xs transition-all duration-200';

  const variants = {
    default: 'bg-gray-100/50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-700/50',
    primary: 'bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/25 border-primary/20 dark:border-primary/30',
    success: 'bg-success/10 dark:bg-success/20 text-success hover:bg-success/25 border-success/20 dark:border-success/30',
    danger: 'bg-danger/10 dark:bg-danger/20 text-danger hover:bg-danger/25 border-danger/20 dark:border-danger/30',
    warning: 'bg-warning/10 dark:bg-warning/20 text-warning hover:bg-warning/25 border-warning/20 dark:border-warning/30',
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <span className={`${baseStyle} ${currentVariant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
