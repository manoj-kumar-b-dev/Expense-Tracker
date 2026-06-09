/**
 * @file BarChartWrapper.jsx
 * @description BarChart wrapper for monthly income vs expense analytics.
 */

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export const BarChartWrapper = ({ data }) => {
  const { isDarkMode } = useTheme();

  // Dark/Light Theme dependent colors
  const strokeColor = isDarkMode ? '#242F41' : '#E2E8F0';
  const labelColor = isDarkMode ? '#9CA3AF' : '#4B5563';

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm font-semibold text-gray-400">
        No monthly trend data available.
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} vertical={false} />
          <XAxis
            dataKey="monthName"
            stroke={labelColor}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
            className="font-bold tracking-wide"
          />
          <YAxis
            stroke={labelColor}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-8}
            className="font-bold tracking-wide"
          />
          <Tooltip
            cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            contentStyle={{
              background: isDarkMode ? '#161C2A' : '#ffffff',
              border: isDarkMode ? '1px solid #242F41' : '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 'bold' }}
          />
          <Bar
            name="Income"
            dataKey="income"
            fill="#10B981" // Success shade
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
          />
          <Bar
            name="Expense"
            dataKey="expense"
            fill="#EF4444" // Danger shade
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartWrapper;
