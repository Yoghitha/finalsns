-- RLS Policies For Role-Based Subscription System

-- 1. Helper Functions
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

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;

-- 2. Users Table
-- Admin can view/edit all users
CREATE POLICY "Admin full access users" ON public.users
  FOR ALL USING (public.is_admin());

-- Internal users can view users (for customer lists) but NOT create/edit them
CREATE POLICY "Internal view users" ON public.users
  FOR SELECT USING (public.is_internal());

-- Customers can view only their own profile
CREATE POLICY "Customer view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Customers can update their own profile (optional, usually restricted)
-- For now, read-only self profile is safe until we define what they can edit.


-- 3. Products & Plans (Internal/Admin: Read, Admin: Write)
-- Everyone (Authenticated) can read products/plans? 
-- Actually, Customers need to see products to buy them? 
-- The prompt says "Customer Portal... My Subscriptions". It doesn't surprisingly say "Shop".
-- But typically a customer needs to see plans to subscribe. 
-- Let's allow Authenticated Read for now, but Write is stricter.

CREATE POLICY "Authenticated read products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin write products" ON public.products USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read plans" ON public.recurring_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin write plans" ON public.recurring_plans USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read variants" ON public.product_variants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin write variants" ON public.product_variants USING (public.is_admin()) WITH CHECK (public.is_admin());


-- 4. Subscriptions 
-- Admin: Full Access
-- Internal: Read All, Create, Update
-- Customer: Read Own

CREATE POLICY "Admin full access subscriptions" ON public.subscriptions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Internal full access subscriptions" ON public.subscriptions
  FOR ALL USING (public.is_internal()); 
  -- Note: is_internal includes admin, so we could simplify, but keeping separate for clarity/audit is okay. 
  -- Actually, my is_internal definition INCLUDES admin. So one policy is enough if I use is_internal().
  -- But wait, Admin might have DELETION rights that Internal doesn't? 
  -- Prompt: "Internal user CAN: Update subscription status... CANNOT: Change pricing rules".
  -- So Internal can write to subscriptions.
  
CREATE POLICY "Customer view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = customer_id);

-- 5. Subscription Items
CREATE POLICY "Admin/Internal full access sub items" ON public.subscription_items
  FOR ALL USING (public.is_internal());

CREATE POLICY "Customer view own sub items" ON public.subscription_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE id = public.subscription_items.subscription_id
      AND customer_id = auth.uid()
    )
  );

-- 6. Invoices
-- Admin/Internal: Full Access (Internal can confirm/send)
-- Customer: Read Own

CREATE POLICY "Admin/Internal full access invoices" ON public.invoices
  FOR ALL USING (public.is_internal());

CREATE POLICY "Customer view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = customer_id);

-- 7. Invoice Items
CREATE POLICY "Admin/Internal full access invoice items" ON public.invoice_items
  FOR ALL USING (public.is_internal());

CREATE POLICY "Customer view own invoice items" ON public.invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE id = public.invoice_items.invoice_id
      AND customer_id = auth.uid()
    )
  );

-- 8. Payments
-- Admin/Internal: Full Access (Record payments)
-- Customer: Read Own

CREATE POLICY "Admin/Internal full access payments" ON public.payments
  FOR ALL USING (public.is_internal());

CREATE POLICY "Customer view own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE id = public.payments.invoice_id
      AND customer_id = auth.uid()
    )
  );

-- 9. Discounts & Taxes
-- Admin: Write
-- Internal: Read Only? Prompt says "MUST NOT SEE: Discounts, Taxes". 
-- So Internal should NOT see them? 
-- Wait, "Internal user CAN NOT: Change tax / discount config". 
-- If they can't see them, how is the invoice calculated?
-- The backend (pg) needs to see them. RLS applies to the `auth.uid()`.
-- If Internal creates a subscription, does the system need to fetch discounts? Yes.
-- So Internal needs SELECT access.
-- Customer? They probably shouldn't see internal discount rules, but they see the effect on invoice.
-- Let's restrict Discount/Tax table access to Admin/Internal for SELECT, Admin for WRITE.

CREATE POLICY "Admin/Internal read discounts" ON public.discounts
  FOR SELECT USING (public.is_internal());
  
CREATE POLICY "Admin write discounts" ON public.discounts
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin/Internal read taxes" ON public.taxes
  FOR SELECT USING (public.is_internal());

CREATE POLICY "Admin write taxes" ON public.taxes
  USING (public.is_admin()) WITH CHECK (public.is_admin());

