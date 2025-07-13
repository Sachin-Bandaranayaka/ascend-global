'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Calendar, 
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Target,
  RefreshCw,
  Filter,
  PieChart,
  FileText,
  Eye
} from 'lucide-react';
import { DashboardStats } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/page-header';

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    try {
      // Mock data for demonstration
      setStats({
        todayRevenue: 1250.75,
        todayOrders: 8,
        leadConversionRate: 23.5,
        totalExpenses: 890.50,
        monthlyRevenue: 15420.00,
        monthlyOrders: 156,
        monthlyExpenses: 4250.75,
        profitMargin: 72.4,
        returningCustomers: 45,
        totalCustomers: 234,
        activeLeads: 89,
        convertedLeads: 67
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    {
      title: 'Revenue Report',
      description: 'Track your income and sales performance',
      icon: <DollarSign className="h-6 w-6" />,
      value: stats?.monthlyRevenue || 0,
      change: '+12.5%',
      trend: 'up' as const,
      color: 'success'
    },
    {
      title: 'Orders Report',
      description: 'Monitor order volume and trends',
      icon: <ShoppingBag className="h-6 w-6" />,
      value: stats?.monthlyOrders || 0,
      change: '+8.2%',
      trend: 'up' as const,
      color: 'primary'
    },
    {
      title: 'Customer Report',
      description: 'Analyze customer acquisition and retention',
      icon: <Users className="h-6 w-6" />,
      value: stats?.totalCustomers || 0,
      change: '+15.3%',
      trend: 'up' as const,
      color: 'success'
    },
    {
      title: 'Leads Report',
      description: 'Track lead generation and conversion',
      icon: <Target className="h-6 w-6" />,
      value: stats?.activeLeads || 0,
      change: '-2.1%',
      trend: 'down' as const,
      color: 'warning'
    },
    {
      title: 'Expenses Report',
      description: 'Monitor business costs and spending',
      icon: <FileText className="h-6 w-6" />,
      value: stats?.monthlyExpenses || 0,
      change: '+5.7%',
      trend: 'up' as const,
      color: 'destructive'
    },
    {
      title: 'Profit Analysis',
      description: 'Analyze profitability and margins',
      icon: <TrendingUp className="h-6 w-6" />,
      value: stats?.profitMargin || 0,
      change: '+3.2%',
      trend: 'up' as const,
      color: 'success'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'success': return 'bg-success/10 text-success border-success/20';
      case 'primary': return 'bg-primary/10 text-primary border-primary/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'destructive': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'Revenue Report' || type === 'Expenses Report') {
      return `$${value.toLocaleString()}`;
    }
    if (type === 'Profit Analysis') {
      return `${value.toFixed(1)}%`;
    }
    return value.toString();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Reports" 
        description="Analyze your business performance and trends"
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-10 pr-8 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button className="p-2 rounded-xl bg-muted hover:bg-secondary transition-colors">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="btn btn-primary px-4 py-2 text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </PageHeader>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${stats?.monthlyRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs text-success">+12.5% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{stats?.monthlyOrders}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs text-success">+8.2% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold text-foreground">{stats?.leadConversionRate.toFixed(1)}%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs text-success">+3.1% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-warning/10 rounded-xl">
              <Target className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
              <p className="text-2xl font-bold text-foreground">{stats?.profitMargin.toFixed(1)}%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs text-success">+2.8% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report, index) => (
          <div key={index} className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${getColorClasses(report.color)}`}>
                {report.icon}
              </div>
              <div className="flex items-center gap-1">
                {report.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={`text-sm font-medium ${
                  report.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {report.change}
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">{report.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatValue(report.value, report.title)}
                </p>
              </div>
              <button className="p-2 rounded-lg bg-muted hover:bg-secondary transition-colors">
                <Eye className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors text-left">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Generate Custom Report</p>
              <p className="text-sm text-muted-foreground">Create a detailed report with custom filters</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors text-left">
            <div className="p-2 bg-success/10 rounded-lg">
              <Download className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">Export All Data</p>
              <p className="text-sm text-muted-foreground">Download complete business data as CSV</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors text-left">
            <div className="p-2 bg-warning/10 rounded-lg">
              <PieChart className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-foreground">Analytics Dashboard</p>
              <p className="text-sm text-muted-foreground">View advanced analytics and insights</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}