import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { metaConversionsService } from '@/lib/services/meta-conversions.service';
import { Lead } from '@/lib/types';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// POST /api/meta-conversions - Send conversion event to Meta
export async function POST(request: NextRequest) {
  try {
    const { leadId, eventType, orderData } = await request.json();

    if (!leadId || !eventType) {
      return NextResponse.json(
        { error: 'Lead ID and event type are required' },
        { status: 400 }
      );
    }

    // Fetch the lead from database
    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    let result;
    
    switch (eventType) {
      case 'lead_generated':
        result = await metaConversionsService.sendLeadGenerated(lead);
        break;
      case 'lead_contacted':
        result = await metaConversionsService.sendLeadContacted(lead);
        break;
      case 'lead_qualified':
        result = await metaConversionsService.sendLeadQualified(lead);
        break;
      case 'lead_converted':
        result = await metaConversionsService.sendLeadConverted(lead, orderData);
        break;
      case 'lead_lost':
        result = await metaConversionsService.sendLeadLost(lead);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Meta Conversions API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/meta-conversions/test - Send test event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'test') {
      const result = await metaConversionsService.sendTestEvent();
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Test event sent successfully. Check your Meta Events Manager.' 
        });
      } else {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Meta Conversions Test Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 