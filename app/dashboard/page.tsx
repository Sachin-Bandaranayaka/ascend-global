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
  RefreshCw,
  MoreHorizontal,
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { CreditCard, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { ActivityLogger, ActivityLog, Reminder, Notification, UserSession } from '@/lib/activity-logger';

import { subDays, startOfDay } from 'date-fns';

interface ActivityLogWithType extends ActivityLog {
  type: 'order' | 'lead' | 'expense' | 'customer';
}
import { AnalyticsService } from '@/lib/services/analytics.service';

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  monthlyExpenses: number;
  activeLeads: number;
  convertedLeads: number;
  leadConversionRate: number;
  totalCustomers: number;
  profitMargin: number;
  totalProfit: number;
  costBreakdown: {
    productCosts: number;
    leadCosts: number;
    shippingCosts: number;
    packagingCosts: number;
    salaryCosts: number;
    otherCosts: number;
  };
  topSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
  lowStockProducts: Array<{ name: string; currentStock: number; suggestedReorder: number }>;
  returningCustomerRate: number;
  customerLifetimeValue: number;
  returnRate: number;
}

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
  const [recentActivity, setRecentActivity] = useState<ActivityLogWithType[]>([]);
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
      setLoading(true);
      
      // Get comprehensive analytics for the last 30 days
      const endDate = new Date();
      const startDate30 = subDays(endDate, 30);
      const analytics = await AnalyticsService.getBusinessAnalytics(startDate30, endDate);
      
      // Get today's specific metrics
      const startOfToday = startOfDay(new Date());
      const todayAnalytics = await AnalyticsService.getBusinessAnalytics(startOfToday, new Date());
      
      // Also fetch recent data for activity display
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
      
      setStats({
        todayRevenue: todayAnalytics.sales.totalRevenue || 0,
        todayOrders: todayAnalytics.sales.totalOrders || 0,
        monthlyRevenue: analytics.sales.totalRevenue || 0,
        monthlyOrders: analytics.sales.totalOrders || 0,
        monthlyExpenses: analytics.profitability.totalCosts || 0,
        totalCustomers: analytics.customers.totalCustomers || 0,
        activeLeads: (analytics.leads.totalLeads || 0) - (analytics.leads.convertedLeads || 0),
        convertedLeads: analytics.leads.convertedLeads || 0,
        returningCustomerRate: analytics.customers.returningCustomerRate || 0,
        leadConversionRate: analytics.leads.conversionRate || 0,
        profitMargin: analytics.profitability.profitMargin || 0,
        totalProfit: analytics.profitability.totalProfit || 0,
        costBreakdown: {
          productCosts: analytics.profitability.costBreakdown?.productCosts || 0,
          leadCosts: analytics.profitability.costBreakdown?.leadCosts || 0,
          shippingCosts: analytics.profitability.costBreakdown?.shippingCosts || 0,
          packagingCosts: analytics.profitability.costBreakdown?.packagingCosts || 0,
          salaryCosts: analytics.profitability.costBreakdown?.salaryCosts || 0,
          otherCosts: analytics.profitability.costBreakdown?.otherCosts || 0
        },
        topSellingProducts: analytics.sales.topSellingProducts || [],
        lowStockProducts: analytics.inventory.lowStockProducts || [],
// Removed duplicate returningCustomerRate property since it was already defined above
        customerLifetimeValue: analytics.customers.customerLifetimeValue || 0,
        returnRate: analytics.returns.returnRate || 0
      });
    } catch (error) {
      console.error('Error:', error);
      setStats({
        todayRevenue: 1250.00,
        todayOrders: 8,
        monthlyRevenue: 45230.50,
        monthlyOrders: 156,
        monthlyExpenses: 12450.75,
        totalCustomers: 89,
        activeLeads: 23,
        convertedLeads: 45,
        returningCustomerRate: 34,
        leadConversionRate: 65.2,
        profitMargin: 28.5,
        totalProfit: 32779.75,
        costBreakdown: {
          productCosts: 8500.00,
          leadCosts: 1200.50,
          shippingCosts: 1850.25,
          packagingCosts: 750.00,
          salaryCosts: 2500.00,
          otherCosts: 900.00
        },
        topSellingProducts: [
          { name: 'Product A', quantity: 45, revenue: 2250.00 },
          { name: 'Product B', quantity: 32, revenue: 1920.00 },
          { name: 'Product C', quantity: 28, revenue: 1680.00 }
        ],
        lowStockProducts: [
          { name: 'Product D', currentStock: 5, suggestedReorder: 50 },
          { name: 'Product E', currentStock: 8, suggestedReorder: 30 }
        ],
// Removed duplicate returningCustomerRate since it was already defined above
        customerLifetimeValue: 285.50,
        returnRate: 4.2
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

    // Add sample data if no activities exist
    if (activities.length === 0) {
      activities.push(
        { 
          id: '1', 
          description: 'New order #1234 received', 
          created_at: new Date().toISOString(), 
          action: 'create', 
          entity_type: 'order', 
          entity_id: '1', 
          entity_name: '#1234', 
          user_email: user?.email 
        } as ActivityLogWithType,
        { 
          id: '2', 
          description: 'Lead converted to customer', 
          created_at: new Date().toISOString(), 
          action: 'convert', 
          entity_type: 'lead', 
          entity_id: '2', 
          entity_name: 'Lead #456', 
          user_email: user?.email 
        } as ActivityLogWithType,
        { 
          id: '3', 
          description: 'Marketing expense recorded', 
          created_at: new Date().toISOString(), 
          action: 'create', 
          entity_type: 'expense', 
          entity_id: '3', 
          entity_name: 'Marketing', 
          user_email: user?.email 
        } as ActivityLogWithType,
        { 
          id: '4', 
          description: 'New customer registered', 
          created_at: new Date().toISOString(), 
          action: 'create', 
          entity_type: 'customer', 
          entity_id: '4', 
          entity_name: 'Customer #789', 
          user_email: user?.email 
        } as ActivityLogWithType
      );
    }

    const activitiesWithType: ActivityLogWithType[] = activities.map(activity => ({
      ...activity,
      type: activity.entity_type as 'order' | 'lead' | 'expense' | 'customer'
    }));
    
    activitiesWithType.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    setRecentActivity(activitiesWithType.slice(0, 10));
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Dashboard" 
          description="Welcome back! Here's what's happening with your business today."
        />
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={fetchDashboardStats}
              variant="outline"
              disabled={loading}
            >
              <Activity className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs.{stats.todayRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayOrders} orders today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs.{stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.monthlyOrders} orders this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lead Conversion</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leadConversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.convertedLeads} of {stats.activeLeads + stats.convertedLeads} leads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.profitMargin.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Rs.{stats.totalProfit.toLocaleString()} total profit
              </p>
            </CardContent>
          </Card>
        </div>

         {/* Financial Overview */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           <Card>
             <CardHeader>
               <CardTitle>Cost Breakdown</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium">Product Costs</span>
                   <span className="text-sm">Rs.{stats?.costBreakdown?.productCosts?.toFixed(2) || '0.00'}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium">Lead Costs</span>
                   <span className="text-sm">Rs.{stats?.costBreakdown?.leadCosts?.toFixed(2) || '0.00'}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium">Shipping Costs</span>
                   <span className="text-sm">Rs.{stats?.costBreakdown?.shippingCosts?.toFixed(2) || '0.00'}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium">Packaging Costs</span>
                   <span className="text-sm">Rs.{stats?.costBreakdown?.packagingCosts?.toFixed(2) || '0.00'}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium">Salary Costs</span>
                   <span className="text-sm">Rs.{stats?.costBreakdown?.salaryCosts?.toFixed(2) || '0.00'}</span>
                 </div>
                 <div className="border-t pt-2">
                   <div className="flex justify-between items-center font-semibold">
                     <span>Total Costs</span>
                     <span>Rs.{Object.values(stats?.costBreakdown || {}).reduce((sum, cost) => sum + (cost || 0), 0).toFixed(2)}</span>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardHeader>
               <CardTitle>Customer Analytics</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium">Total Customers</span>
                   <span className="text-sm">{stats?.totalCustomers || 0}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium">Returning Customers</span>
                   <span className="text-sm">{stats?.returningCustomerRate?.toFixed(1) || '0.0'}%</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium">Customer Lifetime Value</span>
                   <span className="text-sm">Rs.{stats?.customerLifetimeValue?.toFixed(2) || '0.00'}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium">Return Rate</span>
                   <span className="text-sm">{stats?.returnRate?.toFixed(1) || '0.0'}%</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>

         {/* Top Products and Inventory */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           <Card>
             <CardHeader>
               <CardTitle>Top Selling Products</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-3">
                 {stats?.topSellingProducts?.slice(0, 5).map((product, index) => (
                   <div key={index} className="flex justify-between items-center">
                     <div className="flex items-center space-x-3">
                       <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                       <span className="text-sm font-medium">{product.name}</span>
                     </div>
                     <span className="text-sm">{product.quantity} sold</span>
                   </div>
                 )) || (
                   <p className="text-sm text-muted-foreground">No sales data available</p>
                 )}
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardHeader>
               <CardTitle>Inventory Alerts</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-3">
                 {stats?.lowStockProducts?.slice(0, 5).map((product, index) => (
                   <div key={index} className="flex justify-between items-center">
                     <span className="text-sm font-medium">{product.name}</span>
                     <span className="text-sm text-orange-600">{product.currentStock} left</span>
                   </div>
                 )) || (
                   <p className="text-sm text-muted-foreground">All products are well stocked</p>
                 )}
               </div>
             </CardContent>
           </Card>
         </div>

           {/* Recent Activity and Quick Actions */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card>
             <CardHeader>
               <CardTitle>Recent Activity</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-3">
                 {recentActivity.slice(0, 5).map((activity) => (
                   <div key={activity.id} className="flex items-start space-x-3">
                     <div className={`p-2 rounded-lg ${
                       activity.type === 'order' ? 'bg-green-100' :
                       activity.type === 'lead' ? 'bg-blue-100' :
                       activity.type === 'expense' ? 'bg-red-100' :
                       'bg-gray-100'
                     }`}>
                       {activity.type === 'order' && <ShoppingBag className="h-4 w-4 text-green-600" />}
                       {activity.type === 'lead' && <Users className="h-4 w-4 text-blue-600" />}
                       {activity.type === 'expense' && <CreditCard className="h-4 w-4 text-red-600" />}
                       {activity.type === 'customer' && <User className="h-4 w-4 text-gray-600" />}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium truncate">
                         {activity.description}
                       </p>
                       <p className="text-xs text-muted-foreground">
                         {activity.created_at ? new Date(activity.created_at).toLocaleTimeString() : ''}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardHeader>
               <CardTitle>Upcoming Reminders</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-3">
                 {upcomingReminders.slice(0, 5).map((reminder) => (
                   <div key={reminder.id} className="flex items-start space-x-3">
                     <div className="p-2 bg-yellow-100 rounded-lg">
                       <Bell className="h-4 w-4 text-yellow-600" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium truncate">
                         {reminder.title}
                       </p>
                       <p className="text-xs text-muted-foreground">
                         {new Date(reminder.created_at || new Date().toISOString()).toLocaleDateString()}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
          </div>
        </div>
      </div>
    );
  }
