/**
 * @file Analytics.jsx
 * @description Analytics page rendering comparative bars, category distribution pies, and daily trend lines using Recharts adapters.
 */

import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { BarChartWrapper } from '../components/charts/BarChartWrapper';
import { PieChartWrapper } from '../components/charts/PieChartWrapper';
import { LineChartWrapper } from '../components/charts/LineChartWrapper';
import { SkeletonCard } from '../components/ui/Skeleton';
import { BarChart, PieChart, Activity, TrendingUp } from 'lucide-react';

export const Analytics = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const [loading, setLoading] = useState(true);

  // Fetch all analytics datasets on mount
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const [monthlyRes, categoryRes, trendRes] = await Promise.all([
          api.get('/analytics/monthly'),
          api.get('/analytics/category'),
          api.get('/analytics/trend')
        ]);

        setMonthlyData(monthlyRes.data.data);
        setCategoryData(categoryRes.data.data);
        setTrendData(trendRes.data.data);
      } catch (err) {
        console.error('Failed to load charts analytics datasets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn text-left">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Visual Analytics & Trends
        </h2>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Gain deep, interactive insights into your cash flow history and distributions.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Row 1: Line Chart 30-day Trend */}
          <div className="glass-panel p-6 space-y-4 border border-gray-200/50 dark:border-gray-800/40">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200/50 dark:border-gray-800/40">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <div className="leading-none">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                  Cash Flow 30-Day Trend
                </h3>
                <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
                  Daily Income vs Daily Expense
                </span>
              </div>
            </div>
            <LineChartWrapper data={trendData} />
          </div>

          {/* Row 2: Monthly bar & Category pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly comparative bars */}
            <div className="glass-panel p-6 space-y-4 border border-gray-200/50 dark:border-gray-800/40">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200/50 dark:border-gray-800/40">
                <div className="p-2 bg-success/10 text-success rounded-lg">
                  <BarChart className="w-5 h-5" />
                </div>
                <div className="leading-none">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                    Monthly Performance Comparison
                  </h3>
                  <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
                    Net monthly comparisons over past 6 months
                  </span>
                </div>
              </div>
              <BarChartWrapper data={monthlyData} />
            </div>

            {/* Category pie distributions */}
            <div className="glass-panel p-6 space-y-4 border border-gray-200/50 dark:border-gray-800/40">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200/50 dark:border-gray-800/40">
                <div className="p-2 bg-warning/10 text-warning rounded-lg">
                  <PieChart className="w-5 h-5" />
                </div>
                <div className="leading-none">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                    Expense Distribution by Category
                  </h3>
                  <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
                    Monthly segment breakdowns of expenses
                  </span>
                </div>
              </div>
              <PieChartWrapper data={categoryData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
