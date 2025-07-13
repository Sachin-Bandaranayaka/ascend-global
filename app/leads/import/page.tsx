'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Lead } from '@/lib/types';

interface CSVLead {
  id: string;
  created_time: string;
  full_name: string;
  phone_number: string;
  street_address: string;
  lead_status: string;
  ad_name?: string;
  campaign_name?: string;
  form_name?: string;
  platform?: string;
}

export default function ImportLeadsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [previewData, setPreviewData] = useState<CSVLead[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const parseCSV = (csvText: string): CSVLead[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split('\t').map(h => h.trim());
    const data: CSVLead[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t');
      if (values.length >= headers.length) {
        const lead: CSVLead = {
          id: values[0]?.replace(/[^\w\d]/g, '') || '',
          created_time: values[1] || '',
          full_name: values[12]?.replace(/"/g, '') || '',
          phone_number: values[13]?.replace(/[^\d+]/g, '') || '',
          street_address: values[14]?.replace(/"/g, '') || '',
          lead_status: values[15] || 'new',
          ad_name: values[3] || '',
          campaign_name: values[7] || '',
          form_name: values[9]?.replace(/"/g, '') || '',
          platform: values[11] || 'facebook'
        };
        
        if (lead.full_name && lead.phone_number) {
          data.push(lead);
        }
      }
    }

    return data;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    // Preview the data
    const text = await selectedFile.text();
    const parsed = parseCSV(text);
    setPreviewData(parsed.slice(0, 5)); // Show first 5 rows for preview
    setShowPreview(true);
  };

  const convertToLead = (csvLead: CSVLead): Omit<Lead, 'id'> => {
    return {
      source: csvLead.platform || 'facebook',
      lead_name: csvLead.full_name,
      phone: csvLead.phone_number,
      address: csvLead.street_address,
      status: csvLead.lead_status === 'complete' ? 'new' : 'new',
      lead_cost: 25.00, // Default cost, can be customized
      notes: `Imported from ${csvLead.form_name || 'CSV'} - Campaign: ${csvLead.campaign_name || 'Unknown'}`,
      created_at: csvLead.created_time || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResults(null);

    try {
      const text = await file.text();
      const csvLeads = parseCSV(text);
      
      // Convert CSV leads to the format expected by the API
      const leadsData = csvLeads.map(csvLead => convertToLead(csvLead));

      // Use the API route to handle imports with proper authentication
      const response = await fetch('/api/leads/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leads: leadsData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
         setResults({ success: 0, failed: 0, errors: [result.error] });
       } else {
         setResults({ 
           success: result.summary?.successful || 0, 
           failed: result.summary?.failed || 0,
           errors: result.errors || [] 
         });
       }
    } catch (error) {
      console.error('Import error:', error);
      setResults({ 
        success: 0, 
        failed: 0, 
        errors: [`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      'id\tcreated_time\tad_id\tad_name\tadset_id\tadset_name\tcampaign_id\tcampaign_name\tform_id\tform_name\tis_organic\tplatform\tfull_name\tphone_number\tstreet_address\tlead_status',
      'l:123456789\t2025-01-15T10:00:00+05:30\tag:123\tKojic\tas:123\tKojic\tc:123\tKojic\tf:123\tKojic Soap\tfalse\tfb\tJohn Doe\t+94771234567\t123 Main Street\tcomplete',
      'l:987654321\t2025-01-15T11:00:00+05:30\tag:123\tKojic\tas:123\tKojic\tc:123\tKojic\tf:123\tKojic Soap\tfalse\tfb\tJane Smith\t+94779876543\t456 Oak Avenue\tcomplete'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/leads" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Import Leads</h1>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Sample
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="mb-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">
                  Click to upload
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500">
              CSV files only. Maximum file size: 10MB
            </p>
          </div>

          {file && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-blue-900">{file.name}</span>
                <span className="text-sm text-blue-700 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        {showPreview && previewData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Data</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((lead, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.phone_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.street_address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.lead_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Showing first 5 rows. Total rows to import: {previewData.length}
            </p>
          </div>
        )}

        {/* Import Button */}
        {file && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full btn btn-primary py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Leads
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Results</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-green-900">Successful</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">{results.success}</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-sm font-medium text-red-900">Failed</span>
                </div>
                <p className="text-2xl font-bold text-red-900 mt-1">{results.failed}</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Errors:</h4>
                <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-40 overflow-y-auto">
                  {results.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700 mb-1">{error}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <Link
                href="/leads"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
              >
                View Imported Leads
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}