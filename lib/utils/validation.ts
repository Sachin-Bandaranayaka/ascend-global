import { z } from 'zod';

// Common validation schemas
export const baseSchemas = {
  id: z.string().uuid('Invalid ID format'),
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
  pagination: z.object({
    page: z.number().min(1, 'Page must be at least 1').default(1),
    limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  }),
};

// Customer validation schemas
export const customerSchemas = {
  create: z.object({
    name: baseSchemas.name,
    email: baseSchemas.email,
    phone: baseSchemas.phone,
    address: z.string().max(200, 'Address too long').optional(),
    city: z.string().max(50, 'City too long').optional(),
    country: z.string().max(50, 'Country too long').optional(),
    notes: baseSchemas.description,
  }),
  update: z.object({
    name: baseSchemas.name.optional(),
    email: baseSchemas.email.optional(),
    phone: baseSchemas.phone,
    address: z.string().max(200, 'Address too long').optional(),
    city: z.string().max(50, 'City too long').optional(),
    country: z.string().max(50, 'Country too long').optional(),
    notes: baseSchemas.description,
  }),
};

// Expense validation schemas
export const expenseSchemas = {
  create: z.object({
    amount: baseSchemas.amount,
    expense_type: z.enum(['packaging', 'salary', 'printing', 'return_shipping', 'lead_cost', 'other']),
    description: z.string().max(200, 'Description too long'),
    date: baseSchemas.date,
    supplier_id: baseSchemas.id.optional(),
    order_id: baseSchemas.id.optional(),
    receipt_url: z.string().url('Invalid URL format').optional(),
  }),
  update: z.object({
    amount: baseSchemas.amount.optional(),
    expense_type: z.enum(['packaging', 'salary', 'printing', 'return_shipping', 'lead_cost', 'other']).optional(),
    description: z.string().max(200, 'Description too long').optional(),
    date: baseSchemas.date.optional(),
    supplier_id: baseSchemas.id.optional(),
    order_id: baseSchemas.id.optional(),
    receipt_url: z.string().url('Invalid URL format').optional(),
  }),
};

// Lead validation schemas
export const leadSchemas = {
  create: z.object({
    name: baseSchemas.name,
    email: baseSchemas.email,
    phone: baseSchemas.phone,
    source: z.string().max(50, 'Source too long').default('facebook'),
    status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).default('new'),
    cost: baseSchemas.amount.optional(),
    notes: baseSchemas.description,
    meta_lead_id: z.string().optional(),
    meta_click_id: z.string().optional(),
  }),
  update: z.object({
    name: baseSchemas.name.optional(),
    email: baseSchemas.email.optional(),
    phone: baseSchemas.phone,
    source: z.string().max(50, 'Source too long').optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
    cost: baseSchemas.amount.optional(),
    notes: baseSchemas.description,
    meta_lead_id: z.string().optional(),
    meta_click_id: z.string().optional(),
  }),
};

// Utility functions
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
      return { success: false, error: errorMessages.join(', ') };
    }
    return { success: false, error: 'Invalid input format' };
  }
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\w\s\-@.]/g, '') // Keep only alphanumeric, spaces, hyphens, @ and dots
    .trim();
}

export function sanitizeNumericString(input: string): string {
  return input.replace(/[^\d.-]/g, '');
}

export function validatePagination(searchParams: URLSearchParams): { page: number; limit: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  
  return { page, limit };
}

export function validateSortOrder(order: string | null): 'asc' | 'desc' {
  return order?.toLowerCase() === 'desc' ? 'desc' : 'asc';
}

export function validateSortField(field: string | null, allowedFields: string[]): string {
  return allowedFields.includes(field || '') ? field! : 'created_at';
}