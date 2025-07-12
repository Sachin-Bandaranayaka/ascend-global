'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Target, 
  Plus, 
  Search, 
  Filter,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingCart
} from 'lucide-react';
import { Lead } from '@/lib/types';


export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [totalLeadCost, setTotalLeadCost] = useState<string>('0.00');
  const [editingCost, setEditingCost] = useState(false);
  const [tempCost, setTempCost] = useState<string>('0.00');

  useEffect(() => {
    fetchLeads();
    fetchTotalLeadCost();
  }, []);

  const fetchTotalLeadCost = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const result = await response.json();
        setTotalLeadCost(result.total_lead_cost || '0.00');
        setTempCost(result.total_lead_cost || '0.00');
      }
    } catch (error) {
      console.error('Error fetching total lead cost:', error);
    }
  };

  const updateTotalLeadCost = async (newCost: string) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ total_lead_cost: newCost }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setTotalLeadCost(result.total_lead_cost);
        setEditingCost(false);
      } else {
        alert('Failed to update total lead cost');
      }
    } catch (error) {
      console.error('Error updating total lead cost:', error);
      alert('Failed to update total lead cost');
    }
  };

  const handleCostEdit = () => {
    setEditingCost(true);
  };

  const handleCostSave = () => {
    if (tempCost && !isNaN(parseFloat(tempCost))) {
      updateTotalLeadCost(tempCost);
    } else {
      alert('Please enter a valid number');
    }
  };

  const handleCostCancel = () => {
    setTempCost(totalLeadCost);
    setEditingCost(false);
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        console.error('Error fetching leads:', result.error);
        setLeads([]);
      } else {
        setLeads(result.leads || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads?id=${leadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        console.error('Error deleting lead:', result.error);
        alert('Failed to delete lead');
      } else {
        setLeads(leads.filter(lead => lead.id !== leadId));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete lead');
    }
  };

  const convertToOrder = async (lead: Lead) => {
    try {
      // First create customer if not exists
      let customerId = lead.customer_id;
      
      if (!customerId) {
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: lead.lead_name,
            email: lead.email,
            phone: lead.phone,
            address: lead.address,
            city: lead.city,
            state: lead.state,
            country: lead.country,
            postal_code: lead.postal_code,
            is_returning_customer: false,
            total_orders: 0,
            total_spent: 0,
            notes: `Converted from lead: ${lead.notes || ''}`
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.error) {
          console.error('Error creating customer:', result.error);
          alert('Failed to create customer');
          return;
        }
        customerId = result.customer.id;
      }

      // Update lead status and customer_id
      const leadResponse = await fetch(`/api/leads?id=${lead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'converted',
          customer_id: customerId,
          converted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }),
      });

      if (!leadResponse.ok) {
        throw new Error(`HTTP error! status: ${leadResponse.status}`);
      }

      const leadResult = await leadResponse.json();
      
      if (leadResult.error) {
        console.error('Error updating lead:', leadResult.error);
        alert('Failed to update lead status');
        return;
      }

      // Update the local leads state
      setLeads(leads.map(l => l.id === lead.id ? { ...l, status: 'converted', customer_id: customerId } : l));

      // Redirect to create order with customer pre-filled
      window.location.href = `/orders/new?customer_id=${customerId}&lead_id=${lead.id}`;
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Failed to convert lead to order');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'contacted':
        return <Users className="h-4 w-4 text-yellow-500" />;
      case 'qualified':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'converted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'lost':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-purple-100 text-purple-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            </div>
            <div className="flex gap-2">
              <Link
                href="/leads/import"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Import Leads
              </Link>
              <Link
                href="/leads/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Lead
              </Link>
            </div>
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
                placeholder="Search leads..."
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
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-2xl font-semibold text-gray-900">{leads.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Converted</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {leads.filter(l => l.status === 'converted').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {leads.length > 0 ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Target className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Lead Cost</p>
                  {editingCost ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        step="0.01"
                        value={tempCost}
                        onChange={(e) => setTempCost(e.target.value)}
                        className="text-lg font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 w-24"
                        autoFocus
                      />
                      <button
                        onClick={handleCostSave}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCostCancel}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-semibold text-gray-900">
                        Rs.{totalLeadCost}
                      </p>
                      <button
                        onClick={handleCostEdit}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                        title="Edit total lead cost"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredLeads.length} Lead{filteredLeads.length !== 1 ? 's' : ''}
            </h2>
          </div>
          
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Get started by adding your first lead.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="mt-6">
                  <Link
                    href="/leads/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lead
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getStatusIcon(lead.status)}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {lead.lead_name}
                            </p>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <span className="mr-4">
                              {lead.email}
                            </span>
                            <span className="mr-4">
                              {lead.phone}
                            </span>
                            <span className="mr-4">
                              {lead.city}, {lead.state}
                            </span>
                            <span>
                              {new Date(lead.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Rs.{lead.lead_cost.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Lead cost
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/leads/${lead.id}/edit`}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {lead.status !== 'converted' && (
                          <button
                            onClick={() => convertToOrder(lead)}
                            className="text-gray-400 hover:text-green-600"
                            title="Convert to Order"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this lead?')) {
                              deleteLead(lead.id);
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}