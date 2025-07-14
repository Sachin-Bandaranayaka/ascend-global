'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Target, FileText, AlertTriangle, BarChart3, PieChart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/ui/page-header';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  totalExpenses: number;
  totalLeads: number;
  conversionRate: number;
  totalCustomers: number;
  totalReturns: number;
  returnRate: number;
  profitMargin: number;
  averageOrderValue: number;
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
  costPerLead: number;
  costPerConversion: number;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [timeRange, user]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const days = parseInt(timeRange);
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      // Use the new analytics service
      const analytics = await AnalyticsService.getBusinessAnalytics(startDate, endDate);
      const trends = await AnalyticsService.getTrendData(days);
      
      setReportData({
        totalRevenue: analytics.sales.totalRevenue,
        totalOrders: analytics.sales.totalOrders,
        totalExpenses: analytics.profitability.totalCosts,
        totalLeads: analytics.leads.totalLeads,
        conversionRate: analytics.leads.conversionRate,
        totalCustomers: analytics.customers.totalCustomers,
        totalReturns: analytics.returns.totalReturns,
        returnRate: analytics.returns.returnRate,
        profitMargin: analytics.profitability.profitMargin,
        averageOrderValue: analytics.sales.averageOrderValue,
        totalProfit: analytics.profitability.totalProfit,
        costBreakdown: analytics.profitability.costBreakdown,
        topSellingProducts: analytics.sales.topSellingProducts,
        lowStockProducts: analytics.inventory.lowStockProducts,
        returningCustomerRate: analytics.customers.returningCustomerRate,
        customerLifetimeValue: analytics.customers.customerLifetimeValue,
        costPerLead: analytics.leads.costPerLead,
        costPerConversion: analytics.leads.costPerConversion
      });
      
      setTrendData(trends);
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Fallback to basic data if analytics service fails
      await fetchBasicReportData();
    } finally {
      setLoading(false);
    }
  };

  const fetchBasicReportData = async () => {
    try {
      const days = parseInt(timeRange);
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      // Fetch basic data as fallback
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString());

      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', format(startDate, 'yyyy-MM-dd'))
        .lte('expense_date', format(endDate, 'yyyy-MM-dd'));

      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString());

      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString());

      const { data: returns } = await supabase
        .from('returns')
        .select('*')
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString());

      // Calculate basic metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalExpenses = expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      const totalLeads = leads?.length || 0;
      const convertedLeads = leads?.filter(lead => lead.status === 'converted').length || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      const totalCustomers = customers?.length || 0;
      const totalReturns = returns?.length || 0;
      const returnRate = totalOrders > 0 ? (totalReturns / totalOrders) * 100 : 0;
      const profit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setReportData({
        totalRevenue,
        totalOrders,
        totalExpenses,
        totalLeads,
        conversionRate,
        totalCustomers,
        totalReturns,
        returnRate,
        profitMargin,
        averageOrderValue,
        totalProfit: profit,
        costBreakdown: {
          productCosts: 0,
          leadCosts: 0,
          shippingCosts: 0,
          packagingCosts: 0,
          salaryCosts: 0,
          otherCosts: totalExpenses
        },
        topSellingProducts: [],
        lowStockProducts: [],
        returningCustomerRate: 0,
        customerLifetimeValue: 0,
        costPerLead: 0,
        costPerConversion: 0
      });
    } catch (error) {
      console.error('Error fetching basic report data:', error);
    }
  };

  const reportCards = [
    {
      title: 'Revenue Report',
      description: 'Track your income and sales performance',
      icon: <DollarSign className="h-6 w-6" />,
      value: reportData?.totalRevenue || 0,
      change: '+12.5%',
      trend: 'up' as const,
      color: 'success'
    },
    {
      title: 'Orders Report',
      description: 'Monitor order volume and trends',
      icon: <ShoppingBag className="h-6 w-6" />,
      value: reportData?.totalOrders || 0,
      change: '+8.2%',
      trend: 'up' as const,
      color: 'primary'
    },
    {
      title: 'Customer Report',
      description: 'Analyze customer acquisition and retention',
      icon: <Users className="h-6 w-6" />,
      value: reportData?.totalCustomers || 0,
      change: '+15.3%',
      trend: 'up' as const,
      color: 'success'
    },
    {
      title: 'Leads Report',
      description: 'Track lead generation and conversion',
      icon: <Target className="h-6 w-6" />,
      value: reportData?.totalLeads || 0,
      change: '-2.1%',
      trend: 'down' as const,
      color: 'warning'
    },
    {
      title: 'Expenses Report',
      description: 'Monitor business costs and spending',
      icon: <FileText className="h-6 w-6" />,
      value: reportData?.totalExpenses || 0,
      change: '+5.7%',
      trend: 'up' as const,
      color: 'destructive'
    },
    {
      title: 'Profit Analysis',
      description: 'Analyze profitability and margins',
      icon: <TrendingUp className="h-6 w-6" />,
      value: reportData?.profitMargin || 0,
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader 
            title="Reports & Analytics" 
            description="Comprehensive business insights and performance metrics"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader 
            title="Reports & Analytics" 
            description="Comprehensive business insights and performance metrics"
          />
          <div className="text-center py-12">
            <p className="text-gray-500">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Reports & Analytics" 
          description="Comprehensive business insights and performance metrics"
        />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={fetchReportData} disabled={loading}>
              <Calendar className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${reportData.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total sales revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Completed orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lead Conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{reportData.totalLeads} total leads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.profitMargin.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">${reportData.totalProfit.toFixed(2)} profit</p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Revenue, costs, and profitability breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Revenue</span>
                <span className="text-lg font-bold text-green-600">${reportData.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Costs</span>
                <span className="text-lg font-bold text-red-600">${reportData.totalExpenses.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Net Profit</span>
                  <span className="text-xl font-bold text-green-600">${reportData.totalProfit.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Product Costs:</span>
                  <span>${reportData.costBreakdown.productCosts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lead Costs:</span>
                  <span>${reportData.costBreakdown.leadCosts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Costs:</span>
                  <span>${reportData.costBreakdown.shippingCosts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Costs:</span>
                  <span>${reportData.costBreakdown.otherCosts.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>Customer behavior and lifetime value</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Customers</span>
                <span className="text-lg font-bold">{reportData.totalCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Returning Rate</span>
                <span className="text-lg font-bold">{reportData.returningCustomerRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg Order Value</span>
                <span className="text-lg font-bold">${reportData.averageOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Customer LTV</span>
                <span className="text-lg font-bold">${reportData.customerLifetimeValue.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Return Rate</span>
                  <span className="text-lg font-bold text-orange-600">{reportData.returnRate.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Lead Performance</CardTitle>
              <CardDescription>Lead generation and conversion metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Leads</span>
                <span className="text-lg font-bold">{reportData.totalLeads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Conversion Rate</span>
                <span className="text-lg font-bold text-green-600">{reportData.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cost per Lead</span>
                <span className="text-lg font-bold">${reportData.costPerLead.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cost per Conversion</span>
                <span className="text-lg font-bold">${reportData.costPerConversion.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products by quantity</CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.topSellingProducts.length > 0 ? (
                <div className="space-y-3">
                  {reportData.topSellingProducts.map((product, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.quantity} units</p>
                      </div>
                      <span className="text-sm font-bold">${product.revenue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No product data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>Low stock products requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {reportData.lowStockProducts.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-red-600">Stock: {product.currentStock}</p>
                      </div>
                      <div className="text-right">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <p className="text-xs text-muted-foreground">Reorder: {product.suggestedReorder}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">All products are well stocked</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trend Charts */}
        {trendData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Sales trend visualization</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Avg daily revenue: ${(trendData.dailySales.reduce((sum: number, day: any) => sum + day.revenue, 0) / trendData.dailySales.length).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Trend</CardTitle>
                <CardDescription>Daily lead generation and conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Lead trend visualization</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Avg daily leads: {(trendData.dailyLeads.reduce((sum: number, day: any) => sum + day.leads, 0) / trendData.dailyLeads.length).toFixed(1)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Trend</CardTitle>
                <CardDescription>Daily profitability analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Profit trend visualization</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Avg daily profit: ${(trendData.dailyProfit.reduce((sum: number, day: any) => sum + day.profit, 0) / trendData.dailyProfit.length).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}