'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  RefreshCw,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Customer } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/page-header';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching customers:', error);
        // Fallback to mock data
        setCustomers([
          {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1-555-0123',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postal_code: '10001',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
            is_returning_customer: true,
            total_orders: 5,
            total_spent: 1250.75,
            notes: 'VIP customer - premium service'
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            phone: '+1-555-0124',
            address: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            postal_code: '90210',
            created_at: '2024-01-14T14:20:00Z',
            updated_at: '2024-01-14T14:20:00Z',
            is_returning_customer: false,
            total_orders: 1,
            total_spent: 89.99,
            notes: 'First-time buyer'
          },
          {
            id: '3',
            name: 'Bob Johnson',
            email: 'bob.johnson@email.com',
            phone: '+1-555-0125',
            address: '789 Pine St',
            city: 'Chicago',
            state: 'IL',
            country: 'USA',
            postal_code: '60601',
            created_at: '2024-01-13T09:15:00Z',
            updated_at: '2024-01-13T09:15:00Z',
            is_returning_customer: true,
            total_orders: 3,
            total_spent: 567.25,
            notes: 'Prefers express shipping'
          },
          {
            id: '4',
            name: 'Alice Brown',
            email: 'alice.brown@email.com',
            phone: '+1-555-0126',
            address: '321 Elm St',
            city: 'Miami',
            state: 'FL',
            country: 'USA',
            postal_code: '33101',
            created_at: '2024-01-12T16:45:00Z',
            updated_at: '2024-01-12T16:45:00Z',
            is_returning_customer: false,
            total_orders: 2,
            total_spent: 234.50,
            notes: ''
          }
        ]);
      } else {
        setCustomers(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        setCustomers(customers.filter(customer => customer.id !== customerId));
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Calculate stats
  const totalCustomers = customers.length;
  const returningCustomers = customers.filter(customer => customer.is_returning_customer).length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.total_spent, 0);
  const avgOrderValue = totalCustomers > 0 ? (totalRevenue / customers.reduce((sum, customer) => sum + customer.total_orders, 0)) : 0;

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
        title="Customers" 
        description="Manage your customer relationships and data"
      >
        <button className="p-2 rounded-xl bg-muted hover:bg-secondary transition-colors">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
        <Link href="/customers/new" className="btn btn-primary px-4 py-2 text-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold text-foreground">{totalCustomers}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Returning Customers</p>
              <p className="text-2xl font-bold text-foreground">{returningCustomers}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold text-foreground">${avgOrderValue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-xl">
              <ShoppingBag className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background placeholder-muted-foreground"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Contact</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Location</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Orders</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Total Spent</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Date Added</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-foreground">{customer.name}</p>
                      {customer.is_returning_customer && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-success/10 text-success border border-success/20 mt-1">
                          Returning Customer
                        </span>
                      )}
                      {customer.notes && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs mt-1">{customer.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-xs">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{customer.city}, {customer.state}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-foreground">{customer.total_orders}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-foreground">${customer.total_spent.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(customer.created_at).toLocaleDateString()}
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
                        onClick={() => deleteCustomer(customer.id)}
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

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Try adjusting your search criteria" 
                : "Get started by adding your first customer"}
            </p>
            <Link href="/customers/new" className="btn btn-primary px-4 py-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}