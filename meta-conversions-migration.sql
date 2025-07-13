-- Migration script for Meta Conversions API integration
-- Run this in your Supabase SQL editor to add Meta fields to existing databases

-- Add Meta fields to leads table if they don't exist
DO $$ 
BEGIN
  -- Add meta_lead_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'meta_lead_id') THEN
    ALTER TABLE leads ADD COLUMN meta_lead_id VARCHAR(255);
    COMMENT ON COLUMN leads.meta_lead_id IS 'Facebook lead ID for Conversions API matching';
  END IF;

  -- Add meta_click_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'meta_click_id') THEN
    ALTER TABLE leads ADD COLUMN meta_click_id VARCHAR(255);
    COMMENT ON COLUMN leads.meta_click_id IS 'Facebook click ID for better attribution';
  END IF;
END $$;

-- Add indexes for Meta fields if they don't exist
CREATE INDEX IF NOT EXISTS idx_leads_meta_lead_id ON leads(meta_lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_meta_click_id ON leads(meta_click_id);

-- Create a function to log Meta conversion events (optional)
CREATE TABLE IF NOT EXISTS meta_conversion_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  event_name VARCHAR(100) NOT NULL,
  event_time TIMESTAMP WITH TIME ZONE NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  error_message TEXT,
  meta_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for the new table
ALTER TABLE meta_conversion_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for the new table
CREATE POLICY "Allow authenticated users to manage meta_conversion_logs" ON meta_conversion_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- Create index for the new table
CREATE INDEX IF NOT EXISTS idx_meta_conversion_logs_lead_id ON meta_conversion_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_meta_conversion_logs_created_at ON meta_conversion_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_meta_conversion_logs_success ON meta_conversion_logs(success);

-- Add trigger for updated_at on meta_conversion_logs
CREATE TRIGGER update_meta_conversion_logs_updated_at BEFORE UPDATE ON meta_conversion_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE meta_conversion_logs IS 'Log of Meta Conversions API events sent from the CRM';
COMMENT ON COLUMN meta_conversion_logs.lead_id IS 'Reference to the lead that triggered the event';
COMMENT ON COLUMN meta_conversion_logs.event_name IS 'Name of the Meta event (Lead, Contact, Purchase, etc.)';
COMMENT ON COLUMN meta_conversion_logs.success IS 'Whether the event was successfully sent to Meta';
COMMENT ON COLUMN meta_conversion_logs.meta_response IS 'Response from Meta Conversions API';

-- Insert a sample setting for Meta configuration status
INSERT INTO settings (key, value, description) VALUES
  ('meta_conversions_enabled', 'false', 'Whether Meta Conversions API is enabled and configured')
ON CONFLICT (key) DO NOTHING; 