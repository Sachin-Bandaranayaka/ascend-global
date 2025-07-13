'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Receipt,
  Package,
  Users,
  Truck,
  RefreshCw,
  FileText,
  CreditCard
} from 'lucide-react';
import { Expense } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/page-header';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        // Fallback to mock data
        setExpenses([
          {
            id: '1',
            type: 'packaging',
            description: 'Shipping boxes and bubble wrap',
            amount: 45.50,
            expense_date: '2024-01-15',
            order_id: 'ORD-001',
            receipt_url: '',
            notes: 'Monthly packaging supplies',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            type: 'salary',
            description: 'Employee salaries - January',
            amount: 2500.00,
            expense_date: '2024-01-01',
            notes: 'Monthly payroll',
            created_at: '2024-01-01T09:00:00Z',
            updated_at: '2024-01-01T09:00:00Z'
          },
          {
            id: '3',
            type: 'lead_cost',
            description: 'Facebook Ads campaign',
            amount: 125.75,
            expense_date: '2024-01-14',
            lead_id: 'lead-123',
            notes: 'Q1 marketing campaign',
            created_at: '2024-01-14T14:20:00Z',
            updated_at: '2024-01-14T14:20:00Z'
          },
          {
            id: '4',
            type: 'return_shipping',
            description: 'Return shipping for damaged item',
            amount: 18.00,
            expense_date: '2024-01-13',
            order_id: 'ORD-002',
            notes: 'Customer return - defective product',
            created_at: '2024-01-13T16:45:00Z',
            updated_at: '2024-01-13T16:45:00Z'
          },
          {
            id: '5',
            type: 'other',
            description: 'Office supplies and utilities',
            amount: 89.25,
            expense_date: '2024-01-12',
            notes: 'Monthly office expenses',
            created_at: '2024-01-12T11:30:00Z',
            updated_at: '2024-01-12T11:30:00Z'
          }
        ]);
      } else {
        setExpenses(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        setExpenses(expenses.filter(expense => expense.id !== expenseId));
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || expense.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'packaging': return <Package className="h-4 w-4" />;
      case 'salary': return <Users className="h-4 w-4" />;
      case 'printing': return <FileText className="h-4 w-4" />;
      case 'return_shipping': return <Truck className="h-4 w-4" />;
      case 'lead_cost': return <TrendingUp className="h-4 w-4" />;
      case 'other': return <CreditCard className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'packaging': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'salary': return 'text-primary bg-primary/10 border-primary/20';
      case 'printing': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'return_shipping': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'lead_cost': return 'text-warning bg-warning/10 border-warning/20';
      case 'other': return 'text-muted-foreground bg-muted border-border';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  // Calculate stats
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.expense_date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  }).reduce((sum, expense) => sum + expense.amount, 0);
  
  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.expense_date);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return expenseDate.getMonth() === lastMonth.getMonth() && expenseDate.getFullYear() === lastMonth.getFullYear();
  }).reduce((sum, expense) => sum + expense.amount, 0);

  const avgExpenseAmount = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const monthlyChange = lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

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
        title="Expenses" 
        description="Track and manage business expenses"
      >
        <button className="p-2 rounded-xl bg-muted hover:bg-secondary transition-colors">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
        <Link href="/expenses/new" className="btn btn-primary px-4 py-2 text-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-foreground">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-xl">
              <DollarSign className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-foreground">${thisMonthExpenses.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-xl">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Change</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-foreground">{Math.abs(monthlyChange).toFixed(1)}%</p>
                {monthlyChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-success" />
                )}
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Amount</p>
              <p className="text-2xl font-bold text-foreground">${avgExpenseAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <Receipt className="h-6 w-6 text-muted-foreground" />
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
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background placeholder-muted-foreground"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background"
            >
              <option value="all">All Types</option>
              <option value="packaging">Packaging</option>
              <option value="salary">Salary</option>
              <option value="printing">Printing</option>
              <option value="return_shipping">Return Shipping</option>
              <option value="lead_cost">Lead Cost</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Reference</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-foreground">{expense.description}</p>
                      {expense.notes && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{expense.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(expense.type)}`}>
                      {getTypeIcon(expense.type)}
                      {expense.type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-foreground">${expense.amount.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-muted-foreground">
                      {expense.order_id && (
                        <span className="bg-muted px-2 py-1 rounded text-xs">Order: {expense.order_id}</span>
                      )}
                      {expense.lead_id && (
                        <span className="bg-muted px-2 py-1 rounded text-xs">Lead: {expense.lead_id}</span>
                      )}
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
                        onClick={() => deleteExpense(expense.id)}
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

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No expenses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'all' 
                ? "Try adjusting your search or filter criteria" 
                : "Get started by adding your first expense"}
            </p>
            <Link href="/expenses/new" className="btn btn-primary px-4 py-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}