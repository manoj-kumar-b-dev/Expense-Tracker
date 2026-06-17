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
import { useCurrency } from '../../hooks/useCurrency';
import { formatAmount } from '../../utils/formatCurrency';

const CustomTooltip = ({ active, payload, label, displayCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-gray-200/50 dark:border-gray-800/40 text-left space-y-1.5 shadow-xl bg-white/90 dark:bg-[#161C2A]/90 backdrop-blur-md rounded-xl">
        <p className="text-xs font-black text-gray-850 dark:text-white mb-1">{label}</p>
        {payload.map((item, index) => {
          const { name, value, dataKey, payload: dataPayload } = item;
          
          let origStr = '';
          if (dataKey === 'income' && dataPayload.incomeOriginal) {
            const origCurr = dataPayload.incomeOriginalCurrency;
            if (origCurr !== displayCurrency && origCurr !== 'Mixed') {
              origStr = ` (${formatAmount(dataPayload.incomeOriginal, origCurr)})`;
            } else if (origCurr === 'Mixed') {
              origStr = ' (Mixed)';
            }
          } else if (dataKey === 'expense' && dataPayload.expenseOriginal) {
            const origCurr = dataPayload.expenseOriginalCurrency;
            if (origCurr !== displayCurrency && origCurr !== 'Mixed') {
              origStr = ` (${formatAmount(dataPayload.expenseOriginal, origCurr)})`;
            } else if (origCurr === 'Mixed') {
              origStr = ' (Mixed)';
            }
          }

          return (
            <p key={index} className="text-xs font-bold leading-normal" style={{ color: item.color || item.fill }}>
              {name}: <span className="font-extrabold">{formatAmount(value, displayCurrency)}</span>
              {origStr && <span className="text-gray-400 dark:text-gray-500 font-medium block text-[10px] mt-0.5">{origStr}</span>}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export const BarChartWrapper = ({ data }) => {
  const { isDarkMode } = useTheme();
  const { displayCurrency } = useCurrency();

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
            tickFormatter={(value) => {
              const formatted = formatAmount(value, displayCurrency);
              const symbolMatch = formatted.match(/^[^\d\s]+/);
              const symbol = symbolMatch ? symbolMatch[0] : '';
              return `${symbol}${value}`;
            }}
          />
          <Tooltip
            cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            content={<CustomTooltip displayCurrency={displayCurrency} />}
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
