/**
 * @file Input.jsx
 * @description Custom React Input element integrated with React.forwardRef for React Hook Form.
 */

import React, { forwardRef } from 'react';

/**
 * Custom text input field component.
 * @component Input
 */
export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full text-left space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={`
            glass-input
            ${Icon ? 'pl-11' : 'pl-4'}
            ${error ? 'border-danger dark:border-danger/70 focus:border-danger focus:ring-danger' : 'border-gray-200 dark:border-gray-800 focus:border-primary'}
            text-sm text-gray-800 dark:text-gray-200 bg-white/40 dark:bg-darkBg-card/35
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-danger font-medium tracking-wide flex items-center gap-1 mt-1 leading-none animate-fadeIn">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
