import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role key for bypassing RLS
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

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('key', 'total_lead_cost')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    // Parse the jsonb value
    const totalLeadCost = data?.value ? JSON.parse(data.value) : '0.00';
    return NextResponse.json({ 
      total_lead_cost: totalLeadCost
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { total_lead_cost } = body;

    if (!total_lead_cost || isNaN(parseFloat(total_lead_cost))) {
      return NextResponse.json(
        { error: 'Valid total_lead_cost is required' },
        { status: 400 }
      );
    }

    // Upsert the setting
    const formattedValue = parseFloat(total_lead_cost).toFixed(2);
    
    const { data, error } = await supabaseAdmin
      .from('settings')
      .upsert({
        key: 'total_lead_cost',
        value: JSON.stringify(formattedValue),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      total_lead_cost: formattedValue
    });
  } catch (error) {
    console.error('Update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}