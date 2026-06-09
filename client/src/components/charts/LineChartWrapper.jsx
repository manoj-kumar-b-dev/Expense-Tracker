/**
 * @file LineChartWrapper.jsx
 * @description LineChart wrapper to display daily income vs expense trend curves.
 */

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export const LineChartWrapper = ({ data }) => {
  const { isDarkMode } = useTheme();

  // Dark/Light dependent line configurations
  const strokeColor = isDarkMode ? '#242F41' : '#E2E8F0';
  const labelColor = isDarkMode ? '#9CA3AF' : '#4B5563';

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm font-semibold text-gray-400">
        No transaction trend data available.
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} vertical={false} />
          <XAxis
            dataKey="date"
            stroke={labelColor}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={8}
            className="font-semibold tracking-wide"
          />
          <YAxis
            stroke={labelColor}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dx={-8}
            className="font-semibold tracking-wide"
          />
          <Tooltip
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
          <Line
            type="monotone"
            name="Daily Income"
            dataKey="income"
            stroke="#10B981" // Success (green)
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            name="Daily Expense"
            dataKey="expense"
            stroke="#EF4444" // Danger (red)
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartWrapper;
