-- 1. CLEANUP (Hypothetical - be careful running this if you have data you want to keep)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- 2. ENUMS & HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_internal()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'internal')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text CHECK (role IN ('admin', 'internal', 'customer')) NOT NULL DEFAULT 'customer',
  status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. PRODUCTS & VARIANTS
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  sales_price numeric NOT NULL CHECK (sales_price > 0),
  cost_price numeric DEFAULT 0,
  supports_recurring boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  attribute text NOT NULL,
  value text NOT NULL,
  extra_price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 5. RECURRING PLANS
CREATE TABLE IF NOT EXISTS public.recurring_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  billing_period text CHECK (billing_period IN ('daily', 'weekly', 'monthly', 'yearly')),
  min_quantity integer DEFAULT 1,
  start_date date,
  end_date date,
  auto_close boolean DEFAULT false,
  pausable boolean DEFAULT true,
  renewable boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.recurring_plans ENABLE ROW LEVEL SECURITY;

-- 6. DISCOUNTS & TAXES
CREATE TABLE IF NOT EXISTS public.discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('fixed', 'percentage')),
  value numeric NOT NULL,
  min_purchase numeric DEFAULT 0,
  min_quantity integer DEFAULT 0,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  usage_limit integer,
  applies_to text CHECK (applies_to IN ('product', 'subscription')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.taxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  percentage numeric NOT NULL,
  type text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;

-- 7. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_number text UNIQUE DEFAULT ('SUB-' || to_char(now(), 'YYYYMMDDHH24MISS')),
  customer_id uuid REFERENCES public.users(id) NOT NULL,
  plan_id uuid REFERENCES public.recurring_plans(id),
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  status text CHECK (status IN ('Draft', 'Quotation', 'Confirmed', 'Active', 'Closed')) DEFAULT 'Draft',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.subscription_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  quantity integer DEFAULT 1,
  unit_price numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.subscription_items ENABLE ROW LEVEL SECURITY;

-- 8. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE DEFAULT ('INV-' || to_char(now(), 'YYYYMMDDHH24MISS')),
  subscription_id uuid REFERENCES public.subscriptions(id),
  customer_id uuid REFERENCES public.users(id) NOT NULL,
  issue_date date DEFAULT CURRENT_DATE,
  due_date date,
  subtotal numeric DEFAULT 0,
  tax_total numeric DEFAULT 0,
  discount_total numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  balance numeric DEFAULT 0,
  status text CHECK (status IN ('Draft', 'Confirmed', 'Paid', 'Overdue', 'Cancelled')) DEFAULT 'Draft',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text,
  quantity integer DEFAULT 1,
  unit_price numeric NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- 9. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id),
  amount numeric NOT NULL,
  payment_method text,
  payment_date timestamptz DEFAULT now(),
  status text CHECK (status IN ('succeeded', 'pending', 'failed')) DEFAULT 'succeeded',
  reference_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 10. TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, status)
  VALUES (new.id, new.email, 'customer', 'active')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. RLS POLICIES

-- Users
DROP POLICY IF EXISTS "Admin full access users" ON public.users;
CREATE POLICY "Admin full access users" ON public.users FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Internal view users" ON public.users;
CREATE POLICY "Internal view users" ON public.users FOR SELECT USING (public.is_internal());

DROP POLICY IF EXISTS "Customer view own profile" ON public.users;
CREATE POLICY "Customer view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- Products & Plans (Public Read for Storefront/Customer? Authenticated Read?)
-- Prompt says: Customer "Cannot: Access admin/internal tools". But they "View Subscriptions" implies buying them?
-- Let's stick to AUTHENTICATED READ for basic data.
DROP POLICY IF EXISTS "Authenticated read products" ON public.products;
CREATE POLICY "Authenticated read products" ON public.products FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin write products" ON public.products;
CREATE POLICY "Admin write products" ON public.products USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated read plans" ON public.recurring_plans;
CREATE POLICY "Authenticated read plans" ON public.recurring_plans FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin write plans" ON public.recurring_plans;
CREATE POLICY "Admin write plans" ON public.recurring_plans USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Subscriptions
DROP POLICY IF EXISTS "Admin full access subscriptions" ON public.subscriptions;
CREATE POLICY "Admin full access subscriptions" ON public.subscriptions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Internal full access subscriptions" ON public.subscriptions;
CREATE POLICY "Internal full access subscriptions" ON public.subscriptions FOR ALL USING (public.is_internal());

DROP POLICY IF EXISTS "Customer view own subscriptions" ON public.subscriptions;
CREATE POLICY "Customer view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = customer_id);

-- Subscription Items
DROP POLICY IF EXISTS "Admin/Internal full access sub items" ON public.subscription_items;
CREATE POLICY "Admin/Internal full access sub items" ON public.subscription_items FOR ALL USING (public.is_internal());

DROP POLICY IF EXISTS "Customer view own sub items" ON public.subscription_items;
CREATE POLICY "Customer view own sub items" ON public.subscription_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.subscriptions WHERE id = subscription_id AND customer_id = auth.uid())
);

-- Invoices
DROP POLICY IF EXISTS "Admin/Internal full access invoices" ON public.invoices;
CREATE POLICY "Admin/Internal full access invoices" ON public.invoices FOR ALL USING (public.is_internal());

DROP POLICY IF EXISTS "Customer view own invoices" ON public.invoices;
CREATE POLICY "Customer view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = customer_id);

-- Invoice Items
DROP POLICY IF EXISTS "Admin/Internal full access invoice items" ON public.invoice_items;
CREATE POLICY "Admin/Internal full access invoice items" ON public.invoice_items FOR ALL USING (public.is_internal());

DROP POLICY IF EXISTS "Customer view own invoice items" ON public.invoice_items;
CREATE POLICY "Customer view own invoice items" ON public.invoice_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.invoices WHERE id = invoice_id AND customer_id = auth.uid())
);

-- Payments
DROP POLICY IF EXISTS "Admin/Internal full access payments" ON public.payments;
CREATE POLICY "Admin/Internal full access payments" ON public.payments FOR ALL USING (public.is_internal());

DROP POLICY IF EXISTS "Customer view own payments" ON public.payments;
CREATE POLICY "Customer view own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.invoices WHERE id = invoice_id AND customer_id = auth.uid())
);

-- Taxes & Discounts
DROP POLICY IF EXISTS "Admin/Internal read discounts" ON public.discounts;
CREATE POLICY "Admin/Internal read discounts" ON public.discounts FOR SELECT USING (public.is_internal());
DROP POLICY IF EXISTS "Admin write discounts" ON public.discounts;
CREATE POLICY "Admin write discounts" ON public.discounts USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin/Internal read taxes" ON public.taxes;
CREATE POLICY "Admin/Internal read taxes" ON public.taxes FOR SELECT USING (public.is_internal());
DROP POLICY IF EXISTS "Admin write taxes" ON public.taxes;
CREATE POLICY "Admin write taxes" ON public.taxes USING (public.is_admin()) WITH CHECK (public.is_admin());
