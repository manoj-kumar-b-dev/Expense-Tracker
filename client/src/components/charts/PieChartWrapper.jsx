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
import { useCurrency } from '../../hooks/useCurrency';
import { formatAmount } from '../../utils/formatCurrency';

const CustomTooltip = ({ active, payload, displayCurrency }) => {
  if (active && payload && payload.length) {
    const { name, value, payload: dataPayload } = payload[0];
    const origCurr = dataPayload.originalCurrency;
    
    let origStr = '';
    if (origCurr && origCurr !== displayCurrency && dataPayload.originalValue) {
      if (origCurr !== 'Mixed') {
        origStr = ` (${formatAmount(dataPayload.originalValue, origCurr)})`;
      } else {
        origStr = ' (Mixed)';
      }
    }

    return (
      <div className="glass-panel p-3 border border-gray-200/50 dark:border-gray-800/40 text-left space-y-1 shadow-xl bg-white/90 dark:bg-[#161C2A]/90 backdrop-blur-md rounded-xl">
        <p className="text-xs font-bold leading-normal" style={{ color: payload[0].payload.fill || '#6C63FF' }}>
          {name}: <span className="font-extrabold">{formatAmount(value, displayCurrency)}</span>
          {origStr && <span className="text-gray-400 dark:text-gray-500 font-medium block text-[10px] mt-0.5">{origStr}</span>}
        </p>
      </div>
    );
  }
  return null;
};

export const PieChartWrapper = ({ data }) => {
  const { isDarkMode } = useTheme();
  const { displayCurrency } = useCurrency();

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
            content={<CustomTooltip displayCurrency={displayCurrency} />}
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
