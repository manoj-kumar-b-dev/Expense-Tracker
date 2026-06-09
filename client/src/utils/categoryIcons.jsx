/**
 * @file categoryIcons.jsx
 * @description Mapping database category labels to Lucide SVG components and custom style sheets.
 */

import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Tv,
  FileText,
  HeartPulse,
  GraduationCap,
  DollarSign,
  Briefcase,
  HelpCircle
} from 'lucide-react';

/**
 * Returns an icon metadata object including background colors, text colors, and the React Icon element itself.
 * @param {string} categoryName - Category database field label.
 * @returns {Object} Metadata mapping styling classes and matching Lucide element.
 */
export const getCategoryMeta = (categoryName) => {
  const normalized = categoryName ? categoryName.trim().toLowerCase() : 'other';

  const defaultIcon = {
    icon: HelpCircle,
    bg: 'bg-gray-100 dark:bg-gray-800/60',
    color: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200/50 dark:border-gray-700/50'
  };

  const dictionary = {
    food: {
      icon: Utensils,
      bg: 'bg-orange-100 dark:bg-orange-950/40',
      color: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200/40 dark:border-orange-900/40'
    },
    transport: {
      icon: Car,
      bg: 'bg-blue-100 dark:bg-blue-950/40',
      color: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200/40 dark:border-blue-900/40'
    },
    shopping: {
      icon: ShoppingBag,
      bg: 'bg-pink-100 dark:bg-pink-950/40',
      color: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-200/40 dark:border-pink-900/40'
    },
    entertainment: {
      icon: Tv,
      bg: 'bg-purple-100 dark:bg-purple-950/40',
      color: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200/40 dark:border-purple-900/40'
    },
    bills: {
      icon: FileText,
      bg: 'bg-rose-100 dark:bg-rose-950/40',
      color: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-200/40 dark:border-rose-900/40'
    },
    healthcare: {
      icon: HeartPulse,
      bg: 'bg-emerald-100 dark:bg-emerald-950/40',
      color: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200/40 dark:border-emerald-900/40'
    },
    education: {
      icon: GraduationCap,
      bg: 'bg-indigo-100 dark:bg-indigo-950/40',
      color: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200/40 dark:border-indigo-900/40'
    },
    salary: {
      icon: DollarSign,
      bg: 'bg-teal-100 dark:bg-teal-950/40',
      color: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-200/40 dark:border-teal-900/40'
    },
    freelance: {
      icon: Briefcase,
      bg: 'bg-cyan-100 dark:bg-cyan-950/40',
      color: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-200/40 dark:border-cyan-900/40'
    },
    other: defaultIcon
  };

  return dictionary[normalized] || defaultIcon;
};

/**
 * Renders a circular styled category badge.
 * @component CategoryIconBadge
 * @param {Object} props
 * @param {string} props.category - Category string.
 * @param {string} [props.size='md'] - Badge scale ('sm', 'md', 'lg').
 */
export const CategoryIconBadge = ({ category, size = 'md' }) => {
  const meta = getCategoryMeta(category);
  const IconComponent = meta.icon;

  const sizeClasses = {
    sm: 'w-7 h-7 p-1.5',
    md: 'w-10 h-10 p-2.5',
    lg: 'w-12 h-12 p-3'
  };

  return (
    <div className={`rounded-xl flex items-center justify-center border ${meta.bg} ${meta.color} ${meta.border} ${sizeClasses[size]}`}>
      <IconComponent className="w-full h-full" />
    </div>
  );
};
