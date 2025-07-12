'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Package,
  DollarSign,
  BarChart3,
  Save,
  Tag
} from 'lucide-react';
import { CreateProductForm } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateProductForm>({
    name: '',
    description: '',
    sku: '',
    cost_price: 0,
    selling_price: 0,
    stock_quantity: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost_price' || name === 'selling_price' ? parseFloat(value) || 0 :
              name === 'stock_quantity' ? parseInt(value) || 0 : value
    }));
  };

  const generateSKU = () => {
    const prefix = formData.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({
      ...prev,
      sku: `${prefix}-${random}`
    }));
  };

  const calculateMargin = () => {
    if (formData.cost_price > 0 && formData.selling_price > 0) {
      return ((formData.selling_price - formData.cost_price) / formData.selling_price * 100).toFixed(1);
    }
    return '0.0';
  };

  const calculateMarkup = () => {
    if (formData.cost_price > 0 && formData.selling_price > 0) {
      return ((formData.selling_price - formData.cost_price) / formData.cost_price * 100).toFixed(1);
    }
    return '0.0';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // In a real implementation, you would:
      // 1. Create the product in the database
      // 2. Handle validation errors
      // 3. Upload any product images
      // 4. Set up initial stock levels

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          description: formData.description,
          sku: formData.sku,
          cost_price: formData.cost_price,
          selling_price: formData.selling_price,
          stock_quantity: formData.stock_quantity,
          is_active: true
        }])
        .select();

      if (error) {
        console.error('Error creating product:', error);
        // For now, just log and continue - in production you'd show an error message
      } else {
        console.log('Product created successfully:', data);
      }

      // Simulate API call if database fails
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to products page
      router.push('/products');
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/products" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Package className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU (Stock Keeping Unit)
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    placeholder="e.g., PWG-001"
                  />
                  <button
                    type="button"
                    onClick={generateSKU}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 text-sm"
                  >
                    Generate
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="Product description, features, specifications..."
                />
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Pricing Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">What you pay for this product</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">What you sell this product for</p>
              </div>
            </div>
          </div>

          {/* Profit Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Profit Analysis</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Profit per Unit</span>
                  <Tag className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                  ${(formData.selling_price - formData.cost_price).toFixed(2)}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Profit Margin</span>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {calculateMargin()}%
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-800">Markup</span>
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-900 mt-1">
                  {calculateMarkup()}%
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Profit Calculations</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• <strong>Profit Margin:</strong> (Selling Price - Cost Price) ÷ Selling Price × 100</div>
                <div>• <strong>Markup:</strong> (Selling Price - Cost Price) ÷ Cost Price × 100</div>
                <div>• <strong>Total Inventory Value:</strong> ${(formData.cost_price * formData.stock_quantity).toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Product Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Name:</span>
                  <span className="font-medium">{formData.name || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-medium">{formData.sku || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Initial Stock:</span>
                  <span className="font-medium">{formData.stock_quantity} units</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost Price:</span>
                  <span className="font-medium">${formData.cost_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Selling Price:</span>
                  <span className="font-medium">${formData.selling_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit per Unit:</span>
                  <span className="font-medium text-green-600">${(formData.selling_price - formData.cost_price).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/products"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
} 