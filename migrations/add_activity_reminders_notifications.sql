-- Create activity_logs table for tracking all business activities
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Could be linked to auth.users if needed
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'convert', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'order', 'lead', 'customer', 'expense', 'return', etc.
  entity_id UUID,
  entity_name VARCHAR(255), -- Human readable identifier
  description TEXT NOT NULL, -- Human readable description of the activity
  metadata JSONB, -- Additional data about the activity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table for business tasks and follow-ups
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reminder_type VARCHAR(50) DEFAULT 'general', -- 'lead_followup', 'expense_review', 'inventory_check', 'general'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  due_date TIMESTAMP WITH TIME ZONE,
  due_time TIME,
  user_id UUID, -- Who the reminder is for
  user_email VARCHAR(255),
  related_entity_type VARCHAR(50), -- 'lead', 'order', 'customer', etc.
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create notifications table for system notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Who the notification is for
  user_email VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  category VARCHAR(50) DEFAULT 'general', -- 'order', 'lead', 'system', 'reminder', 'general'
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_type VARCHAR(50), -- 'order', 'lead', 'customer', etc.
  related_entity_id UUID,
  metadata JSONB, -- Additional data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create user_sessions table for tracking active users
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  user_role VARCHAR(50) DEFAULT 'user', -- 'admin', 'manager', 'user', 'staff'
  session_token VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'idle', 'offline'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_activity_logs_user_email ON activity_logs(user_email);
CREATE INDEX idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_entity_id ON activity_logs(entity_id);

CREATE INDEX idx_reminders_user_email ON reminders(user_email);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_priority ON reminders(priority);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);
CREATE INDEX idx_reminders_reminder_type ON reminders(reminder_type);

CREATE INDEX idx_notifications_user_email ON notifications(user_email);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_user_sessions_user_email ON user_sessions(user_email);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);

-- Enable RLS for all new tables
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for the new tables
CREATE POLICY "Allow authenticated users to manage activity_logs" ON activity_logs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage reminders" ON reminders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage notifications" ON notifications
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage user_sessions" ON user_sessions
  FOR ALL USING (auth.role() = 'authenticated');

-- Create triggers for updated_at columns
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample reminders
INSERT INTO reminders (title, description, reminder_type, priority, due_date, due_time, user_email) VALUES
  ('Follow up with qualified leads', 'Contact leads that have been qualified but not yet converted', 'lead_followup', 'high', CURRENT_DATE, '14:00:00', 'admin@example.com'),
  ('Review monthly expenses', 'Review and categorize all expenses from the past month', 'expense_review', 'normal', CURRENT_DATE, '16:00:00', 'admin@example.com'),
  ('Stock inventory check', 'Check inventory levels and reorder products if needed', 'inventory_check', 'normal', CURRENT_DATE + INTERVAL '1 day', '10:00:00', 'admin@example.com'),
  ('Weekly sales report', 'Generate and review weekly sales performance report', 'general', 'normal', CURRENT_DATE + INTERVAL '2 days', '09:00:00', 'admin@example.com');

-- Insert some sample notifications
INSERT INTO notifications (title, message, type, category, user_email) VALUES
  ('New order received', 'Order #ORD-2024-001 has been placed by John Doe', 'info', 'order', 'admin@example.com'),
  ('Lead converted to customer', 'Lead from Facebook has been successfully converted to a customer', 'success', 'lead', 'admin@example.com'),
  ('Low stock alert', 'Premium Wireless Headphones stock is running low (5 units remaining)', 'warning', 'system', 'admin@example.com'),
  ('Expense approval needed', 'New packaging expense of $150 requires approval', 'info', 'general', 'admin@example.com'); 