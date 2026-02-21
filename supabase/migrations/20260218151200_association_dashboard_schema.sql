-- Association Dashboard Comprehensive Schema
-- Supports company management, revenue tracking, analytics, and renewal management

-- 1. Extend member_companies table with additional fields
ALTER TABLE public.member_companies
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS qty_employees INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS renewal_date DATE,
ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS resale_price DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS profit DECIMAL(10, 2) DEFAULT 0;

-- 2. Create company_employees table (detailed employee records)
CREATE TABLE IF NOT EXISTS public.company_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.member_companies(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  membership_status TEXT DEFAULT 'active',
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create association_revenue_summary table (P&L tracking)
CREATE TABLE IF NOT EXISTS public.association_revenue_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.member_companies(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  qty_employees INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  profit DECIMAL(10, 2) DEFAULT 0,
  profit_margin DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create company_analytics table (usage & savings tracking)
CREATE TABLE IF NOT EXISTS public.company_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.member_companies(id) ON DELETE CASCADE,
  association_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  total_savings DECIMAL(10, 2) DEFAULT 0,
  travel_savings DECIMAL(10, 2) DEFAULT 0,
  discount_savings DECIMAL(10, 2) DEFAULT 0,
  certificate_savings DECIMAL(10, 2) DEFAULT 0,
  return_multiple DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create savings_by_category table (discount category breakdown)
CREATE TABLE IF NOT EXISTS public.savings_by_category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.member_companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  total_savings DECIMAL(10, 2) DEFAULT 0,
  redemption_count INTEGER DEFAULT 0,
  avg_savings_per_redemption DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create certificate_redemptions table (certificate tracking)
CREATE TABLE IF NOT EXISTS public.certificate_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.member_companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  redeemed_value DECIMAL(10, 2) DEFAULT 0,
  redemption_count INTEGER DEFAULT 0,
  avg_value_per_redemption DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create renewal_reminders table (email tracking)
CREATE TABLE IF NOT EXISTS public.renewal_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.member_companies(id) ON DELETE CASCADE,
  association_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  sent_to TEXT NOT NULL,
  status TEXT DEFAULT 'sent'
);

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_employees_company_id ON public.company_employees(company_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_status ON public.company_employees(membership_status);
CREATE INDEX IF NOT EXISTS idx_association_revenue_summary_association_id ON public.association_revenue_summary(association_id);
CREATE INDEX IF NOT EXISTS idx_association_revenue_summary_company_id ON public.association_revenue_summary(company_id);
CREATE INDEX IF NOT EXISTS idx_company_analytics_company_id ON public.company_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_company_analytics_association_id ON public.company_analytics(association_id);
CREATE INDEX IF NOT EXISTS idx_savings_by_category_company_id ON public.savings_by_category(company_id);
CREATE INDEX IF NOT EXISTS idx_certificate_redemptions_company_id ON public.certificate_redemptions(company_id);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_company_id ON public.renewal_reminders(company_id);
CREATE INDEX IF NOT EXISTS idx_member_companies_association_id_status ON public.member_companies(association_id, status);
CREATE INDEX IF NOT EXISTS idx_member_companies_renewal_date ON public.member_companies(renewal_date);

-- 9. Enable RLS
ALTER TABLE public.company_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.association_revenue_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_by_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewal_reminders ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies
-- Company Employees
DROP POLICY IF EXISTS "associations_view_own_company_employees" ON public.company_employees;
CREATE POLICY "associations_view_own_company_employees"
ON public.company_employees
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.member_companies
    WHERE member_companies.id = company_employees.company_id
    AND member_companies.association_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "associations_manage_own_company_employees" ON public.company_employees;
CREATE POLICY "associations_manage_own_company_employees"
ON public.company_employees
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.member_companies
    WHERE member_companies.id = company_employees.company_id
    AND member_companies.association_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.member_companies
    WHERE member_companies.id = company_employees.company_id
    AND member_companies.association_id = auth.uid()
  )
);

-- Association Revenue Summary
DROP POLICY IF EXISTS "associations_view_own_revenue_summary" ON public.association_revenue_summary;
CREATE POLICY "associations_view_own_revenue_summary"
ON public.association_revenue_summary
FOR SELECT
TO authenticated
USING (association_id = auth.uid());

DROP POLICY IF EXISTS "associations_manage_own_revenue_summary" ON public.association_revenue_summary;
CREATE POLICY "associations_manage_own_revenue_summary"
ON public.association_revenue_summary
FOR ALL
TO authenticated
USING (association_id = auth.uid())
WITH CHECK (association_id = auth.uid());

-- Company Analytics
DROP POLICY IF EXISTS "associations_view_own_company_analytics" ON public.company_analytics;
CREATE POLICY "associations_view_own_company_analytics"
ON public.company_analytics
FOR SELECT
TO authenticated
USING (association_id = auth.uid());

DROP POLICY IF EXISTS "associations_manage_own_company_analytics" ON public.company_analytics;
CREATE POLICY "associations_manage_own_company_analytics"
ON public.company_analytics
FOR ALL
TO authenticated
USING (association_id = auth.uid())
WITH CHECK (association_id = auth.uid());

-- Savings by Category
DROP POLICY IF EXISTS "associations_view_own_savings_by_category" ON public.savings_by_category;
CREATE POLICY "associations_view_own_savings_by_category"
ON public.savings_by_category
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.member_companies
    WHERE member_companies.id = savings_by_category.company_id
    AND member_companies.association_id = auth.uid()
  )
);

-- Certificate Redemptions
DROP POLICY IF EXISTS "associations_view_own_certificate_redemptions" ON public.certificate_redemptions;
CREATE POLICY "associations_view_own_certificate_redemptions"
ON public.certificate_redemptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.member_companies
    WHERE member_companies.id = certificate_redemptions.company_id
    AND member_companies.association_id = auth.uid()
  )
);

-- Renewal Reminders
DROP POLICY IF EXISTS "associations_view_own_renewal_reminders" ON public.renewal_reminders;
CREATE POLICY "associations_view_own_renewal_reminders"
ON public.renewal_reminders
FOR SELECT
TO authenticated
USING (association_id = auth.uid());

DROP POLICY IF EXISTS "associations_manage_own_renewal_reminders" ON public.renewal_reminders;
CREATE POLICY "associations_manage_own_renewal_reminders"
ON public.renewal_reminders
FOR ALL
TO authenticated
USING (association_id = auth.uid())
WITH CHECK (association_id = auth.uid());

-- 11. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_company_employees_updated_at ON public.company_employees;
CREATE TRIGGER update_company_employees_updated_at
    BEFORE UPDATE ON public.company_employees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_association_revenue_summary_updated_at ON public.association_revenue_summary;
CREATE TRIGGER update_association_revenue_summary_updated_at
    BEFORE UPDATE ON public.association_revenue_summary
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_analytics_updated_at ON public.company_analytics;
CREATE TRIGGER update_company_analytics_updated_at
    BEFORE UPDATE ON public.company_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_savings_by_category_updated_at ON public.savings_by_category;
CREATE TRIGGER update_savings_by_category_updated_at
    BEFORE UPDATE ON public.savings_by_category
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_certificate_redemptions_updated_at ON public.certificate_redemptions;
CREATE TRIGGER update_certificate_redemptions_updated_at
    BEFORE UPDATE ON public.certificate_redemptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Insert mock data for testing
DO $$
DECLARE
    association_uuid UUID;
    company1_uuid UUID := gen_random_uuid();
    company2_uuid UUID := gen_random_uuid();
    company3_uuid UUID := gen_random_uuid();
BEGIN
    -- Get association user ID
    SELECT id INTO association_uuid
    FROM public.user_profiles
    WHERE role = 'association'::public.user_role
    LIMIT 1;

    IF association_uuid IS NOT NULL THEN
        -- Insert mock companies
        INSERT INTO public.member_companies (
            id, association_id, company_name, contact_name, contact_email, contact_phone,
            qty_employees, status, renewal_date, wholesale_price, resale_price,
            revenue, cost, profit, total_members, total_savings, is_active
        ) VALUES
        (
            company1_uuid, association_uuid, 'ABC Ltd', 'John Smith', 'john@abcltd.com', '+1-345-555-0101',
            45, 'active', CURRENT_DATE + INTERVAL '180 days', 89.99, 119.99,
            5399.55, 4049.55, 1350.00, 45, 21600.00, true
        ),
        (
            company2_uuid, association_uuid, 'XYZ Corp', 'Sarah Johnson', 'sarah@xyzcorp.com', '+1-345-555-0102',
            32, 'active', CURRENT_DATE + INTERVAL '90 days', 89.99, 119.99,
            3839.68, 2879.68, 960.00, 32, 15400.00, true
        ),
        (
            company3_uuid, association_uuid, 'Tech Solutions', 'Mike Davis', 'mike@techsolutions.com', '+1-345-555-0103',
            28, 'expiring_soon', CURRENT_DATE + INTERVAL '25 days', 89.99, 119.99,
            3359.72, 2519.72, 840.00, 28, 12800.00, true
        )
        ON CONFLICT (id) DO NOTHING;

        -- Insert mock employees for company 1
        INSERT INTO public.company_employees (company_id, employee_name, email, phone, membership_status, expiry_date)
        VALUES
        (company1_uuid, 'Alice Brown', 'alice@abcltd.com', '+1-345-555-1001', 'active', CURRENT_DATE + INTERVAL '180 days'),
        (company1_uuid, 'Bob Wilson', 'bob@abcltd.com', '+1-345-555-1002', 'active', CURRENT_DATE + INTERVAL '180 days'),
        (company1_uuid, 'Carol Davis', 'carol@abcltd.com', '+1-345-555-1003', 'active', CURRENT_DATE + INTERVAL '180 days')
        ON CONFLICT DO NOTHING;

        -- Insert mock employees for company 2
        INSERT INTO public.company_employees (company_id, employee_name, email, phone, membership_status, expiry_date)
        VALUES
        (company2_uuid, 'David Martinez', 'david@xyzcorp.com', '+1-345-555-2001', 'active', CURRENT_DATE + INTERVAL '90 days'),
        (company2_uuid, 'Emma Johnson', 'emma@xyzcorp.com', '+1-345-555-2002', 'active', CURRENT_DATE + INTERVAL '90 days')
        ON CONFLICT DO NOTHING;

        -- Insert mock employees for company 3
        INSERT INTO public.company_employees (company_id, employee_name, email, phone, membership_status, expiry_date)
        VALUES
        (company3_uuid, 'Frank Lee', 'frank@techsolutions.com', '+1-345-555-3001', 'active', CURRENT_DATE + INTERVAL '25 days'),
        (company3_uuid, 'Grace Kim', 'grace@techsolutions.com', '+1-345-555-3002', 'active', CURRENT_DATE + INTERVAL '25 days')
        ON CONFLICT DO NOTHING;

        -- Insert mock analytics for companies
        INSERT INTO public.company_analytics (
            company_id, association_id, total_cost, total_savings,
            travel_savings, discount_savings, certificate_savings, return_multiple
        ) VALUES
        (company1_uuid, association_uuid, 4500.00, 21600.00, 8500.00, 9100.00, 4000.00, 4.8),
        (company2_uuid, association_uuid, 3200.00, 15400.00, 6200.00, 6800.00, 2400.00, 4.8),
        (company3_uuid, association_uuid, 2800.00, 12800.00, 5100.00, 5500.00, 2200.00, 4.6)
        ON CONFLICT DO NOTHING;

        -- Insert mock savings by category for company 1
        INSERT INTO public.savings_by_category (company_id, category, total_savings, redemption_count, avg_savings_per_redemption)
        VALUES
        (company1_uuid, 'Restaurants', 3200.00, 45, 71.11),
        (company1_uuid, 'Retail', 2800.00, 38, 73.68),
        (company1_uuid, 'Health & Wellness', 1900.00, 28, 67.86),
        (company1_uuid, 'Services', 1200.00, 22, 54.55)
        ON CONFLICT DO NOTHING;

        -- Insert mock certificate redemptions for company 1
        INSERT INTO public.certificate_redemptions (company_id, category, redeemed_value, redemption_count, avg_value_per_redemption)
        VALUES
        (company1_uuid, 'Dining', 1800.00, 12, 150.00),
        (company1_uuid, 'Spa & Wellness', 1200.00, 8, 150.00),
        (company1_uuid, 'Entertainment', 1000.00, 10, 100.00)
        ON CONFLICT DO NOTHING;

        -- Insert mock revenue summary
        INSERT INTO public.association_revenue_summary (
            association_id, company_id, period_start, period_end,
            qty_employees, revenue, cost, profit, profit_margin
        ) VALUES
        (association_uuid, company1_uuid, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, 45, 5399.55, 4049.55, 1350.00, 25.00),
        (association_uuid, company2_uuid, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, 32, 3839.68, 2879.68, 960.00, 25.00),
        (association_uuid, company3_uuid, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, 28, 3359.72, 2519.72, 840.00, 25.00)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;