/**
 * @file Button.jsx
 * @description Premium reusable button component.
 */

import React from 'react';

/**
 * Standard visual button component.
 * @component Button
 * @param {Object} props
 * @param {React.ReactNode} props.children - Element internals.
 * @param {string} [props.variant='primary'] - Variant styling: 'primary' | 'secondary' | 'danger' | 'warning' | 'outline' | 'ghost'.
 * @param {string} [props.size='md'] - Sizing: 'sm' | 'md' | 'lg'.
 * @param {boolean} [props.isLoading=false] - If true, lock clicks and render spinner.
 * @param {boolean} [props.disabled=false] - Lock clicks.
 * @param {string} [props.className=''] - Overriding style classes.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-darkBg active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/20 focus:ring-primary',
    secondary: 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 focus:ring-gray-400',
    danger: 'bg-danger hover:bg-danger-light text-white shadow-lg shadow-danger/20 focus:ring-danger',
    warning: 'bg-warning hover:bg-warning-light text-white shadow-lg shadow-warning/20 focus:ring-warning',
    outline: 'border border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-primary',
    ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-850/50 focus:ring-gray-300',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${currentVariant} ${currentSize} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
export default Button;
