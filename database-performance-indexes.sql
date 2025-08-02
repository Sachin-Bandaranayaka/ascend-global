-- Performance Indexes for Ascend Global Business Management System
-- Run these queries in your Supabase SQL editor to improve performance

-- Customers table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_updated_at ON customers(updated_at DESC);

-- Leads table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_meta_lead_id ON leads(meta_lead_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_meta_click_id ON leads(meta_click_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_customer_id ON leads(customer_id);

-- Orders table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_lead_id ON orders(lead_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);

-- Order items table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Expenses table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_expense_type ON expenses(expense_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_amount ON expenses(amount);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_supplier_id ON expenses(supplier_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_order_id ON expenses(order_id);

-- Products table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_cost_price ON products(cost_price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_selling_price ON products(selling_price);

-- Returns table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_returns_customer_id ON returns(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_returns_created_at ON returns(created_at DESC);

-- Return items table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_return_items_return_id ON return_items(return_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_return_items_product_id ON return_items(product_id);

-- Suppliers table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_email ON suppliers(email);

-- Purchase invoices table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchase_invoices_supplier_id ON purchase_invoices(supplier_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchase_invoices_invoice_date ON purchase_invoices(invoice_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchase_invoices_total_amount ON purchase_invoices(total_amount);

-- Activity logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_email ON activity_logs(user_email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Reminders table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_user_email ON reminders(user_email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_priority ON reminders(priority);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_reminder_type ON reminders(reminder_type);

-- Notifications table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_email ON notifications(user_email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- User sessions table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_email ON user_sessions(user_email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_status ON user_sessions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity DESC);

-- Profiles table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_type_date ON expenses(expense_type, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_created ON activity_logs(user_email, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread ON notifications(user_email, is_read) WHERE is_read = false;

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_name_trgm ON customers USING gin (name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_name_trgm ON leads USING gin (name gin_trgm_ops);

-- Enable pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Analyze tables to update statistics
ANALYZE customers;
ANALYZE leads;
ANALYZE orders;
ANALYZE order_items;
ANALYZE expenses;
ANALYZE products;
ANALYZE returns;
ANALYZE return_items;
ANALYZE suppliers;
ANALYZE purchase_invoices;
ANALYZE activity_logs;
ANALYZE reminders;
ANALYZE notifications;
ANALYZE user_sessions;
ANALYZE profiles;