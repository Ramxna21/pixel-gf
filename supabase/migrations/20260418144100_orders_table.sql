-- Orders table for capturing order form submissions
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  anniversary_date DATE NOT NULL,
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public order form, no auth required)
DROP POLICY IF EXISTS "public_can_insert_orders" ON public.orders;
CREATE POLICY "public_can_insert_orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (true);

-- Only authenticated users (admins) can read orders
DROP POLICY IF EXISTS "authenticated_can_read_orders" ON public.orders;
CREATE POLICY "authenticated_can_read_orders"
ON public.orders
FOR SELECT
TO authenticated
USING (true);
