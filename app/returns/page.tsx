'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  RotateCcw, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  Package,
  AlertCircle,
  DollarSign,
  TrendingDown,
  Calendar,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Return } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/page-header';

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const { data, error } = await supabase
        .from('returns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching returns:', error);
        // Fallback to mock data
        setReturns([
          {
            id: '1',
            return_number: 'RET-20240115-0001',
            order_id: 'ORD-001',
            customer_id: '1',
            reason: 'Defective product - screen not working',
            status: 'requested',
            return_shipping_cost: 15.00,
            refund_amount: 199.99,
            notes: 'Customer reported issue within 24 hours',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            return_number: 'RET-20240114-0002',
            order_id: 'ORD-002',
            customer_id: '2',
            reason: 'Wrong size ordered',
            status: 'approved',
            return_shipping_cost: 12.00,
            refund_amount: 89.99,
            notes: 'Size exchange requested',
            created_at: '2024-01-14T14:20:00Z',
            updated_at: '2024-01-14T16:45:00Z'
          },
          {
            id: '3',
            return_number: 'RET-20240113-0003',
            order_id: 'ORD-003',
            customer_id: '3',
            reason: 'Product damaged in shipping',
            status: 'in_transit',
            return_shipping_cost: 0.00,
            refund_amount: 149.99,
            notes: 'Free return shipping due to our error',
            created_at: '2024-01-13T09:15:00Z',
            updated_at: '2024-01-13T11:30:00Z'
          },
          {
            id: '4',
            return_number: 'RET-20240112-0004',
            order_id: 'ORD-004',
            customer_id: '4',
            reason: 'Not as described',
            status: 'received',
            return_shipping_cost: 10.00,
            refund_amount: 75.50,
            notes: 'Item received and inspected',
            created_at: '2024-01-12T16:45:00Z',
            updated_at: '2024-01-13T09:00:00Z'
          },
          {
            id: '5',
            return_number: 'RET-20240111-0005',
            order_id: 'ORD-005',
            customer_id: '5',
            reason: 'Changed mind',
            status: 'processed',
            return_shipping_cost: 8.00,
            refund_amount: 125.75,
            notes: 'Refund processed successfully',
            created_at: '2024-01-11T11:30:00Z',
            updated_at: '2024-01-12T10:15:00Z',
            processed_at: '2024-01-12T10:15:00Z'
          }
        ]);
      } else {
        setReturns(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReturn = async (returnId: string) => {
    if (confirm('Are you sure you want to delete this return?')) {
      try {
        setReturns(returns.filter(ret => ret.id !== returnId));
      } catch (error) {
        console.error('Error deleting return:', error);
      }
    }
  };

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.return_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'received': return <Package className="h-4 w-4" />;
      case 'processed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'text-warning bg-warning/10 border-warning/20';
      case 'approved': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in_transit': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'received': return 'text-primary bg-primary/10 border-primary/20';
      case 'processed': return 'text-success bg-success/10 border-success/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  // Calculate stats
  const totalReturns = returns.length;
  const totalRefundAmount = returns.reduce((sum, ret) => sum + ret.refund_amount, 0);
  const totalShippingCost = returns.reduce((sum, ret) => sum + ret.return_shipping_cost, 0);
  const pendingReturns = returns.filter(ret => ['requested', 'approved', 'in_transit'].includes(ret.status)).length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Returns" 
        description="Manage product returns and refunds"
      >
        <button className="p-2 rounded-xl bg-muted hover:bg-secondary transition-colors">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
        <Link href="/returns/new" className="btn btn-primary px-4 py-2 text-sm">
          <Plus className="h-4 w-4 mr-2" />
          Process Return
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Returns</p>
              <p className="text-2xl font-bold text-foreground">{totalReturns}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <RotateCcw className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Returns</p>
              <p className="text-2xl font-bold text-foreground">{pendingReturns}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-xl">
              <Clock className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Refunds</p>
              <p className="text-2xl font-bold text-foreground">${totalRefundAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-xl">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Shipping Costs</p>
              <p className="text-2xl font-bold text-foreground">${totalShippingCost.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <Truck className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background placeholder-muted-foreground"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background"
            >
              <option value="all">All Status</option>
              <option value="requested">Requested</option>
              <option value="approved">Approved</option>
              <option value="in_transit">In Transit</option>
              <option value="received">Received</option>
              <option value="processed">Processed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Returns List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Return</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Order</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Reason</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Refund Amount</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReturns.map((ret) => (
                <tr key={ret.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-foreground">{ret.return_number}</p>
                      {ret.notes && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{ret.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-foreground">{ret.order_id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-foreground truncate max-w-xs">{ret.reason}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(ret.status)}`}>
                      {getStatusIcon(ret.status)}
                      {ret.status.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <span className="font-medium text-foreground">${ret.refund_amount.toFixed(2)}</span>
                      {ret.return_shipping_cost > 0 && (
                        <p className="text-xs text-muted-foreground">+${ret.return_shipping_cost.toFixed(2)} shipping</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(ret.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteReturn(ret.id)}
                        className="p-1 rounded-md hover:bg-muted transition-colors text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReturns.length === 0 && (
          <div className="text-center py-12">
            <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No returns found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? "Try adjusting your search or filter criteria" 
                : "No returns have been processed yet"}
            </p>
            <Link href="/returns/new" className="btn btn-primary px-4 py-2">
              <Plus className="h-4 w-4 mr-2" />
              Process Return
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}