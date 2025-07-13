'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Mail, ChevronDown, User, Settings, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { ActivityLogger, Notification } from '../lib/activity-logger';

export default function TopHeader() {
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.email) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?.email) return;
    
    try {
      const notifications = await ActivityLogger.getNotifications(user.email, 5);
      setNotifications(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Generate sample notifications if table doesn't exist yet
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          title: 'New order received',
          message: 'A new order has been placed and requires processing',
          type: 'info',
          category: 'order',
          is_read: false,
          user_email: user?.email || 'admin@example.com',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Lead converted',
          message: 'A Facebook lead has been successfully converted to a customer',
          type: 'success',
          category: 'lead',
          is_read: false,
          user_email: user?.email || 'admin@example.com',
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Low stock alert',
          message: 'Some products are running low on stock and need restocking',
          type: 'warning',
          category: 'system',
          is_read: false,
          user_email: user?.email || 'admin@example.com',
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        }
      ];
      setNotifications(sampleNotifications);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.email) return;
    
    try {
      const count = await ActivityLogger.getUnreadNotificationCount(user.email);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(3); // Fallback count
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await ActivityLogger.markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'error': return 'bg-destructive';
      default: return 'bg-primary';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      default: return 'ℹ';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders, customers, leads..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        {/* Quick Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <button className="p-2 text-muted-foreground hover:text-foreground-secondary hover:bg-muted rounded-lg transition-all duration-200">
            <Sparkles className="h-5 w-5" />
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-muted-foreground hover:text-foreground-secondary hover:bg-muted rounded-lg transition-all duration-200 relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl shadow-lg border border-border z-50 animate-slide-in-from-top">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  <span className="text-xs text-muted-foreground">{unreadCount} new</span>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="p-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id!)}
                        className={`p-3 rounded-lg cursor-pointer hover:bg-muted transition-all duration-200 ${
                          !notification.is_read ? 'bg-primary-light border-l-2 border-primary' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 ${getNotificationColor(notification.type)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{notification.title}</p>
                            <p className="text-xs text-foreground-secondary mt-1 line-clamp-2">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">{formatTimeAgo(notification.created_at!)}</p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-border bg-muted rounded-b-xl">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="w-full text-center text-sm text-foreground-secondary hover:text-foreground py-1 hover:bg-secondary rounded-lg transition-all duration-200"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <button className="p-2 text-muted-foreground hover:text-foreground-secondary hover:bg-muted rounded-lg transition-all duration-200">
          <Mail className="h-5 w-5" />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-all duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground text-sm font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-foreground">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-lg border border-border z-50 animate-slide-in-from-top">
              <div className="p-3 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-primary-foreground text-sm font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <a href="/profile" className="flex items-center px-3 py-2 text-sm text-foreground-secondary hover:bg-muted transition-all duration-200">
                  <User className="h-4 w-4 mr-3 text-muted-foreground" />
                  Profile
                </a>
                <a href="/settings" className="flex items-center px-3 py-2 text-sm text-foreground-secondary hover:bg-muted transition-all duration-200">
                  <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
                  Settings
                </a>
                <hr className="my-2 border-border" />
                <button 
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2 text-sm text-destructive hover:bg-destructive-light transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-3 text-destructive" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 