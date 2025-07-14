import { supabase } from '../supabase';
import { DashboardStats } from '../types';

// Enhanced analytics service for comprehensive business intelligence
export class AnalyticsService {
  
  // Calculate comprehensive profit for an order
  static async calculateOrderProfit(orderId: string): Promise<{
    revenue: number;
    costs: {
      productCost: number;
      leadCost: number;
      shippingCost: number;
      packagingCost: number;
      salaryCost: number;
      otherCosts: number;
      totalCosts: number;
    };
    profit: number;
    profitMargin: number;
  }> {
    try {
      // Get order details with items and lead info
      const { data: order } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, products(*)),
          leads(lead_cost)
        `)
        .eq('id', orderId)
        .single();

      if (!order) throw new Error('Order not found');

      const revenue = order.total_amount || 0;
      
      // Calculate product costs from order items
      const productCost = order.order_items?.reduce((sum: number, item: any) => {
        return sum + (item.products?.cost_price || 0) * item.quantity;
      }, 0) || 0;

      // Get lead cost
      const leadCost = order.leads?.lead_cost || 0;

      // Get shipping cost
      const shippingCost = order.shipping_cost || 0;

      // Get order-specific expenses (packaging, salary, etc.)
      const { data: orderExpenses } = await supabase
        .from('expenses')
        .select('amount, category')
        .eq('order_id', orderId);

      const packagingCost = orderExpenses?.filter(e => e.category === 'packaging')
        .reduce((sum, e) => sum + e.amount, 0) || 0;
      
      const salaryCost = orderExpenses?.filter(e => e.category === 'salary')
        .reduce((sum, e) => sum + e.amount, 0) || 0;
      
      const otherCosts = orderExpenses?.filter(e => !['packaging', 'salary'].includes(e.category))
        .reduce((sum, e) => sum + e.amount, 0) || 0;

      const totalCosts = productCost + leadCost + shippingCost + packagingCost + salaryCost + otherCosts;
      const profit = revenue - totalCosts;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        revenue,
        costs: {
          productCost,
          leadCost,
          shippingCost,
          packagingCost,
          salaryCost,
          otherCosts,
          totalCosts
        },
        profit,
        profitMargin
      };
    } catch (error) {
      console.error('Error calculating order profit:', error);
      throw error;
    }
  }

  // Get comprehensive business analytics for a date range
  static async getBusinessAnalytics(startDate: Date, endDate: Date): Promise<{
    sales: {
      totalRevenue: number;
      totalOrders: number;
      averageOrderValue: number;
      topSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
    };
    leads: {
      totalLeads: number;
      convertedLeads: number;
      conversionRate: number;
      totalLeadCost: number;
      costPerLead: number;
      costPerConversion: number;
    };
    customers: {
      totalCustomers: number;
      returningCustomers: number;
      returningCustomerRate: number;
      customerLifetimeValue: number;
    };
    returns: {
      totalReturns: number;
      returnRate: number;
      totalReturnCost: number;
      topReturnReasons: Array<{ reason: string; count: number }>;
    };
    profitability: {
      totalProfit: number;
      profitMargin: number;
      totalCosts: number;
      costBreakdown: {
        productCosts: number;
        leadCosts: number;
        shippingCosts: number;
        packagingCosts: number;
        salaryCosts: number;
        otherCosts: number;
      };
    };
    inventory: {
      lowStockProducts: Array<{ name: string; currentStock: number; suggestedReorder: number }>;
      totalInventoryValue: number;
      fastMovingProducts: Array<{ name: string; salesVelocity: number }>;
    };
  }> {
    try {
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();

      // Get orders data
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, products(*)),
          leads(lead_cost),
          customers(*)
        `)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .neq('status', 'cancelled');

      // Get leads data
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);

      // Get returns data
      const { data: returns } = await supabase
        .from('returns')
        .select('*')
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);

      // Get expenses data
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', startDate.toISOString().split('T')[0])
        .lte('expense_date', endDate.toISOString().split('T')[0]);

      // Get all products for inventory analysis
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // Calculate sales metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate top selling products
      const productSales = new Map();
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const productName = item.products?.name || 'Unknown';
          const existing = productSales.get(productName) || { quantity: 0, revenue: 0 };
          productSales.set(productName, {
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.total_price
          });
        });
      });
      
      const topSellingProducts = Array.from(productSales.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Calculate lead metrics
      const totalLeads = leads?.length || 0;
      const convertedLeads = leads?.filter(lead => lead.status === 'converted').length || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      const totalLeadCost = leads?.reduce((sum, lead) => sum + (lead.lead_cost || 0), 0) || 0;
      const costPerLead = totalLeads > 0 ? totalLeadCost / totalLeads : 0;
      const costPerConversion = convertedLeads > 0 ? totalLeadCost / convertedLeads : 0;

      // Calculate customer metrics
      const customerIds = new Set(orders?.map(order => order.customer_id).filter(Boolean));
      const totalCustomers = customerIds.size;
      const returningCustomers = orders?.filter(order => order.customers?.is_returning_customer).length || 0;
      const returningCustomerRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
      const customerLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

      // Calculate return metrics
      const totalReturns = returns?.length || 0;
      const returnRate = totalOrders > 0 ? (totalReturns / totalOrders) * 100 : 0;
      const totalReturnCost = returns?.reduce((sum, ret) => sum + (ret.return_shipping_cost || 0) + (ret.refund_amount || 0), 0) || 0;
      
      const returnReasons = new Map();
      returns?.forEach(ret => {
        const reason = ret.reason || 'Unknown';
        returnReasons.set(reason, (returnReasons.get(reason) || 0) + 1);
      });
      
      const topReturnReasons = Array.from(returnReasons.entries())
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate cost breakdown
      const productCosts = orders?.reduce((sum, order) => {
        return sum + (order.order_items?.reduce((itemSum: number, item: any) => {
          return itemSum + (item.products?.cost_price || 0) * item.quantity;
        }, 0) || 0);
      }, 0) || 0;

      const leadCosts = totalLeadCost;
      const shippingCosts = orders?.reduce((sum, order) => sum + (order.shipping_cost || 0), 0) || 0;
      
      const packagingCosts = expenses?.filter(e => e.category === 'packaging')
        .reduce((sum, e) => sum + e.amount, 0) || 0;
      
      const salaryCosts = expenses?.filter(e => e.category === 'salary')
        .reduce((sum, e) => sum + e.amount, 0) || 0;
      
      const otherCosts = expenses?.filter(e => !['packaging', 'salary', 'lead_cost'].includes(e.category))
        .reduce((sum, e) => sum + e.amount, 0) || 0;

      const totalCosts = productCosts + leadCosts + shippingCosts + packagingCosts + salaryCosts + otherCosts;
      const totalProfit = totalRevenue - totalCosts;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      // Calculate inventory metrics
      const lowStockProducts = products?.filter(product => (product.stock_quantity || 0) < 10)
        .map(product => ({
          name: product.name,
          currentStock: product.stock_quantity || 0,
          suggestedReorder: Math.max(50, (product.stock_quantity || 0) * 2) // Simple reorder logic
        })) || [];

      const totalInventoryValue = products?.reduce((sum, product) => {
        return sum + (product.cost_price * (product.stock_quantity || 0));
      }, 0) || 0;

      // Calculate sales velocity for fast-moving products
      const fastMovingProducts = topSellingProducts.map(product => ({
        name: product.name,
        salesVelocity: product.quantity / Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) // units per day
      })).slice(0, 5);

      return {
        sales: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          topSellingProducts
        },
        leads: {
          totalLeads,
          convertedLeads,
          conversionRate,
          totalLeadCost,
          costPerLead,
          costPerConversion
        },
        customers: {
          totalCustomers,
          returningCustomers,
          returningCustomerRate,
          customerLifetimeValue
        },
        returns: {
          totalReturns,
          returnRate,
          totalReturnCost,
          topReturnReasons
        },
        profitability: {
          totalProfit,
          profitMargin,
          totalCosts,
          costBreakdown: {
            productCosts,
            leadCosts,
            shippingCosts,
            packagingCosts,
            salaryCosts,
            otherCosts
          }
        },
        inventory: {
          lowStockProducts,
          totalInventoryValue,
          fastMovingProducts
        }
      };
    } catch (error) {
      console.error('Error getting business analytics:', error);
      throw error;
    }
  }

  // Get trend data for charts
  static async getTrendData(days: number = 30): Promise<{
    dailySales: Array<{ date: string; revenue: number; orders: number }>;
    dailyLeads: Array<{ date: string; leads: number; conversions: number }>;
    dailyProfit: Array<{ date: string; profit: number; margin: number }>;
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      const dailySales = [];
      const dailyLeads = [];
      const dailyProfit = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        // Get daily orders
        const { data: dayOrders } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDate.toISOString())
          .neq('status', 'cancelled');
        
        const dayRevenue = dayOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        const dayOrderCount = dayOrders?.length || 0;
        
        dailySales.push({
          date: dateStr,
          revenue: dayRevenue,
          orders: dayOrderCount
        });
        
        // Get daily leads
        const { data: dayLeads } = await supabase
          .from('leads')
          .select('status')
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDate.toISOString());
        
        const dayLeadCount = dayLeads?.length || 0;
        const dayConversions = dayLeads?.filter(lead => lead.status === 'converted').length || 0;
        
        dailyLeads.push({
          date: dateStr,
          leads: dayLeadCount,
          conversions: dayConversions
        });
        
        // Calculate daily profit (simplified)
        const dayProfit = dayRevenue * 0.3; // Rough estimate, should be calculated properly
        const dayMargin = dayRevenue > 0 ? (dayProfit / dayRevenue) * 100 : 0;
        
        dailyProfit.push({
          date: dateStr,
          profit: dayProfit,
          margin: dayMargin
        });
      }
      
      return {
        dailySales,
        dailyLeads,
        dailyProfit
      };
    } catch (error) {
      console.error('Error getting trend data:', error);
      throw error;
    }
  }

  // Add settings for business parameters
  static async updateBusinessSettings(settings: {
    defaultPackagingCost?: number;
    defaultSalaryCostPerOrder?: number;
    defaultLeadCost?: number;
    lowStockThreshold?: number;
    targetProfitMargin?: number;
  }): Promise<void> {
    try {
      const settingsToUpdate = [
        { key: 'default_packaging_cost', value: settings.defaultPackagingCost?.toString() },
        { key: 'default_salary_cost_per_order', value: settings.defaultSalaryCostPerOrder?.toString() },
        { key: 'default_lead_cost', value: settings.defaultLeadCost?.toString() },
        { key: 'low_stock_threshold', value: settings.lowStockThreshold?.toString() },
        { key: 'target_profit_margin', value: settings.targetProfitMargin?.toString() }
      ].filter(setting => setting.value !== undefined);

      for (const setting of settingsToUpdate) {
        await supabase
          .from('settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            description: `Business setting: ${setting.key.replace(/_/g, ' ')}`
          }, { onConflict: 'key' });
      }
    } catch (error) {
      console.error('Error updating business settings:', error);
      throw error;
    }
  }

  // Get business settings
  static async getBusinessSettings(): Promise<{
    defaultPackagingCost: number;
    defaultSalaryCostPerOrder: number;
    defaultLeadCost: number;
    lowStockThreshold: number;
    targetProfitMargin: number;
  }> {
    try {
      const { data: settings } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'default_packaging_cost',
          'default_salary_cost_per_order', 
          'default_lead_cost',
          'low_stock_threshold',
          'target_profit_margin'
        ]);

      const settingsMap = new Map(settings?.map(s => [s.key, parseFloat(s.value) || 0]) || []);
      
      return {
        defaultPackagingCost: settingsMap.get('default_packaging_cost') || 5.0,
        defaultSalaryCostPerOrder: settingsMap.get('default_salary_cost_per_order') || 10.0,
        defaultLeadCost: settingsMap.get('default_lead_cost') || 2.0,
        lowStockThreshold: settingsMap.get('low_stock_threshold') || 10,
        targetProfitMargin: settingsMap.get('target_profit_margin') || 30.0
      };
    } catch (error) {
      console.error('Error getting business settings:', error);
      return {
        defaultPackagingCost: 5.0,
        defaultSalaryCostPerOrder: 10.0,
        defaultLeadCost: 2.0,
        lowStockThreshold: 10,
        targetProfitMargin: 30.0
      };
    }
  }
}