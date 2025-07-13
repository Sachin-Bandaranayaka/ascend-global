'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Target,
  Package,
  DollarSign,
  RotateCcw,
  FileText,
  Settings, 
  HelpCircle, 
  LogOut,
  TrendingUp,
  UserCheck,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

const mainMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
  { name: 'Orders', href: '/orders', icon: ShoppingBag, badge: null },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: Package, badge: null },
  { name: 'Customers', href: '/customers', icon: Users, badge: null },
  { name: 'Leads', href: '/leads', icon: Target, badge: 'Hot' },
  { name: 'Products', href: '/products', icon: Package, badge: null },
  { name: 'Expenses', href: '/expenses', icon: DollarSign, badge: null },
  { name: 'Returns', href: '/returns', icon: RotateCcw, badge: null },
  { name: 'Reports', href: '/reports', icon: FileText, badge: null },
  { name: 'Reminders', href: '/reminders', icon: Bell, badge: null },
];

const generalItems = [
  { name: 'Settings', href: '/settings', icon: Settings, badge: null },
  { name: 'Help', href: '/help', icon: HelpCircle, badge: null },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-card/90 backdrop-blur-sm shadow-lg border border-border hover:bg-card/95 transition-all duration-200 active:scale-95"
      >
        {isCollapsed ? <Menu className="h-5 w-5 text-foreground-secondary" /> : <X className="h-5 w-5 text-foreground-secondary" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/95 backdrop-blur-sm shadow-xl border-r border-border transform transition-transform duration-300 ease-in-out ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 border-b border-border">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl shadow-sm">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-foreground">Ascend Global</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Business Management</p>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {/* Main Menu Section */}
            <div className="py-2">
              <div className="flex items-center justify-between px-3 mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business</h3>
                <Sparkles className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                {mainMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground-secondary hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground-secondary'
                      }`} />
                      {item.name}
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          isActive(item.href) 
                            ? 'bg-white/20 text-primary-foreground' 
                            : 'bg-accent text-accent-foreground'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive(item.href) && (
                        <ChevronRight className="h-4 w-4 text-primary-foreground" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* General Section */}
            <div className="py-2">
              <div className="flex items-center justify-between px-3 mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">General</h3>
              </div>
              <div className="space-y-1">
                {generalItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground-secondary hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground-secondary'
                      }`} />
                      {item.name}
                    </div>
                    {isActive(item.href) && (
                      <ChevronRight className="h-4 w-4 text-primary-foreground" />
                    )}
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-foreground-secondary hover:bg-destructive-light hover:text-destructive transition-all duration-200"
                >
                  <LogOut className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-destructive" />
                  Sign Out
                </button>
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="border-t border-border p-4">
            <div className="flex items-center p-3 rounded-xl bg-muted hover:bg-secondary transition-all duration-200 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
} 