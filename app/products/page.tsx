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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  RefreshCw,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Product } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/page-header';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        // Fallback to mock data
        setProducts([
          {
            id: '1',
            name: 'Premium Widget Pro',
            description: 'High-quality widget with advanced features',
            sku: 'PWP-001',
            cost_price: 45.00,
            selling_price: 89.99,
            stock_quantity: 150,
            is_active: true,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            name: 'Standard Widget',
            description: 'Basic widget for everyday use',
            sku: 'SW-002',
            cost_price: 25.00,
            selling_price: 49.99,
            stock_quantity: 75,
            is_active: true,
            created_at: '2024-01-14T14:20:00Z',
            updated_at: '2024-01-14T14:20:00Z'
          },
          {
            id: '3',
            name: 'Deluxe Widget Set',
            description: 'Complete widget set with accessories',
            sku: 'DWS-003',
            cost_price: 80.00,
            selling_price: 159.99,
            stock_quantity: 25,
            is_active: true,
            created_at: '2024-01-13T09:15:00Z',
            updated_at: '2024-01-13T09:15:00Z'
          },
          {
            id: '4',
            name: 'Mini Widget',
            description: 'Compact widget for small spaces',
            sku: 'MW-004',
            cost_price: 15.00,
            selling_price: 29.99,
            stock_quantity: 5,
            is_active: true,
            created_at: '2024-01-12T16:45:00Z',
            updated_at: '2024-01-12T16:45:00Z'
          },
          {
            id: '5',
            name: 'Legacy Widget',
            description: 'Discontinued widget model',
            sku: 'LW-005',
            cost_price: 20.00,
            selling_price: 39.99,
            stock_quantity: 0,
            is_active: false,
            created_at: '2024-01-11T11:30:00Z',
            updated_at: '2024-01-11T11:30:00Z'
          }
        ]);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        setProducts(products.filter(product => product.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = product.is_active;
    else if (statusFilter === 'inactive') matchesStatus = !product.is_active;
    else if (statusFilter === 'low_stock') matchesStatus = product.stock_quantity <= 10;
    
    return matchesSearch && matchesStatus;
  });

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'text-destructive bg-destructive/10 border-destructive/20', icon: <AlertTriangle className="h-3 w-3" /> };
    if (quantity <= 10) return { label: 'Low Stock', color: 'text-warning bg-warning/10 border-warning/20', icon: <AlertTriangle className="h-3 w-3" /> };
    return { label: 'In Stock', color: 'text-success bg-success/10 border-success/20', icon: <CheckCircle className="h-3 w-3" /> };
  };

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const lowStockProducts = products.filter(p => p.stock_quantity <= 10 && p.is_active).length;
  const totalValue = products.reduce((sum, p) => sum + (p.selling_price * p.stock_quantity), 0);

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
        title="Products" 
        description="Manage your product catalog and inventory"
      >
        <button className="p-2 rounded-xl bg-muted hover:bg-secondary transition-colors">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
        <Link href="/products/new" className="btn btn-primary px-4 py-2 text-sm">
          <Plus className="h-4 w-4 mr-2" />
          New Product
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Products</p>
              <p className="text-2xl font-bold text-foreground">{activeProducts}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold text-foreground">{lowStockProducts}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
              <p className="text-2xl font-bold text-foreground">${totalValue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <DollarSign className="h-6 w-6 text-success" />
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
              placeholder="Search products..."
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
              <option value="all">All Products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="low_stock">Low Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">SKU</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Pricing</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Stock</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock_quantity);
                const profitMargin = product.selling_price > 0 ? ((product.selling_price - product.cost_price) / product.selling_price) * 100 : 0;
                
                return (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">{product.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{product.sku}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-foreground">${product.selling_price.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          Cost: ${product.cost_price.toFixed(2)} ({profitMargin.toFixed(1)}% margin)
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{product.stock_quantity}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${stockStatus.color}`}>
                          {stockStatus.icon}
                          {stockStatus.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
                        product.is_active 
                          ? 'text-success bg-success/10 border-success/20' 
                          : 'text-muted-foreground bg-muted border-border'
                      }`}>
                        {product.is_active ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
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
                          onClick={() => deleteProduct(product.id)}
                          className="p-1 rounded-md hover:bg-muted transition-colors text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? "Try adjusting your search or filter criteria" 
                : "Get started by adding your first product"}
            </p>
            <Link href="/products/new" className="btn btn-primary px-4 py-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}