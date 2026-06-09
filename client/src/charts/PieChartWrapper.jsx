/**
 * @file PieChartWrapper.jsx
 * @description PieChart wrapper to visualize category expense distributions.
 */

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export const PieChartWrapper = ({ data }) => {
  const { isDarkMode } = useTheme();

  // Premium color array for pie sections
  const COLORS = [
    '#6C63FF', // Primary
    '#10B981', // Success
    '#EF4444', // Danger
    '#F59E0B', // Warning
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#14B8A6', // Teal
    '#06B6D4', // Cyan
    '#6B7280'  // Gray
  ];

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm font-semibold text-gray-400">
        No category distribution data available.
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={isDarkMode ? '#161C2A' : '#ffffff'} strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: isDarkMode ? '#161C2A' : '#ffffff',
              border: isDarkMode ? '1px solid #242F41' : '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            layout="horizontal"
            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartWrapper;
