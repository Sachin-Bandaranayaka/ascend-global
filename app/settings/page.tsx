'use client';

import Link from 'next/link';
import { ArrowLeft, Settings, Target, Zap, CheckCircle, AlertCircle, ExternalLink, Users } from 'lucide-react';
import { features } from '@/lib/config';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [isMetaConfigured, setIsMetaConfigured] = useState(false);

  useEffect(() => {
    setIsMetaConfigured(features.enableMetaConversions);
  }, []);

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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="h-8 w-8" />
                Settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">System Configuration</h2>
          <p className="text-gray-600">
            Configure and manage your business management system settings
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meta Conversions API */}
          <Link 
            href="/settings/meta-conversions" 
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Meta Conversions API
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Reduce lead costs by 20-40% with Meta's conversion tracking
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    {isMetaConfigured ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-700 text-sm font-medium">Configured</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-700 text-sm font-medium">Setup Required</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

          {/* General Settings */}
          <Link 
            href="/settings/general" 
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Settings className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    General Settings
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Company information, preferences, and defaults
                  </p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

          {/* User Management */}
          <Link 
            href="/admin/users" 
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Users className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    User Management
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Manage user accounts, roles, and permissions
                  </p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

          {/* Integrations */}
          <Link 
            href="/settings/integrations" 
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Zap className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Integrations
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Connect with third-party services and APIs
                  </p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/settings/meta-conversions"
              className="flex items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-700">Configure Meta API</span>
              </div>
            </Link>
            
            <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg opacity-60">
              <div className="text-center">
                <Settings className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-500">Export Settings</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg opacity-60">
              <div className="text-center">
                <Zap className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-500">System Backup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-primary-light rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-2">Need Help?</h3>
          <p className="text-primary text-sm mb-4">
            Check out our documentation or contact support for assistance with configuration.
          </p>
          <div className="flex gap-4">
            <button className="text-primary hover:text-primary-hover text-sm font-medium">
              View Documentation
            </button>
            <button className="text-primary hover:text-primary-hover text-sm font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 