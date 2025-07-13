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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');

    if (leadId) {
      // Fetch single lead by ID
      const { data, error } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();
      
      if (error) {
        console.error('Error fetching lead:', error);
        return NextResponse.json(
          { error: 'Failed to fetch lead' },
          { status: 500 }
        );
      }

      return NextResponse.json({ lead: data });
    } else {
      // Fetch all leads
      const { data, error } = await supabaseAdmin
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json(
          { error: 'Failed to fetch leads' },
          { status: 500 }
        );
      }

      return NextResponse.json({ leads: data || [] });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error('Error deleting lead:', error);
      return NextResponse.json(
        { error: 'Failed to delete lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');
    const body = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Get the current lead data to check for status changes
    const { data: currentLead, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchError) {
      console.error('Error fetching current lead:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch lead' },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      );
    }

    // Send Meta conversion event if status changed
    if (currentLead.status !== body.status && body.status) {
      try {
        switch (body.status) {
          case 'contacted':
            await metaConversionsService.sendLeadContacted(data);
            break;
          case 'qualified':
            await metaConversionsService.sendLeadQualified(data);
            break;
          case 'converted':
            await metaConversionsService.sendLeadConverted(data);
            break;
          case 'lost':
            await metaConversionsService.sendLeadLost(data);
            break;
        }
      } catch (metaError) {
        console.error('Meta Conversions API error:', metaError);
        // Don't fail the update if Meta API fails
      }
    }

    return NextResponse.json({ lead: data });
  } catch (error) {
    console.error('Update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}