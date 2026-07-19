-- Add payment columns to orders table for Midtrans integration
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'midtrans',
  ADD COLUMN IF NOT EXISTS midtrans_order_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS midtrans_snap_token TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Index for fast lookup by midtrans_order_id (used in webhook)
CREATE INDEX IF NOT EXISTS idx_orders_midtrans_order_id ON public.orders(midtrans_order_id);

-- Allow authenticated users (admins) to update orders
DROP POLICY IF EXISTS "authenticated_can_update_orders" ON public.orders;
CREATE POLICY "authenticated_can_update_orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow service role to update orders (for webhook)
DROP POLICY IF EXISTS "service_can_update_orders" ON public.orders;
CREATE POLICY "service_can_update_orders"
ON public.orders
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);
