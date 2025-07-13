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
import { supabase } from '@/lib/supabase';

interface ReportData {
  revenue: { current: number; previous: number; growth: number };
  orders: { current: number; previous: number; growth: number };
  expenses: { current: number; previous: number; growth: number };
  profit: { current: number; previous: number; growth: number };
  leads: { total: number; converted: number; conversionRate: number };
  customers: { total: number; new: number; returning: number };
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

interface TopProduct {
  name: string;
  orders: number;
  revenue: number;
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    revenue: { current: 0, previous: 0, growth: 0 },
    orders: { current: 0, previous: 0, growth: 0 },
    expenses: { current: 0, previous: 0, growth: 0 },
    profit: { current: 0, previous: 0, growth: 0 },
    leads: { total: 0, converted: 0, conversionRate: 0 },
    customers: { total: 0, new: 0, returning: 0 }
  });
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const getDateRange = () => {
    const now = new Date();
    const currentStart = new Date();
    const currentEnd = new Date();
    const previousStart = new Date();
    const previousEnd = new Date();

    switch (timeRange) {
      case 'week':
        currentStart.setDate(now.getDate() - 7);
        previousStart.setDate(now.getDate() - 14);
        previousEnd.setDate(now.getDate() - 7);
        break;
      case 'month':
        currentStart.setMonth(now.getMonth() - 1);
        previousStart.setMonth(now.getMonth() - 2);
        previousEnd.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        currentStart.setMonth(now.getMonth() - 3);
        previousStart.setMonth(now.getMonth() - 6);
        previousEnd.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        currentStart.setFullYear(now.getFullYear() - 1);
        previousStart.setFullYear(now.getFullYear() - 2);
        previousEnd.setFullYear(now.getFullYear() - 1);
        break;
    }

    return {
      currentStart: currentStart.toISOString(),
      currentEnd: currentEnd.toISOString(),
      previousStart: previousStart.toISOString(),
      previousEnd: previousEnd.toISOString()
    };
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const { currentStart, currentEnd, previousStart, previousEnd } = getDateRange();

      // Fetch revenue data (from orders)
      const { data: currentOrders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', currentStart)
        .lte('created_at', currentEnd);

      const { data: previousOrders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', previousStart)
        .lte('created_at', previousEnd);

      // Fetch expenses data
      const { data: currentExpenses } = await supabase
        .from('expenses')
        .select('amount, type, created_at')
        .gte('created_at', currentStart)
        .lte('created_at', currentEnd);

      const { data: previousExpenses } = await supabase
        .from('expenses')
        .select('amount, created_at')
        .gte('created_at', previousStart)
        .lte('created_at', previousEnd);

      // Fetch leads data
      const { data: allLeads } = await supabase
        .from('leads')
        .select('status, created_at')
        .gte('created_at', currentStart)
        .lte('created_at', currentEnd);

      // Fetch customers data
      const { data: allCustomers } = await supabase
        .from('customers')
        .select('created_at, total_orders');

      const { data: newCustomers } = await supabase
        .from('customers')
        .select('created_at')
        .gte('created_at', currentStart)
        .lte('created_at', currentEnd);

      // Fetch top products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          quantity,
          total_price,
          products!inner(name),
          orders!inner(created_at)
        `)
        .gte('orders.created_at', currentStart)
        .lte('orders.created_at', currentEnd);

      // Calculate metrics
      const currentRevenue = currentOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const previousRevenue = previousOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      const currentOrderCount = currentOrders?.length || 0;
      const previousOrderCount = previousOrders?.length || 0;
      const orderGrowth = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0;

      const currentExpenseTotal = currentExpenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const previousExpenseTotal = previousExpenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const expenseGrowth = previousExpenseTotal > 0 ? ((currentExpenseTotal - previousExpenseTotal) / previousExpenseTotal) * 100 : 0;

      const currentProfit = currentRevenue - currentExpenseTotal;
      const previousProfit = previousRevenue - previousExpenseTotal;
      const profitGrowth = previousProfit > 0 ? ((currentProfit - previousProfit) / previousProfit) * 100 : 0;

      const totalLeads = allLeads?.length || 0;
      const convertedLeads = allLeads?.filter(lead => lead.status === 'converted').length || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      const totalCustomers = allCustomers?.length || 0;
      const newCustomerCount = newCustomers?.length || 0;
      const returningCustomers = allCustomers?.filter(customer => customer.total_orders > 1).length || 0;

      // Calculate expense breakdown
      const expensesByType = currentExpenses?.reduce((acc, expense) => {
        const type = expense.type || 'other';
        acc[type] = (acc[type] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>) || {};

      const expenseBreakdownData = Object.entries(expensesByType).map(([type, amount]) => ({
        category: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        amount,
        percentage: currentExpenseTotal > 0 ? (amount / currentExpenseTotal) * 100 : 0
      })).sort((a, b) => b.amount - a.amount);

      // Calculate top products
      const productStats = orderItems?.reduce((acc, item) => {
        const productName = item.products?.[0]?.name || 'Unknown Product';
        if (!acc[productName]) {
          acc[productName] = { orders: 0, revenue: 0 };
        }
        acc[productName].orders += item.quantity;
        acc[productName].revenue += item.total_price;
        return acc;
      }, {} as Record<string, { orders: number; revenue: number }>) || {};

      const topProductsData = Object.entries(productStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setReportData({
        revenue: { current: currentRevenue, previous: previousRevenue, growth: revenueGrowth },
        orders: { current: currentOrderCount, previous: previousOrderCount, growth: orderGrowth },
        expenses: { current: currentExpenseTotal, previous: previousExpenseTotal, growth: expenseGrowth },
        profit: { current: currentProfit, previous: previousProfit, growth: profitGrowth },
        leads: { total: totalLeads, converted: convertedLeads, conversionRate },
        customers: { total: totalCustomers, new: newCustomerCount, returning: returningCustomers }
      });

      setExpenseBreakdown(expenseBreakdownData);
      setTopProducts(topProductsData);

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground-secondary">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-foreground-secondary hover:text-foreground" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-card placeholder-muted-foreground"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <button className="btn btn-primary px-4 py-2 flex items-center gap-2">
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
                <p className="text-2xl font-semibold text-gray-900">Rs.{reportData.revenue.current.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  {reportData.revenue.growth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${reportData.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportData.revenue.growth >= 0 ? '+' : ''}{reportData.revenue.growth.toFixed(1)}%
                  </span>
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
                  {reportData.orders.growth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${reportData.orders.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportData.orders.growth >= 0 ? '+' : ''}{reportData.orders.growth.toFixed(1)}%
                  </span>
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
                <p className="text-2xl font-semibold text-gray-900">Rs.{reportData.expenses.current.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  {reportData.expenses.growth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  <span className={`text-sm ${reportData.expenses.growth >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {reportData.expenses.growth >= 0 ? '+' : ''}{reportData.expenses.growth.toFixed(1)}%
                  </span>
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
                <p className="text-2xl font-semibold text-gray-900">Rs.{reportData.profit.current.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  {reportData.profit.growth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${reportData.profit.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportData.profit.growth >= 0 ? '+' : ''}{reportData.profit.growth.toFixed(1)}%
                  </span>
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
                <span className="text-sm font-medium text-green-600">Rs.{reportData.revenue.current.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="text-sm font-medium text-red-600">-Rs.{reportData.expenses.current.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">Net Profit</span>
                  <span className="text-base font-semibold text-green-600">Rs.{reportData.profit.current.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Profit Margin</span>
                  <span className="text-sm font-medium text-green-600">
                    {reportData.revenue.current > 0 ? ((reportData.profit.current / reportData.revenue.current) * 100).toFixed(1) : '0.0'}%
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
                <span className="text-sm font-medium text-purple-600">{reportData.leads.conversionRate.toFixed(1)}%</span>
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
              {expenseBreakdown.length > 0 ? expenseBreakdown.map((expense, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{expense.category}</span>
                      <span className="text-sm text-gray-600">Rs.{expense.amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${expense.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 ml-4">{expense.percentage.toFixed(1)}%</span>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No expense data available for this period</p>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
            <div className="space-y-4">
              {topProducts.length > 0 ? topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Rs.{product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">revenue</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No product data available for this period</p>
              )}
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