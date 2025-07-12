'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingBag, 
  Users, 
  Target,
  ArrowLeft,
  Calendar,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { DashboardStats } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/header';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch data from multiple tables
      const [ordersResult, expensesResult, leadsResult, customersResult] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('leads').select('*'),
        supabase.from('customers').select('*')
      ]);

      if (ordersResult.error || expensesResult.error || leadsResult.error || customersResult.error) {
        console.error('Error fetching dashboard data');
        // Fallback to mock data
      setStats({
        todayRevenue: 1250.50,
        todayOrders: 8,
        leadConversionRate: 15.5,
        totalExpenses: 850.00,
        monthlyRevenue: 25670.00,
        monthlyOrders: 145,
        monthlyExpenses: 12500.00,
        profitMargin: 51.3,
        returningCustomers: 45,
        totalCustomers: 127,
        activeLeads: 23,
        convertedLeads: 12
              });
      } else {
        // Calculate stats from real data
        const orders = ordersResult.data || [];
        const expenses = expensesResult.data || [];
        const leads = leadsResult.data || [];
        const customers = customersResult.data || [];

        const todayRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
        
        setStats({
          todayRevenue,
          todayOrders: orders.length,
          leadConversionRate: leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0,
          totalExpenses,
          monthlyRevenue: todayRevenue, // Simplified for now
          monthlyOrders: orders.length,
          monthlyExpenses: totalExpenses,
          profitMargin: todayRevenue > 0 ? ((todayRevenue - totalExpenses) / todayRevenue) * 100 : 0,
          returningCustomers: customers.filter(c => c.is_returning_customer).length,
          totalCustomers: customers.length,
          activeLeads: leads.filter(lead => ['new', 'contacted', 'qualified'].includes(lead.status)).length,
          convertedLeads
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setStats({
        todayRevenue: 0,
        todayOrders: 0,
        leadConversionRate: 0,
        totalExpenses: 0,
        monthlyRevenue: 0,
        monthlyOrders: 0,
        monthlyExpenses: 0,
        profitMargin: 0,
        returningCustomers: 0,
        totalCustomers: 0,
        activeLeads: 0,
        convertedLeads: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Middleware will redirect to login
  }

  if (!stats) return null;

  const profit = stats.monthlyRevenue - stats.monthlyExpenses;
  const isProfitable = profit > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Dashboard Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <span className="ml-3 text-sm text-gray-500">
                Welcome back, {user.email?.split('@')[0]}!
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">Rs.{stats.todayRevenue.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
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
                <p className="text-sm font-medium text-gray-600">Orders Today</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayOrders}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.3%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Lead Conversion</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.leadConversionRate}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2.1%</span>
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
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-semibold text-gray-900">Rs.{stats.totalExpenses.toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">+5.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profit & Loss Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly P&L Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="text-sm font-medium text-green-600">+Rs.{stats.monthlyRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expenses</span>
                <span className="text-sm font-medium text-red-600">-Rs.{stats.monthlyExpenses.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">Net Profit</span>
                  <div className="flex items-center">
                    {isProfitable ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-base font-semibold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                      Rs.{profit.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Profit Margin</span>
                  <span className={`text-sm font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Total Customers</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.totalCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <RotateCcw className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Returning Customers</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.returningCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600">Active Leads</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.activeLeads}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Converted Leads</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.convertedLeads}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/orders/new"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-600">New Order</span>
                </div>
              </Link>
              
              <Link
                href="/customers/new"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="text-center">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-600">Add Customer</span>
                </div>
              </Link>
              
              <Link
                href="/expenses/new"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
              >
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-600">Add Expense</span>
                </div>
              </Link>
              
              <Link
                href="/products/new"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <div className="text-center">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-600">Add Product</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Low Stock Alert</p>
                  <p className="text-sm text-gray-600">3 products are running low on stock</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Pending Orders</p>
                  <p className="text-sm text-gray-600">5 orders are pending processing</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Monthly Target</p>
                  <p className="text-sm text-gray-600">You're 85% towards your monthly goal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">Order ORD-20240115-0001 delivered</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">New order created from lead</p>
                  <p className="text-sm text-gray-500">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">New customer registered</p>
                  <p className="text-sm text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}