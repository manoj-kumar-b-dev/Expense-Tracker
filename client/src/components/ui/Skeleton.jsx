/**
 * @file Skeleton.jsx
 * @description Shimmer skeleton loader placeholders.
 */

import React from 'react';

/**
 * Skeleton shimmering block element.
 * @component Skeleton
 */
export const Skeleton = ({
  className = '',
  variant = 'text', // 'text' | 'rect' | 'circle'
}) => {
  const baseStyle = 'animate-pulse bg-gray-200 dark:bg-gray-800 rounded';

  const variants = {
    text: 'h-4 w-full my-1.5',
    rect: 'h-24 w-full',
    circle: 'h-10 w-10 rounded-full',
  };

  const currentVariant = variants[variant] || variants.text;

  return (
    <div className={`${baseStyle} ${currentVariant} ${className}`} />
  );
};

/**
 * Predefined compound skeleton loaders for card items.
 */
export const SkeletonCard = () => (
  <div className="glass-panel p-5 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" />
      <div className="space-y-1 w-full">
        <Skeleton variant="text" className="w-1/3 h-3" />
        <Skeleton variant="text" className="w-1/2 h-4" />
      </div>
    </div>
    <Skeleton variant="rect" className="h-6 rounded-xl" />
  </div>
);

/**
 * Predefined compound skeleton loaders for table lists.
 */
export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3 w-full">
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="flex gap-4 items-center py-3.5 px-4 glass-card">
        <Skeleton variant="circle" className="w-10 h-10 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton variant="text" className="w-1/4 h-3.5" />
          <Skeleton variant="text" className="w-1/3 h-2.5" />
        </div>
        <Skeleton variant="text" className="w-16 h-4 shrink-0" />
        <Skeleton variant="text" className="w-20 h-8 shrink-0 rounded-lg" />
      </div>
    ))}
  </div>
);

export default Skeleton;
