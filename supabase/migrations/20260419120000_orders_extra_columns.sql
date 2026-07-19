-- Add payment_status, delivery_date, boy_costume, girl_costume columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS delivery_date DATE,
  ADD COLUMN IF NOT EXISTS boy_costume TEXT,
  ADD COLUMN IF NOT EXISTS girl_costume TEXT;
