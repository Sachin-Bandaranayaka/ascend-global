'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, TestTube, CheckCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { features } from '@/lib/config';

export default function MetaConversionsSettingsPage() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/debug/env');
      if (response.ok) {
        const data = await response.json();
        setIsConfigured(data.metaConfigured);
      } else {
        // Fallback to static check
        setIsConfigured(features.enableMetaConversions);
      }
    } catch (error) {
      // Fallback to static check
      setIsConfigured(features.enableMetaConversions);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/meta-conversions?action=test');
      const result = await response.json();

      if (response.ok) {
        setTestResult({ success: true, message: result.message });
      } else {
        setTestResult({ success: false, error: result.error });
      }
    } catch (error) {
      setTestResult({ success: false, error: 'Failed to test connection' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Meta Conversions API
          </h1>
          <p className="text-gray-600 mt-2">
            Configure Meta Conversions API to reduce lead costs and improve ad targeting
          </p>
        </div>

        {/* Configuration Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
              ) : isConfigured ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              )}
              <h2 className="text-xl font-semibold text-gray-900">Configuration Status</h2>
            </div>
            <button
              onClick={checkConfiguration}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Refresh'}
            </button>
          </div>
          
          {isConfigured ? (
            <div className="text-green-700 bg-green-50 p-4 rounded-lg">
              <p className="font-medium">✅ Meta Conversions API is configured and enabled</p>
              <p className="text-sm mt-1">
                Your CRM will automatically send lead status updates to Meta to improve ad targeting.
              </p>
            </div>
          ) : (
            <div className="text-yellow-700 bg-yellow-50 p-4 rounded-lg">
              <p className="font-medium">⚠️ Meta Conversions API is not configured</p>
              <p className="text-sm mt-1">
                Add META_ACCESS_TOKEN and META_DATASET_ID to your environment variables to enable this feature.
              </p>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-gray-700" />
            How Meta Conversions API Works
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <h3 className="font-medium text-gray-900">Lead Generation</h3>
                <p className="text-gray-600 text-sm">Someone fills out your Facebook/Instagram lead form</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <h3 className="font-medium text-gray-900">CRM Integration</h3>
                <p className="text-gray-600 text-sm">Your CRM automatically sends lead status updates to Meta</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <h3 className="font-medium text-gray-900">Machine Learning</h3>
                <p className="text-gray-600 text-sm">Meta learns which types of people are most likely to convert</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</div>
              <div>
                <h3 className="font-medium text-gray-900">Cost Reduction</h3>
                <p className="text-gray-600 text-sm">Better targeting = lower cost per quality lead</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tracked Events */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tracked Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-green-600">Lead Generated</h3>
              <p className="text-sm text-gray-600">Sent when a new lead is imported or created</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-blue-600">Lead Contacted</h3>
              <p className="text-sm text-gray-600">Sent when lead status changes to "contacted"</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-purple-600">Lead Qualified</h3>
              <p className="text-sm text-gray-600">Sent when lead status changes to "qualified"</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-orange-600">Lead Converted</h3>
              <p className="text-sm text-gray-600">Sent when lead status changes to "converted"</p>
            </div>
          </div>
        </div>

        {/* Test Connection */}
        {isConfigured && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TestTube className="h-5 w-5 text-gray-700" />
              Test Connection
            </h2>
            <p className="text-gray-600 mb-4">
              Send a test event to Meta to verify your configuration is working correctly.
            </p>
            
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {testing ? 'Testing...' : 'Send Test Event'}
            </button>

            {testResult && (
              <div className={`mt-4 p-4 rounded-lg ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {testResult.success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{testResult.message}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{testResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Setup Instructions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">1. Get Your Meta Access Token</h3>
              <p className="text-gray-600 text-sm mb-2">
                Go to your Meta Business Manager and create an access token for your dataset.
              </p>
              <a
                href="https://business.facebook.com/events_manager2"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                Open Meta Events Manager <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">2. Add Environment Variables</h3>
              <p className="text-gray-600 text-sm mb-2">
                Add these to your .env.local file:
              </p>
              <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono text-gray-800">
                <div>META_ACCESS_TOKEN=your_access_token_here</div>
                <div>META_DATASET_ID=your_dataset_id_here</div>
                <div>META_TEST_EVENT_CODE=your_test_code_here (optional)</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">3. Restart Your Application</h3>
              <p className="text-gray-600 text-sm">
                Restart your Next.js application to load the new environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 