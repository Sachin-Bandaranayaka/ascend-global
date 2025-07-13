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
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  RotateCcw,
  Plus,
  ArrowUpRight,
  UserCheck,
  Calendar,
  Bell,
  Activity,
  PieChart,
  BarChart3,
  Sparkles,
  Star,
  Zap,
  ArrowRight,
  TrendingDownIcon,
  Eye,
  RefreshCw
} from 'lucide-react';
import { DashboardStats } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { ActivityLogger, ActivityLog, Reminder, Notification, UserSession } from '@/lib/activity-logger';

// Simple Chart Components
const ProgressRing = ({ percentage, size = 120, strokeWidth = 8, color = 'primary' }: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'stroke-primary';
      case 'success': return 'stroke-success';
      case 'warning': return 'stroke-warning';
      case 'destructive': return 'stroke-destructive';
      case 'accent': return 'stroke-accent';
      default: return 'stroke-primary';
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`${getColorClass(color)} transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{percentage}%</span>
      </div>
    </div>
  );
};

const MiniBarChart = ({ data, color = 'primary' }: {
  data: number[];
  color?: string;
}) => {
  const max = Math.max(...data);
  const getColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-primary';
      case 'success': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'destructive': return 'bg-destructive';
      case 'accent': return 'bg-accent';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="flex items-end space-x-1 h-12">
      {data.map((value, index) => (
        <div
          key={index}
          className={`w-2 ${getColorClass(color)} rounded-t-sm transition-all duration-500 ease-out`}
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  );
};

const MiniLineChart = ({ data, color = 'primary' }: {
  data: number[];
  color?: string;
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const getColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'stroke-primary';
      case 'success': return 'stroke-success';
      case 'warning': return 'stroke-warning';
      case 'destructive': return 'stroke-destructive';
      case 'accent': return 'stroke-accent';
      default: return 'stroke-primary';
    }
  };

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="48" viewBox="0 0 100 100" className="overflow-visible">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
        className={`${getColorClass(color)} transition-all duration-500 ease-out`}
      />
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="2"
            fill="currentColor"
            className={`${getColorClass(color)} transition-all duration-500 ease-out`}
          />
        );
      })}
    </svg>
  );
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserSession[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [recentReturns, setRecentReturns] = useState<any[]>([]);

  // Sample data for charts
  const [salesData] = useState([45, 52, 38, 67, 73, 81, 69, 76, 85, 92, 78, 88]);
  const [revenueData] = useState([12000, 15000, 11000, 18000, 22000, 25000, 19000, 24000, 28000, 32000, 26000, 30000]);
  const [conversionData] = useState([23, 28, 31, 26, 35, 42, 38, 45, 52, 48, 55, 61]);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      fetchRecentActivity();
      fetchUpcomingReminders();
      fetchNotifications();
      fetchActiveUsers();
      updateUserSession();
    }
  }, [user]);

  const updateUserSession = async () => {
    if (!user?.email) return;
    
    await ActivityLogger.updateUserSession({
      user_email: user.email,
      user_name: user.email.split('@')[0],
      user_role: 'admin',
      status: 'active'
    });
  };

  const fetchDashboardStats = async () => {
    try {
      const [ordersResult, expensesResult, leadsResult, customersResult, returnsResult] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('returns').select('*').order('created_at', { ascending: false })
      ]);

      const orders = ordersResult.data || [];
      const expenses = expensesResult.data || [];
      const leads = leadsResult.data || [];
      const customers = customersResult.data || [];
      const returns = returnsResult.data || [];

      setRecentOrders(orders.slice(0, 5));
      setRecentLeads(leads.slice(0, 5));
      setRecentExpenses(expenses.slice(0, 5));
      setRecentReturns(returns.slice(0, 5));

      const todayRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
      const pendingLeads = leads.filter(lead => ['new', 'contacted', 'qualified'].includes(lead.status)).length;
      
      setStats({
        todayRevenue,
        todayOrders: orders.length,
        leadConversionRate: leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0,
        totalExpenses,
        monthlyRevenue: todayRevenue,
        monthlyOrders: orders.length,
        monthlyExpenses: totalExpenses,
        profitMargin: todayRevenue > 0 ? ((todayRevenue - totalExpenses) / todayRevenue) * 100 : 0,
        returningCustomers: customers.filter(c => c.is_returning_customer).length,
        totalCustomers: customers.length,
        activeLeads: pendingLeads,
        convertedLeads
      });
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

  const fetchRecentActivity = async () => {
    try {
      const activities = await ActivityLogger.getRecentActivities(10);
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      generateActivityFromExistingData();
    }
  };

  const generateActivityFromExistingData = () => {
    const activities: ActivityLog[] = [];
    
    recentOrders.forEach((order, index) => {
      activities.push({
        id: `order-${index}`,
        action: 'create',
        entity_type: 'order',
        entity_id: order.id,
        entity_name: order.order_number,
        description: `New order ${order.order_number} created`,
        created_at: order.created_at,
        user_email: user?.email
      });
    });

    recentLeads.forEach((lead, index) => {
      if (lead.status === 'converted') {
        activities.push({
          id: `lead-${index}`,
          action: 'convert',
          entity_type: 'lead',
          entity_id: lead.id,
          entity_name: lead.lead_name,
          description: `Lead ${lead.lead_name} converted to customer`,
          created_at: lead.updated_at || lead.created_at,
          user_email: user?.email
        });
      }
    });

    recentExpenses.forEach((expense, index) => {
      activities.push({
        id: `expense-${index}`,
        action: 'create',
        entity_type: 'expense',
        entity_id: expense.id,
        entity_name: expense.description,
        description: `New ${expense.category} expense added: ${expense.description}`,
        created_at: expense.created_at,
        user_email: user?.email
      });
    });

    recentReturns.forEach((returnItem, index) => {
      activities.push({
        id: `return-${index}`,
        action: 'create',
        entity_type: 'return',
        entity_id: returnItem.id,
        entity_name: returnItem.return_number,
        description: `Return ${returnItem.return_number} processed`,
        created_at: returnItem.created_at,
        user_email: user?.email
      });
    });

    activities.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    setRecentActivity(activities.slice(0, 10));
  };

  const fetchUpcomingReminders = async () => {
    try {
      const reminders = await ActivityLogger.getUpcomingReminders(10);
      setUpcomingReminders(reminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      const sampleReminders: Reminder[] = [
        {
          id: '1',
          title: 'Follow up with qualified leads',
          description: 'Contact leads that have been qualified but not yet converted',
          reminder_type: 'lead_followup',
          priority: 'high',
          status: 'pending',
          due_date: new Date().toISOString(),
          due_time: '14:00:00',
          user_email: user?.email || 'admin@example.com'
        },
        {
          id: '2',
          title: 'Review monthly expenses',
          description: 'Review and categorize all expenses from the past month',
          reminder_type: 'expense_review',
          priority: 'normal',
          status: 'pending',
          due_date: new Date().toISOString(),
          due_time: '16:00:00',
          user_email: user?.email || 'admin@example.com'
        }
      ];
      setUpcomingReminders(sampleReminders);
    }
  };

  const fetchNotifications = async () => {
    if (!user?.email) return;
    
    try {
      const notifications = await ActivityLogger.getNotifications(user.email, 10);
      setNotifications(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          title: 'New order received',
          message: 'A new order has been placed and requires processing',
          type: 'info',
          category: 'order',
          is_read: false,
          user_email: user?.email || 'admin@example.com',
          created_at: new Date().toISOString()
        }
      ];
      setNotifications(sampleNotifications);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const users = await ActivityLogger.getActiveUsers(10);
      setActiveUsers(users);
    } catch (error) {
      console.error('Error fetching active users:', error);
      const sampleUsers: UserSession[] = [
        {
          id: '1',
          user_email: user?.email || 'admin@example.com',
          user_name: user?.email?.split('@')[0] || 'Admin',
          user_role: 'admin',
          status: 'active',
          last_activity: new Date().toISOString()
        }
      ];
      setActiveUsers(sampleUsers);
    }
  };

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case 'order': return ShoppingBag;
      case 'lead': return Target;
      case 'expense': return DollarSign;
      case 'return': return RotateCcw;
      case 'customer': return Users;
      default: return Activity;
    }
  };

  const getActivityColor = (entityType: string) => {
    switch (entityType) {
      case 'order': return 'bg-primary';
      case 'lead': return 'bg-success';
      case 'expense': return 'bg-destructive';
      case 'return': return 'bg-warning';
      case 'customer': return 'bg-accent';
      default: return 'bg-muted-foreground';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatReminderTime = (dueDate: string, dueTime?: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today ${dueTime || ''}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${dueTime || ''}`;
    } else {
      return `${date.toLocaleDateString()} ${dueTime || ''}`;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!stats) return null;

  const profit = stats.monthlyRevenue - stats.monthlyExpenses;
  const isProfitable = profit > 0;

  return (
    <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-foreground-secondary mt-1">Welcome back! Here's what's happening with your business today.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-xl bg-muted hover:bg-secondary transition-colors">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </button>
              <Link href="/orders/new" className="btn btn-primary px-4 py-2 text-sm">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Link>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue Card */}
            <div className="card group hover:shadow-lg transition-all duration-300">
              <div className="card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-right">
                    <MiniLineChart data={revenueData.slice(-7)} color="primary" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-foreground">Rs.{stats.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-sm text-success flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5% from last month
                  </p>
                </div>
              </div>
            </div>

            {/* Orders Card */}
            <div className="card group hover:shadow-lg transition-all duration-300">
              <div className="card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-success/10 rounded-xl">
                    <ShoppingBag className="h-6 w-6 text-success" />
                  </div>
                  <div className="text-right">
                    <MiniBarChart data={salesData.slice(-7)} color="success" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{stats.monthlyOrders}</p>
                  <p className="text-sm text-success flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2% from last month
                  </p>
                </div>
              </div>
            </div>

            {/* Conversion Rate Card */}
            <div className="card group hover:shadow-lg transition-all duration-300">
              <div className="card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-accent/10 rounded-xl">
                    <Target className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="text-right">
                    <MiniLineChart data={conversionData.slice(-7)} color="accent" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold text-foreground">{stats.leadConversionRate.toFixed(1)}%</p>
                  <p className="text-sm text-success flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3.1% from last week
                  </p>
                </div>
              </div>
            </div>

            {/* Profit Margin Card */}
            <div className="card group hover:shadow-lg transition-all duration-300">
              <div className="card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${isProfitable ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <BarChart3 className={`h-6 w-6 ${isProfitable ? 'text-success' : 'text-destructive'}`} />
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${isProfitable ? 'text-success' : 'text-destructive'}`}>
                      {isProfitable ? '+' : ''}{stats.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold text-foreground">Rs.{profit.toLocaleString()}</p>
                  <p className={`text-sm flex items-center mt-1 ${isProfitable ? 'text-success' : 'text-destructive'}`}>
                    {isProfitable ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {isProfitable ? 'Profitable' : 'Loss'} this month
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trend Chart */}
            <div className="lg:col-span-2 card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Revenue Trend</h3>
                    <p className="text-sm text-muted-foreground">Monthly revenue over the last 12 months</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-content">
                <div className="h-64 flex items-end justify-between space-x-2">
                  {revenueData.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-primary rounded-t-lg transition-all duration-500 ease-out hover:bg-primary-hover"
                        style={{ height: `${(value / Math.max(...revenueData)) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">
                        {new Date(2024, index).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Jan 2024</span>
                  <span className="text-muted-foreground">Dec 2024</span>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-foreground">Performance Overview</h3>
                <p className="text-sm text-muted-foreground">Key metrics at a glance</p>
              </div>
              <div className="card-content space-y-6">
                {/* Lead Conversion */}
                <div className="text-center">
                  <ProgressRing percentage={Math.round(stats.leadConversionRate)} color="primary" />
                  <p className="text-sm font-medium text-foreground mt-2">Lead Conversion</p>
                  <p className="text-xs text-muted-foreground">{stats.convertedLeads} of {stats.activeLeads + stats.convertedLeads} leads</p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-foreground">Active Leads</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{stats.activeLeads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm text-foreground">Customers</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{stats.totalCustomers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-sm text-foreground">Returns</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{recentReturns.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                  </div>
                  <Link href="/activity" className="text-sm text-primary hover:text-primary-hover flex items-center">
                    View all <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {recentActivity.slice(0, 6).map((activity, index) => {
                    const IconComponent = getActivityIcon(activity.entity_type);
                    return (
                      <div key={activity.id || index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <div className={`p-2 rounded-lg ${getActivityColor(activity.entity_type)}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.created_at || '')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upcoming Reminders */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-warning" />
                    <h3 className="text-lg font-semibold text-foreground">Upcoming Reminders</h3>
                  </div>
                  <Link href="/reminders" className="text-sm text-primary hover:text-primary-hover flex items-center">
                    View all <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  {upcomingReminders.slice(0, 4).map((reminder) => (
                    <div key={reminder.id} className="p-3 bg-muted rounded-lg hover:bg-secondary transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground">{reminder.title}</h4>
                        {(reminder.priority === 'high' || reminder.priority === 'urgent') && (
                          <span className="flex items-center text-xs text-destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {reminder.priority === 'urgent' ? 'Urgent' : 'High'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{reminder.description}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatReminderTime(reminder.due_date!, reminder.due_time)}
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/reminders" className="btn btn-secondary w-full mt-4 text-sm">
                  View All Reminders
                </Link>
              </div>
            </div>
          </div>
    </div>
  );
}
