'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Calendar,
  RefreshCw,
  Truck
} from 'lucide-react';
import { PurchaseInvoice } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/page-header';

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseInvoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_invoices')
        .select('*')
        .order('invoice_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching purchase orders:', error);
        // Fallback to mock data
        setPurchaseOrders([
          {
            id: '1',
            invoice_number: 'PO-20240115-0001',
            supplier_name: 'ABC Supplies Co.',
            supplier_email: 'orders@abcsupplies.com',
            supplier_phone: '+1-555-0100',
            total_amount: 1250.75,
            invoice_date: '2024-01-15',
            due_date: '2024-02-15',
            status: 'pending',
            notes: 'Monthly inventory restocking',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            invoice_number: 'PO-20240114-0002',
            supplier_name: 'XYZ Materials Ltd.',
            supplier_email: 'billing@xyzmaterials.com',
            supplier_phone: '+1-555-0101',
            total_amount: 890.50,
            invoice_date: '2024-01-14',
            due_date: '2024-02-14',
            status: 'paid',
            notes: 'Raw materials for production',
            created_at: '2024-01-14T14:20:00Z',
            updated_at: '2024-01-14T14:20:00Z',
            paid_at: '2024-01-16T09:30:00Z'
          },
          {
            id: '3',
            invoice_number: 'PO-20240113-0003',
            supplier_name: 'Global Packaging Inc.',
            supplier_email: 'sales@globalpackaging.com',
            supplier_phone: '+1-555-0102',
            total_amount: 345.25,
            invoice_date: '2024-01-13',
            due_date: '2024-01-28',
            status: 'overdue',
            notes: 'Packaging materials - urgent',
            created_at: '2024-01-13T09:15:00Z',
            updated_at: '2024-01-13T09:15:00Z'
          },
          {
            id: '4',
            invoice_number: 'PO-20240112-0004',
            supplier_name: 'Tech Solutions Pro',
            supplier_email: 'support@techsolutions.com',
            supplier_phone: '+1-555-0103',
            total_amount: 2100.00,
            invoice_date: '2024-01-12',
            due_date: '2024-02-12',
            status: 'paid',
            notes: 'Software licenses and equipment',
            created_at: '2024-01-12T16:45:00Z',
            updated_at: '2024-01-12T16:45:00Z',
            paid_at: '2024-01-15T11:00:00Z'
          }
        ]);
      } else {
        setPurchaseOrders(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePurchaseOrder = async (purchaseOrderId: string) => {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      try {
        setPurchaseOrders(purchaseOrders.filter(po => po.id !== purchaseOrderId));
      } catch (error) {
        console.error('Error deleting purchase order:', error);
      }
    }
  };

  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    const matchesSearch = po.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-warning bg-warning/10 border-warning/20';
      case 'paid': return 'text-success bg-success/10 border-success/20';
      case 'overdue': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  // Calculate stats
  const totalAmount = purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0);
  const pendingAmount = purchaseOrders.filter(po => po.status === 'pending').reduce((sum, po) => sum + po.total_amount, 0);
  const paidAmount = purchaseOrders.filter(po => po.status === 'paid').reduce((sum, po) => sum + po.total_amount, 0);
  const overdueAmount = purchaseOrders.filter(po => po.status === 'overdue').reduce((sum, po) => sum + po.total_amount, 0);

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
        title="Purchase Orders" 
        description="Manage supplier invoices and purchase orders"
      >
        <button className="p-2 rounded-xl bg-muted hover:bg-secondary transition-colors">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
        <Link href="/purchase-orders/new" className="btn btn-primary px-4 py-2 text-sm">
          <Plus className="h-4 w-4 mr-2" />
          New Purchase Order
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-foreground">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">${pendingAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-xl">
              <Clock className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold text-foreground">${paidAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-foreground">${overdueAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-destructive" />
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
              placeholder="Search purchase orders..."
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
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Purchase Orders List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Invoice</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Supplier</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Due Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPurchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-foreground">{po.invoice_number}</p>
                      {po.notes && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{po.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-foreground">{po.supplier_name}</p>
                      {po.supplier_email && (
                        <p className="text-sm text-muted-foreground">{po.supplier_email}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(po.status)}`}>
                      {getStatusIcon(po.status)}
                      {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-foreground">${po.total_amount.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {po.due_date ? new Date(po.due_date).toLocaleDateString() : 'No due date'}
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
                        onClick={() => deletePurchaseOrder(po.id)}
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

        {filteredPurchaseOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No purchase orders found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? "Try adjusting your search or filter criteria" 
                : "Get started by creating your first purchase order"}
            </p>
            <Link href="/purchase-orders/new" className="btn btn-primary px-4 py-2">
              <Plus className="h-4 w-4 mr-2" />
              Create Purchase Order
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}