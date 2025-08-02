import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { rateLimit } from '@/lib/middleware/rate-limit';
import { validateInput, validatePagination, validateSortOrder, validateSortField, expenseSchemas } from '@/lib/utils/validation';
import { withCache, cacheKeys, cacheTtl, cacheInvalidation } from '@/lib/utils/cache';
import { config } from '@/lib/config';

const supabaseAdmin = createClient(
  config.NEXT_PUBLIC_SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/expenses - Fetch expenses with authentication, caching, and pagination
export const GET = rateLimit('general')(withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get('id');

    if (expenseId) {
      // Fetch single expense with caching
      const cacheKey = cacheKeys.expense(expenseId);
      
      const expense = await withCache(cacheKey, async () => {
        const { data, error } = await supabaseAdmin
          .from('expenses')
          .select(`
            *,
            suppliers (
              id,
              name
            )
          `)
          .eq('id', expenseId)
          .single();

        if (error) {
          throw new Error('Expense not found');
        }

        return data;
      }, cacheTtl.medium);

      return NextResponse.json({ expense });
    } else {
      // Fetch expenses with pagination, sorting, and caching
      const { page, limit } = validatePagination(searchParams);
      const sortField = validateSortField(
        searchParams.get('sort'), 
        ['date', 'amount', 'expense_type', 'created_at']
      );
      const sortOrder = validateSortOrder(searchParams.get('order'));
      const expenseType = searchParams.get('type');
      
      const cacheKey = cacheKeys.expenses(page, limit, `${sortField}:${sortOrder}:${expenseType || 'all'}`);
      
      const result = await withCache(cacheKey, async () => {
        const offset = (page - 1) * limit;
        
        // Build query
        let query = supabaseAdmin
          .from('expenses')
          .select(`
            *,
            suppliers (
              id,
              name
            )
          `, { count: 'exact' });
        
        // Apply filters
        if (expenseType) {
          query = query.eq('expense_type', expenseType);
        }
        
        // Apply sorting and pagination
        query = query
          .order(sortField, { ascending: sortOrder === 'asc' })
          .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
          throw new Error('Failed to fetch expenses');
        }

        return {
          expenses: data,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          }
        };
      }, cacheTtl.short);

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error in GET /api/expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}));

// POST /api/expenses - Create a new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data: expense, error } = await supabaseAdmin
      .from('expenses')
      .insert([{
        ...body,
        supplier_id: body.supplier_id || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      return NextResponse.json(
        { error: 'Failed to create expense' },
        { status: 500 }
      );
    }

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses - Update an expense
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const { data: expense, error } = await supabaseAdmin
      .from('expenses')
      .update({
        ...body,
        supplier_id: body.supplier_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      return NextResponse.json(
        { error: 'Failed to update expense' },
        { status: 500 }
      );
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Error in PUT /api/expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses - Delete an expense
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      return NextResponse.json(
        { error: 'Failed to delete expense' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}