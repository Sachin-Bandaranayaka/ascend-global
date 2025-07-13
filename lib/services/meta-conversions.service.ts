import { metaConfig, features } from '../config';
import { Lead, Order } from '../types';
import crypto from 'crypto';

export interface MetaConversionEvent {
  action_source: 'system_generated';
  event_name: string;
  event_time: number;
  user_data: {
    em?: string[];
    ph?: string[];
    lead_id?: number;
    click_id?: string;
    fn?: string[];
    ln?: string[];
    ct?: string[];
    st?: string[];
    zp?: string[];
    country?: string[];
  };
  custom_data: {
    event_source: 'crm';
    lead_event_source: 'Ascend Global CRM';
    currency?: string;
    value?: number;
    content_name?: string;
    content_type?: string;
  };
  event_id?: string;
}

export interface MetaConversionPayload {
  data: MetaConversionEvent[];
  test_event_code?: string;
}

class MetaConversionsService {
  private isEnabled(): boolean {
    return features.enableMetaConversions;
  }

  private hashData(data: string): string {
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming US/international format)
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    return cleaned;
  }

  private createUserData(lead: Lead): MetaConversionEvent['user_data'] {
    const userData: MetaConversionEvent['user_data'] = {};

    // Hash email if available
    if (lead.email) {
      userData.em = [this.hashData(lead.email)];
    }

    // Hash phone if available
    if (lead.phone) {
      const formattedPhone = this.formatPhoneNumber(lead.phone);
      userData.ph = [this.hashData(formattedPhone)];
    }

    // Extract and hash name parts
    if (lead.lead_name) {
      const nameParts = lead.lead_name.split(' ');
      if (nameParts.length > 0) {
        userData.fn = [this.hashData(nameParts[0])];
      }
      if (nameParts.length > 1) {
        userData.ln = [this.hashData(nameParts.slice(1).join(' '))];
      }
    }

    // Hash location data if available
    if (lead.city) {
      userData.ct = [this.hashData(lead.city)];
    }
    if (lead.state) {
      userData.st = [this.hashData(lead.state)];
    }
    if (lead.postal_code) {
      userData.zp = [this.hashData(lead.postal_code)];
    }
    if (lead.country) {
      userData.country = [this.hashData(lead.country)];
    }

    return userData;
  }

  private generateEventId(leadId: string, eventName: string): string {
    return crypto.createHash('md5').update(`${leadId}_${eventName}_${Date.now()}`).digest('hex');
  }

  async sendLeadEvent(lead: Lead, eventName: string, customData?: any): Promise<{ success: boolean; error?: string }> {
    if (!this.isEnabled()) {
      console.log('Meta Conversions API is not enabled');
      return { success: false, error: 'Meta Conversions API is not configured' };
    }

    const eventTime = Math.floor(Date.now() / 1000);
    
    try {
      const event: MetaConversionEvent = {
        action_source: 'system_generated',
        event_name: eventName,
        event_time: eventTime,
        user_data: this.createUserData(lead),
        custom_data: {
          event_source: 'crm',
          lead_event_source: 'Ascend Global CRM',
          ...customData,
        },
        event_id: this.generateEventId(lead.id, eventName),
      };

      const payload: MetaConversionPayload = {
        data: [event],
      };

      // Add test event code to payload only (not to individual events)
      if (metaConfig.TEST_EVENT_CODE) {
        payload.test_event_code = metaConfig.TEST_EVENT_CODE;
      }

      console.log(`Sending Meta event: ${eventName} for lead ${lead.id} with payload:`, JSON.stringify(payload, null, 2));

      const response = await fetch(`${metaConfig.ENDPOINT}?access_token=${metaConfig.ACCESS_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Meta Conversions API Error:', result);
        return { success: false, error: `HTTP ${response.status}: ${JSON.stringify(result)}` };
      }

      console.log('Meta Conversions API Success:', result);
      return { success: true };
    } catch (error) {
      console.error('Meta Conversions API Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Specific event methods for different lead stages
  async sendLeadGenerated(lead: Lead): Promise<{ success: boolean; error?: string }> {
    return this.sendLeadEvent(lead, 'Lead', {
      content_name: 'Lead Generated',
      content_type: 'lead',
    });
  }

  async sendLeadContacted(lead: Lead): Promise<{ success: boolean; error?: string }> {
    return this.sendLeadEvent(lead, 'Contact', {
      content_name: 'Lead Contacted',
      content_type: 'lead',
    });
  }

  async sendLeadQualified(lead: Lead): Promise<{ success: boolean; error?: string }> {
    return this.sendLeadEvent(lead, 'CompleteRegistration', {
      content_name: 'Lead Qualified',
      content_type: 'lead',
    });
  }

  async sendLeadConverted(lead: Lead, order?: Order): Promise<{ success: boolean; error?: string }> {
    const customData: any = {
      content_name: 'Lead Converted',
      content_type: 'purchase',
    };

    // Include order value if available, otherwise use default
    customData.value = order?.total_amount || 100; // Default value if no order
    customData.currency = order?.currency || 'LKR'; // Default to LKR

    return this.sendLeadEvent(lead, 'Purchase', customData);
  }

  async sendLeadLost(lead: Lead): Promise<{ success: boolean; error?: string }> {
    return this.sendLeadEvent(lead, 'LeadLost', {
      content_name: 'Lead Lost',
      content_type: 'lead',
    });
  }

  // Test event method
  async sendTestEvent(): Promise<{ success: boolean; error?: string }> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Meta Conversions API is not configured' };
    }

    const testEvent: MetaConversionEvent = {
      action_source: 'system_generated',
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: [this.hashData('test@example.com')],
        ph: [this.hashData('+1234567890')],
      },
      custom_data: {
        event_source: 'crm',
        lead_event_source: 'Ascend Global CRM',
        content_name: 'Test Event',
        content_type: 'test',
      },
      event_id: this.generateEventId('test', 'Lead'),
    };

    const payload: MetaConversionPayload = {
      data: [testEvent],
    };

    // Add test event code to payload only (not to individual events)
    if (metaConfig.TEST_EVENT_CODE) {
      payload.test_event_code = metaConfig.TEST_EVENT_CODE;
    }

    try {
      const response = await fetch(`${metaConfig.ENDPOINT}?access_token=${metaConfig.ACCESS_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorData}` };
      }

      const result = await response.json();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const metaConversionsService = new MetaConversionsService(); 