'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ArrowLeft,
  Calendar,
  DollarSign,
  ShoppingBag,
  Target,
  Users,
  Package,
  RotateCcw,
  Download,
  TrendingDown
} from 'lucide-react';

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);

  // Mock data for reports
  const reportData = {
    revenue: {
      current: 25670.00,
      previous: 21450.00,
      growth: 19.7
    },
    orders: {
      current: 145,
      previous: 128,
      growth: 13.3
    },
    expenses: {
      current: 12500.00,
      previous: 11200.00,
      growth: 11.6
    },
    profit: {
      current: 13170.00,
      previous: 10250.00,
      growth: 28.5
    },
    leads: {
      total: 156,
      converted: 24,
      conversionRate: 15.4
    },
    customers: {
      total: 127,
      new: 23,
      returning: 45
    }
  };

  const expenseBreakdown = [
    { category: 'Lead Costs', amount: 4200.00, percentage: 33.6 },
    { category: 'Packaging', amount: 2500.00, percentage: 20.0 },
    { category: 'Salaries', amount: 2100.00, percentage: 16.8 },
    { category: 'Shipping Returns', amount: 1800.00, percentage: 14.4 },
    { category: 'Printing', amount: 1200.00, percentage: 9.6 },
    { category: 'Other', amount: 700.00, percentage: 5.6 }
  ];

  const topProducts = [
    { name: 'Premium Wireless Headphones', orders: 45, revenue: 4049.55 },
    { name: 'Portable Charger', orders: 38, revenue: 1329.62 },
    { name: 'Smartphone Case', orders: 32, revenue: 639.68 },
    { name: 'Bluetooth Speaker', orders: 18, revenue: 1079.82 },
    { name: 'Fitness Tracker', orders: 12, revenue: 959.88 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${reportData.revenue.current.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{reportData.revenue.growth}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{reportData.orders.current}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{reportData.orders.growth}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Expenses</p>
                <p className="text-2xl font-semibold text-gray-900">${reportData.expenses.current.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">+{reportData.expenses.growth}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-semibold text-gray-900">${reportData.profit.current.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{reportData.profit.growth}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Profit Margin Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Margin Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gross Revenue</span>
                <span className="text-sm font-medium text-green-600">${reportData.revenue.current.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="text-sm font-medium text-red-600">-${reportData.expenses.current.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">Net Profit</span>
                  <span className="text-base font-semibold text-green-600">${reportData.profit.current.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Profit Margin</span>
                  <span className="text-sm font-medium text-green-600">
                    {((reportData.profit.current / reportData.revenue.current) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Conversion */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Total Leads</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{reportData.leads.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Converted</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{reportData.leads.converted}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                </div>
                <span className="text-sm font-medium text-purple-600">{reportData.leads.conversionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
            <div className="space-y-3">
              {expenseBreakdown.map((expense, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{expense.category}</span>
                      <span className="text-sm text-gray-600">${expense.amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${expense.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 ml-4">{expense.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg inline-block mb-2">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{reportData.customers.total}</p>
              <p className="text-sm text-gray-600">Total Customers</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg inline-block mb-2">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{reportData.customers.new}</p>
              <p className="text-sm text-gray-600">New Customers</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg inline-block mb-2">
                <RotateCcw className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{reportData.customers.returning}</p>
              <p className="text-sm text-gray-600">Returning Customers</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 