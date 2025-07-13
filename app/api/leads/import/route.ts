import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { metaConversionsService } from '@/lib/services/meta-conversions.service';

// Create a Supabase client with service role key for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // This bypasses RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { leads } = await request.json();

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'Invalid leads data' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const lead of leads) {
      try {
        // Check if lead already exists
        const { data: existingLead } = await supabaseAdmin
          .from('leads')
          .select('id')
          .eq('lead_name', lead.lead_name)
          .eq('phone', lead.phone)
          .maybeSingle();

        if (existingLead) {
          errors.push(`Lead ${lead.lead_name} already exists`);
          continue;
        }

        // Insert new lead
        const { data, error } = await supabaseAdmin
          .from('leads')
          .insert({
            source: lead.source || 'facebook',
            lead_name: lead.lead_name,
            email: lead.email || null,
            phone: lead.phone,
            address: lead.address,
            city: lead.city || null,
            state: lead.state || null,
            country: lead.country || 'Sri Lanka',
            postal_code: lead.postal_code || null,
            status: lead.status || 'new',
            lead_cost: lead.lead_cost || 0.00,
            meta_lead_id: lead.meta_lead_id || null,
            meta_click_id: lead.meta_click_id || null,
            notes: lead.notes || `Imported from CSV on ${new Date().toLocaleDateString()}`
          })
          .select()
          .single();

        if (error) {
          errors.push(`Failed to import ${lead.lead_name}: ${error.message}`);
        } else {
          results.push(data);
          
          // Send Meta conversion event for new lead
          if (data.source === 'facebook' || data.source === 'instagram') {
            try {
              await metaConversionsService.sendLeadGenerated(data);
            } catch (metaError) {
              console.error('Meta Conversions API error for lead:', data.id, metaError);
              // Don't fail the import if Meta API fails
            }
          }
        }
      } catch (error) {
        errors.push(`Failed to import ${lead.lead_name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: results,
      errors,
      summary: {
        total: leads.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}