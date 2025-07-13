'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Target, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingCart,
  RefreshCw,
  DollarSign,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { Lead } from '@/lib/types';
import PageHeader from '@/components/page-header';


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

  const handleCostEdit = () => {
    setEditingCost(true);
  };

  const handleCostSave = () => {
    // Save the cost
    setTotalLeadCost(tempCost);
    setEditingCost(false);
  };

  const handleCostCancel = () => {
    setTempCost(totalLeadCost);
    setEditingCost(false);
  };

  const fetchLeads = async () => {
    try {
      // Mock data for now
      setLeads([
        {
          id: '1',
          source: 'Facebook Ads',
          lead_name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1-555-0123',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postal_code: '10001',
          status: 'new',
          lead_cost: 25.50,
          meta_lead_id: 'fb_lead_123',
          meta_click_id: 'click_456',
          notes: 'Interested in premium package',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          source: 'Google Ads',
          lead_name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          phone: '+1-555-0124',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          postal_code: '90210',
          status: 'contacted',
          lead_cost: 18.75,
          notes: 'Requested callback tomorrow',
          created_at: '2024-01-15T14:20:00Z',
          updated_at: '2024-01-15T16:45:00Z'
        },
        {
          id: '3',
          source: 'Website Form',
          lead_name: 'Mike Davis',
          email: 'mike.davis@email.com',
          phone: '+1-555-0125',
          address: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          country: 'USA',
          postal_code: '60601',
          status: 'qualified',
          lead_cost: 0.00,
          notes: 'High-value prospect',
          created_at: '2024-01-14T09:15:00Z',
          updated_at: '2024-01-14T11:30:00Z'
        },
        {
          id: '4',
          source: 'Instagram Ads',
          lead_name: 'Emily Brown',
          email: 'emily.brown@email.com',
          phone: '+1-555-0126',
          address: '321 Elm St',
          city: 'Miami',
          state: 'FL',
          country: 'USA',
          postal_code: '33101',
          status: 'converted',
          lead_cost: 32.25,
          meta_lead_id: 'ig_lead_789',
          notes: 'Converted to order ORD-001',
          created_at: '2024-01-13T16:45:00Z',
          updated_at: '2024-01-14T10:00:00Z',
          converted_at: '2024-01-14T10:00:00Z',
          customer_id: '1'
        },
        {
          id: '5',
          source: 'LinkedIn Ads',
          lead_name: 'Robert Wilson',
          email: 'robert.w@email.com',
          phone: '+1-555-0127',
          address: '654 Maple Ave',
          city: 'Seattle',
          state: 'WA',
          country: 'USA',
          postal_code: '98101',
          status: 'lost',
          lead_cost: 41.00,
          notes: 'Budget constraints',
          created_at: '2024-01-12T11:30:00Z',
          updated_at: '2024-01-13T09:15:00Z'
        }
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLoading(false);
    }
  };

  const deleteLead = async (leadId: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        setLeads(leads.filter(lead => lead.id !== leadId));
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const convertToOrder = async (lead: Lead) => {
    if (confirm(`Convert lead "${lead.lead_name}" to an order?`)) {
      try {
        // Create order logic here
        const orderData = {
          customer_id: lead.customer_id,
          lead_id: lead.id,
          shipping_address: `${lead.address}, ${lead.city}, ${lead.state} ${lead.postal_code}`,
          shipping_city: lead.city,
          shipping_state: lead.state,
          shipping_country: lead.country,
          shipping_postal_code: lead.postal_code,
          shipping_cost: 0,
          notes: `Converted from lead: ${lead.notes || ''}`,
          items: []
        };

        console.log('Creating order:', orderData);
        
        // Update lead status
        setLeads(leads.map(l => 
          l.id === lead.id 
            ? { ...l, status: 'converted', updated_at: new Date().toISOString() }
            : l
        ));
        
        alert('Lead converted to order successfully!');
      } catch (error) {
        console.error('Error converting lead:', error);
        alert('Failed to convert lead to order');
      }
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4" />;
      case 'contacted': return <Phone className="h-4 w-4" />;
      case 'qualified': return <CheckCircle className="h-4 w-4" />;
      case 'converted': return <ShoppingCart className="h-4 w-4" />;
      case 'lost': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'contacted': return 'text-warning bg-warning/10 border-warning/20';
      case 'qualified': return 'text-primary bg-primary/10 border-primary/20';
      case 'converted': return 'text-success bg-success/10 border-success/20';
      case 'lost': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  // Calculate stats
  const totalLeads = leads.length;
  const newLeads = leads.filter(lead => lead.status === 'new').length;
  const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';
  const totalCost = leads.reduce((sum, lead) => sum + lead.lead_cost, 0);

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
        title="Leads" 
        description="Manage and track potential customers"
      >
        <button className="p-2 rounded-xl bg-muted hover:bg-secondary transition-colors">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
        <Link href="/leads/import" className="btn btn-success px-4 py-2 text-sm">
          <Target className="h-4 w-4 mr-2" />
          Import Leads
        </Link>
        <Link href="/leads/new" className="btn btn-primary px-4 py-2 text-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold text-foreground">{totalLeads}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <Target className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Leads</p>
              <p className="text-2xl font-bold text-foreground">{newLeads}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold text-foreground">{conversionRate}%</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold text-foreground">${totalCost.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-xl">
              <DollarSign className="h-6 w-6 text-warning" />
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
              placeholder="Search leads..."
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
              <option value="all">All Leads</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Lead</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Contact</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Source</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Cost</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-foreground">{lead.lead_name}</p>
                      {lead.notes && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{lead.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      {lead.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-xs">{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-foreground">{lead.source}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(lead.status)}`}>
                      {getStatusIcon(lead.status)}
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-foreground">${lead.lead_cost.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link href={`/leads/${lead.id}/edit`} className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Edit className="h-4 w-4" />
                      </Link>
                      {lead.status !== 'converted' && (
                        <button 
                          onClick={() => convertToOrder(lead)}
                          className="p-1 rounded-md hover:bg-muted transition-colors text-success hover:text-success"
                          title="Convert to Order"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteLead(lead.id)}
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

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No leads found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? "Try adjusting your search or filter criteria" 
                : "Get started by adding your first lead"}
            </p>
            <Link href="/leads/new" className="btn btn-primary px-4 py-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}