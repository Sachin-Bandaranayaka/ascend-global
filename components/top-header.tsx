'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, MessageSquare, Settings, User, Plus, Calendar, FileText, Users } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { ActivityLogger, Notification } from '../lib/activity-logger';
import { supabase } from '@/lib/supabase';
import { debounce } from 'lodash';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
}

interface Lead {
  id: string;
  lead_name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface SearchResults {
  customers: Customer[];
  orders: Order[];
  leads: Lead[];
  products: Product[];
}

export default function TopHeader() {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({
    customers: [],
    orders: [],
    leads: [],
    products: []
  });
  const [showSearchResults, setShowSearchResults] = useState(false);

  const performSearch = debounce(async (term: string) => {
    if (!term) {
      setSearchResults({ customers: [], orders: [], leads: [], products: [] });
      return;
    }

    try {
      const [customersRes, ordersRes, leadsRes, productsRes] = await Promise.all([
        supabase
          .from('customers')
          .select('id, name, email')
          .ilike('name', `%${term}%`)
          .limit(5),
        supabase
          .from('orders')
          .select('id, order_number, status')
          .ilike('order_number', `%${term}%`)
          .limit(5),
        supabase
          .from('leads')
          .select('id, lead_name, email')
          .ilike('lead_name', `%${term}%`)
          .limit(5),
        supabase
          .from('products')
          .select('id, name, sku')
          .ilike('name', `%${term}%`)
          .limit(5)
      ]);

      setSearchResults({
        customers: customersRes.data || [],
        orders: ordersRes.data || [],
        leads: leadsRes.data || [],
        products: productsRes.data || []
      });
    } catch (error) {
      console.error('Search error:', error);
    }
  }, 300);

  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const loadNotifications = async () => {
  try {
    const notifications = await ActivityLogger.getNotifications(user?.email || '');
    setNotifications(notifications);
  } catch (error) {
    console.error('Error loading notifications:', error);
    const sampleNotifications = [
  { id: '1', title: 'New Order', message: 'You have a new order #1234', created_at: new Date().toISOString(), is_read: false, type: 'system', category: 'order' },
  { id: '2', title: 'Low Stock', message: 'Product XYZ is low on stock', created_at: new Date().toISOString(), is_read: false, type: 'alert', category: 'inventory' },
];
    setNotifications(sampleNotifications as Notification[]);
  }
};

    loadNotifications();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await ActivityLogger.markNotificationAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-lg relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders, customers, leads..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm && setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
          />
        </div>
        {showSearchResults && (
          <div className="absolute left-0 right-0 mt-2 bg-card rounded-xl shadow-lg border border-border z-50 max-h-96 overflow-y-auto">
            {Object.entries(searchResults).map(([category, items]) => (
              items.length > 0 && (
                <div key={category} className="p-3 border-b border-border last:border-b-0">
                  <h4 className="text-sm font-semibold text-foreground mb-2 capitalize">{category}</h4>
                  {items.map((item: Customer | Order | Lead | Product) => (
                    <Link
                      key={item.id}
                      href={`/${category}/${item.id}`}
                      className="block p-2 hover:bg-muted rounded-lg text-sm text-foreground-secondary"
                    >
                      {category === 'customers' && `${(item as Customer).name} (${(item as Customer).email})`}
                      {category === 'orders' && `Order #${(item as Order).order_number} - ${(item as Order).status}`}
                      {category === 'leads' && `${(item as Lead).lead_name} (${(item as Lead).email})`}
                      {category === 'products' && `${(item as Product).name} (SKU: ${(item as Product).sku})`}
                    </Link>
                  ))}
                </div>
              )
            ))}
            {Object.values(searchResults).every(items => items.length === 0) && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        {/* Quick Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <button className="p-2 text-muted-foreground hover:text-foreground-secondary hover:bg-muted rounded-lg transition-all duration-200">
            <Plus className="h-4 w-4" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground-secondary hover:bg-muted rounded-lg transition-all duration-200">
            <Calendar className="h-4 w-4" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground-secondary hover:bg-muted rounded-lg transition-all duration-200">
            <FileText className="h-4 w-4" />
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-muted-foreground hover:text-foreground-secondary hover:bg-muted rounded-lg transition-all duration-200 relative"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
                {notifications.length}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl shadow-lg border border-border z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No new notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border-b border-border last:border-b-0 hover:bg-muted">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => notification.id && markNotificationAsRead(notification.id)}
                        className="text-xs text-primary hover:underline ml-2"
                      >
                        Mark as read
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="relative">
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="p-2 text-muted-foreground hover:text-foreground-secondary hover:bg-muted rounded-lg transition-all duration-200"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          {showMessages && (
            <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl shadow-lg border border-border z-50">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Messages</h3>
              </div>
              <div className="p-4 text-center text-muted-foreground text-sm">
                No new messages
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-foreground-secondary hover:bg-muted rounded-lg transition-all duration-200"
          >
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden md:block text-sm font-medium text-foreground">
              {user?.email?.split('@')[0] || 'User'}
            </span>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border z-50">
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                <hr className="my-2 border-border" />
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}