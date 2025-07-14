import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { rateLimit } from '@/lib/middleware/rate-limit';
import { validateInput, validatePagination, validateSortOrder, validateSortField, customerSchemas } from '@/lib/utils/validation';
import { config } from '@/lib/config';

// Create a Supabase client with service role key for bypassing RLS
const supabaseAdmin = createClient(
  config.NEXT_PUBLIC_SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export const GET = rateLimit('general')(withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (customerId) {
      // Validate customer ID format
      const idValidation = validateInput(customerSchemas.create.shape.id, customerId);
      if (!idValidation.success) {
        return NextResponse.json(
          { error: 'Invalid customer ID format' },
          { status: 400 }
        );
      }

      // Fetch single customer by ID
      const { data, error } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error) {
        console.error('Error fetching customer:', error.message);
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ customer: data });
    } else {
      // Fetch customers with pagination and sorting
      const { page, limit } = validatePagination(searchParams);
      const sortField = validateSortField(searchParams.get('sort'), ['name', 'email', 'created_at', 'updated_at']);
      const sortOrder = validateSortOrder(searchParams.get('order'));
      
      const offset = (page - 1) * limit;

      // Get total count
      const { count, error: countError } = await supabaseAdmin
        .from('customers')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error counting customers:', countError.message);
        return NextResponse.json(
          { error: 'Failed to fetch customers' },
          { status: 500 }
        );
      }

      // Get paginated customers
      const { data, error } = await supabaseAdmin
        .from('customers')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error fetching customers:', error.message);
        return NextResponse.json(
          { error: 'Failed to fetch customers' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        customers: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      });
    }
  } catch (error) {
    console.error('GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));

export const POST = rateLimit('general')(withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateInput(customerSchemas.create, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('customers')
      .insert({
        ...validation.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error.message);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ customer: data }, { status: 201 });
  } catch (error) {
    console.error('POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) {
      console.error('Error deleting customer:', error);
      return NextResponse.json(
        { error: 'Failed to delete customer' },
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
    const customerId = searchParams.get('id');
    const body = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('customers')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      return NextResponse.json(
        { error: 'Failed to update customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ customer: data });
  } catch (error) {
    console.error('Update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}