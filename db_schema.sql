-- Database Schema for Subscription Management System

-- 5. Product Management
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL, -- 'service', 'physical', etc.
  sales_price numeric NOT NULL CHECK (sales_price > 0),
  cost_price numeric DEFAULT 0,
  supports_recurring boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 6. Product Variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  attribute text NOT NULL, -- e.g., 'Brand'
  value text NOT NULL, -- e.g., 'Odoo'
  extra_price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 7. Recurring Plans
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

-- 11. Discount Management
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

-- 12. Tax Management
CREATE TABLE IF NOT EXISTS public.taxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  percentage numeric NOT NULL,
  type text, -- e.g., 'VAT', 'GST'
  created_at timestamptz DEFAULT now()
);

-- 8. Subscription Management
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

CREATE TABLE IF NOT EXISTS public.subscription_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  quantity integer DEFAULT 1,
  unit_price numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  amount numeric NOT NULL, -- (quantity * unit_price) + tax_amount
  created_at timestamptz DEFAULT now()
);

-- 9. Invoice Management
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
  balance numeric DEFAULT 0, -- total_amount - paid_amount
  status text CHECK (status IN ('Draft', 'Confirmed', 'Paid', 'Overdue', 'Cancelled')) DEFAULT 'Draft',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text,
  quantity integer DEFAULT 1,
  unit_price numeric NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 10. Payment Management
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id),
  amount numeric NOT NULL,
  payment_method text, -- 'credit_card', 'bank_transfer', etc.
  payment_date timestamptz DEFAULT now(),
  status text CHECK (status IN ('succeeded', 'pending', 'failed')) DEFAULT 'succeeded',
  reference_id text,
  created_at timestamptz DEFAULT now()
);
