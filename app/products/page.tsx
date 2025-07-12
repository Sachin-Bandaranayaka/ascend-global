'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { Product } from '@/lib/types';
import { supabase } from '@/lib/supabase';

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
            name: 'Premium Wireless Headphones',
            description: 'High-quality wireless headphones with noise cancellation',
            sku: 'PWH-001',
            cost_price: 45.00,
            selling_price: 89.99,
            stock_quantity: 100,
            is_active: true,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            name: 'Smartphone Case',
            description: 'Protective case for smartphones',
            sku: 'SMC-001',
            cost_price: 5.00,
            selling_price: 19.99,
            stock_quantity: 200,
            is_active: true,
            created_at: '2024-01-20T14:30:00Z',
            updated_at: '2024-01-20T14:30:00Z'
          },
          {
            id: '3',
            name: 'Portable Charger',
            description: '10000mAh portable battery pack',
            sku: 'PCH-001',
            cost_price: 15.00,
            selling_price: 34.99,
            stock_quantity: 5,
            is_active: true,
            created_at: '2024-01-22T11:20:00Z',
            updated_at: '2024-01-22T11:20:00Z'
          }
        ]);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.is_active) ||
                         (statusFilter === 'inactive' && !product.is_active) ||
                         (statusFilter === 'low_stock' && product.stock_quantity < 10);
    
    return matchesSearch && matchesStatus;
  });

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Out of Stock' };
    if (quantity < 10) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Low Stock' };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock' };
  };

  const calculateMargin = (cost: number, selling: number) => {
    return ((selling - cost) / selling * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            </div>
            <Link
              href="/products/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Product
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
              >
                <option value="all">All Products</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="low_stock">Low Stock</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {products.filter(p => p.is_active).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {products.filter(p => p.stock_quantity < 10).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Margin</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {products.length > 0 ? 
                      (products.reduce((sum, p) => sum + ((p.selling_price - p.cost_price) / p.selling_price * 100), 0) / products.length).toFixed(1) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}
            </h2>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Get started by adding your first product.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="mt-6">
                  <Link
                    href="/products/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock_quantity);
                return (
                  <div key={product.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              {!product.is_active && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                                {stockStatus.label}
                              </span>
                            </div>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <span className="mr-4">
                                SKU: {product.sku || 'N/A'}
                              </span>
                              <span className="mr-4">
                                Stock: {product.stock_quantity}
                              </span>
                              <span className="mr-4">
                                Margin: {calculateMargin(product.cost_price, product.selling_price)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${product.selling_price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Cost: ${product.cost_price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/products/${product.id}/edit`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this product?')) {
                                // Handle delete
                                console.log('Delete product:', product.id);
                              }
                            }}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 