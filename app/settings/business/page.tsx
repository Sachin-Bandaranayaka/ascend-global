'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/ui/page-header';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { 
  DollarSign, 
  Package, 
  Truck, 
  Users, 
  Target, 
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';

interface BusinessSettings {
  defaultPackagingCost: number;
  salaryPerOrder: number;
  leadCost: number;
  lowStockThreshold: number;
  targetProfitMargin: number;
  shippingCost: number;
  metaConversionsEnabled: boolean;
}

export default function BusinessSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings>({
    defaultPackagingCost: 0,
    salaryPerOrder: 0,
    leadCost: 0,
    lowStockThreshold: 10,
    targetProfitMargin: 20,
    shippingCost: 0,
    metaConversionsEnabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const businessSettings = await AnalyticsService.getBusinessSettings();
      setSettings({
        defaultPackagingCost: businessSettings.defaultPackagingCost || 0,
        salaryPerOrder: businessSettings.defaultSalaryCostPerOrder || 0,
        leadCost: businessSettings.defaultLeadCost || 0,
        lowStockThreshold: businessSettings.lowStockThreshold || 10,
        targetProfitMargin: businessSettings.targetProfitMargin || 20,
        shippingCost: 0,
        metaConversionsEnabled: 'metaConversionsEnabled' in businessSettings ? Boolean(businessSettings.metaConversionsEnabled) : false
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load business settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await AnalyticsService.updateBusinessSettings(settings);
      toast({
        title: 'Success',
        description: 'Business settings updated successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save business settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof BusinessSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <PageHeader 
            title="Business Settings" 
            description="Configure cost parameters and business rules"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <PageHeader 
          title="Business Settings" 
          description="Configure cost parameters and business rules for accurate profit calculations"
        />
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={fetchSettings} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            Save Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cost Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Parameters
              </CardTitle>
              <CardDescription>
                Configure default costs used in profit calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leadCost">Lead Cost (per lead)</Label>
                <Input
                  id="leadCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.leadCost}
                  onChange={(e) => handleInputChange('leadCost', e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Cost paid to Meta/Facebook for each lead generated
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="packagingCost">Default Packaging Cost</Label>
                <Input
                  id="packagingCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.defaultPackagingCost}
                  onChange={(e) => handleInputChange('defaultPackagingCost', e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Default cost for packaging materials per order
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingCost">Default Shipping Cost</Label>
                <Input
                  id="shippingCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.shippingCost}
                  onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Default shipping cost via courier service (e.g., Farda Express)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Labor Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Labor & Operations
              </CardTitle>
              <CardDescription>
                Configure salary and operational costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salaryPerOrder">Salary Cost per Order</Label>
                <Input
                  id="salaryPerOrder"
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.salaryPerOrder}
                  onChange={(e) => handleInputChange('salaryPerOrder', e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Labor cost allocated per order (processing, packing, etc.)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetProfitMargin">Target Profit Margin (%)</Label>
                <Input
                  id="targetProfitMargin"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={settings.targetProfitMargin}
                  onChange={(e) => handleInputChange('targetProfitMargin', e.target.value)}
                  placeholder="20"
                />
                <p className="text-xs text-muted-foreground">
                  Target profit margin percentage for business goals
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Management
              </CardTitle>
              <CardDescription>
                Configure inventory thresholds and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  value={settings.lowStockThreshold}
                  onChange={(e) => handleInputChange('lowStockThreshold', e.target.value)}
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum stock level before triggering low stock alerts
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Meta Conversions API</h4>
                  <p className="text-sm text-muted-foreground">
                    Send conversion events back to Meta for better lead quality
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="metaConversions"
                    checked={settings.metaConversionsEnabled}
                    onChange={(e) => handleInputChange('metaConversionsEnabled', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="metaConversions">Enabled</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Business Insights
              </CardTitle>
              <CardDescription>
                Key metrics based on current settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Cost per Order (Fixed)</span>
                  <span className="text-sm font-bold">
                    ${(settings.defaultPackagingCost + settings.salaryPerOrder + settings.shippingCost).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Target Profit Margin</span>
                  <span className="text-sm font-bold text-green-600">
                    {settings.targetProfitMargin.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Low Stock Alert</span>
                  <span className="text-sm font-bold text-orange-600">
                    ≤ {settings.lowStockThreshold} units
                  </span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Cost Calculation Note:</p>
                  <p>These settings are used to calculate profit margins. Product costs are taken from individual product records, while lead costs are distributed based on conversion rates.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button (Mobile) */}
        <div className="mt-8 md:hidden">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}