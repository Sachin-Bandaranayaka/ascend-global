'use client';

import { useAuth } from '@/hooks/use-auth';
import Sidebar from './sidebar';
import TopHeader from './top-header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Main content area with left margin to account for fixed sidebar */}
      <div className="lg:ml-72">
        <TopHeader />
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
} 