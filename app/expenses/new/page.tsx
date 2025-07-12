'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface ExpenseFormData {
  description: string
  amount: number
  category: string
  expense_date: string
  supplier_id: string
  receipt_number: string
  notes: string
}

interface Supplier {
  id: string
  name: string
  email: string
  phone: string
}

export default function NewExpensePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: 0,
    category: '',
    expense_date: new Date().toISOString().split('T')[0],
    supplier_id: '',
    receipt_number: '',
    notes: ''
  })

  const expenseCategories = [
    'Office Supplies',
    'Marketing & Advertising',
    'Software & Technology',
    'Travel & Transportation',
    'Utilities',
    'Rent & Facilities',
    'Professional Services',
    'Insurance',
    'Equipment & Hardware',
    'Inventory & Stock',
    'Shipping & Logistics',
    'Training & Development',
    'Legal & Compliance',
    'Banking & Finance',
    'Other'
  ]

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, email, phone')
        .order('name')

      if (error) {
        console.error('Error fetching suppliers:', error)
        // Mock data fallback
        setSuppliers([
          { id: '1', name: 'Office Depot', email: 'orders@officedepot.com', phone: '+1-555-0101' },
          { id: '2', name: 'Amazon Business', email: 'business@amazon.com', phone: '+1-555-0102' },
          { id: '3', name: 'Facebook Ads', email: 'billing@facebook.com', phone: '+1-555-0103' },
          { id: '4', name: 'Google Ads', email: 'billing@google.com', phone: '+1-555-0104' },
          { id: '5', name: 'Shopify', email: 'billing@shopify.com', phone: '+1-555-0105' }
        ])
      } else {
        setSuppliers(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      // Mock data fallback
      setSuppliers([
        { id: '1', name: 'Office Depot', email: 'orders@officedepot.com', phone: '+1-555-0101' },
        { id: '2', name: 'Amazon Business', email: 'business@amazon.com', phone: '+1-555-0102' },
        { id: '3', name: 'Facebook Ads', email: 'billing@facebook.com', phone: '+1-555-0103' },
        { id: '4', name: 'Google Ads', email: 'billing@google.com', phone: '+1-555-0104' },
        { id: '5', name: 'Shopify', email: 'billing@shopify.com', phone: '+1-555-0105' }
      ])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...formData,
          supplier_id: formData.supplier_id || null
        }])

      if (error) {
        console.error('Error creating expense:', error)
        alert('Error creating expense. Please try again.')
      } else {
        alert('Expense created successfully!')
        router.push('/expenses')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating expense. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">New Expense</h1>
            <button
              onClick={() => router.push('/expenses')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Expenses
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="Brief description of the expense"
                  required
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Category and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  required
                >
                  <option value="">Select a category</option>
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expense_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Date *
                </label>
                <input
                  type="date"
                  id="expense_date"
                  name="expense_date"
                  value={formData.expense_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Supplier and Receipt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <select
                  id="supplier_id"
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                >
                  <option value="">Select a supplier (optional)</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="receipt_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt/Invoice Number
                </label>
                <input
                  type="text"
                  id="receipt_number"
                  name="receipt_number"
                  value={formData.receipt_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="Receipt or invoice number"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="Additional notes about this expense..."
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expense Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Description:</span>
                  <span className="ml-2 text-gray-900">{formData.description || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <span className="ml-2 text-gray-900 font-semibold">${formData.amount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 text-gray-900">{formData.category || 'Not selected'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 text-gray-900">{formData.expense_date}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/expenses')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
