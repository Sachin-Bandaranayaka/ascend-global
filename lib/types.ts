// Database types for Ascend Global Business Management System

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
  is_returning_customer: boolean;
  total_orders: number;
  total_spent: number;
  notes?: string;
}

export interface Lead {
  id: string;
  source: string;
  lead_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  lead_cost: number;
  meta_lead_id?: string;
  meta_click_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  converted_at?: string;
  customer_id?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  lead_id?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_postal_code?: string;
  courier_service?: string;
  tracking_number?: string;
  shipping_cost: number;
  currency?: string; // e.g., 'INR'
  notes?: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  supplier_name: string;
  supplier_email?: string;
  supplier_phone?: string;
  total_amount: number;
  invoice_date: string;
  due_date?: string;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

export interface PurchaseInvoiceItem {
  id: string;
  purchase_invoice_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  created_at: string;
}

export interface Expense {
  id: string;
  type: 'packaging' | 'salary' | 'printing' | 'return_shipping' | 'lead_cost' | 'other';
  description: string;
  amount: number;
  expense_date: string;
  order_id?: string;
  lead_id?: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Return {
  id: string;
  return_number: string;
  order_id: string;
  customer_id?: string;
  reason: string;
  status: 'requested' | 'approved' | 'in_transit' | 'received' | 'processed';
  return_shipping_cost: number;
  refund_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface ReturnItem {
  id: string;
  return_id: string;
  product_id: string;
  quantity: number;
  condition: 'good' | 'damaged' | 'defective';
  created_at: string;
}

// Extended types with relations
export interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product })[];
  customer?: Customer;
  lead?: Lead;
}

export interface ReturnWithItems extends Return {
  items: (ReturnItem & { product: Product })[];
  order: Order;
  customer?: Customer;
}

export interface PurchaseInvoiceWithItems extends PurchaseInvoice {
  items: (PurchaseInvoiceItem & { product: Product })[];
}

// Dashboard stats types
export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  leadConversionRate: number;
  totalExpenses: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  monthlyExpenses: number;
  profitMargin: number;
  returningCustomers: number;
  totalCustomers: number;
  activeLeads: number;
  convertedLeads: number;
}

// Form types
export interface CreateCustomerForm {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  notes?: string;
}

export interface CreateLeadForm {
  source: string;
  lead_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  lead_cost: number;
  notes?: string;
}

export interface CreateOrderForm {
  customer_id?: string;
  lead_id?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_postal_code?: string;
  courier_service?: string;
  shipping_cost: number;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface CreateExpenseForm {
  type: 'packaging' | 'salary' | 'printing' | 'return_shipping' | 'lead_cost' | 'other';
  description: string;
  amount: number;
  expense_date: string;
  order_id?: string;
  lead_id?: string;
  receipt_url?: string;
  notes?: string;
}

export interface CreateReturnForm {
  order_id: string;
  reason: string;
  return_shipping_cost: number;
  refund_amount: number;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    condition: 'good' | 'damaged' | 'defective';
  }[];
}

export interface CreateProductForm {
  name: string;
  description?: string;
  sku?: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
}

export interface CreatePurchaseInvoiceForm {
  invoice_number: string;
  supplier_name: string;
  supplier_email?: string;
  supplier_phone?: string;
  invoice_date: string;
  due_date?: string;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_cost: number;
  }[];
}

export interface Profile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  full_name?: string;
  created_at: string;
  updated_at: string;
} 