-- Multi-Portal Platform Enhancements
-- Adds B2B directory, employee management, QR codes, email campaigns, and billing

-- 1. B2B Business Partner Type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'b2b_partner_type') THEN
    CREATE TYPE public.b2b_partner_type AS ENUM ('employer', 'business_partner', 'association');
  END IF;
END$$;

-- 2. Employee Status Type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_status') THEN
    CREATE TYPE public.employee_status AS ENUM ('active', 'pending', 'inactive', 'travel_locked');
  END IF;
END$$;

-- 3. B2B Directory Table
CREATE TABLE IF NOT EXISTS public.b2b_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  partner_type public.b2b_partner_type NOT NULL,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  category public.discount_category,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Employees Table (for Employer dashboard)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status public.employee_status DEFAULT 'pending'::public.employee_status,
  is_travel_locked BOOLEAN DEFAULT false,
  membership_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_TIMESTAMP),
  seats_assigned INTEGER DEFAULT 1,
  joined_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Company Memberships Table (for Employer seat management)
CREATE TABLE IF NOT EXISTS public.company_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  membership_year INTEGER NOT NULL,
  seats_purchased INTEGER NOT NULL,
  seats_assigned INTEGER DEFAULT 0,
  expiry_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Member QR Codes Table (rotating QR codes)
CREATE TABLE IF NOT EXISTS public.member_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  qr_code_data TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- 7. Email Campaigns Table (for B2B partners)
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  sent_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Billing Records Table (for B2B partners)
CREATE TABLE IF NOT EXISTS public.billing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  billing_year INTEGER NOT NULL,
  annual_fee DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_proof_url TEXT,
  renewal_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Business Offers Table (for Business Partner profile)
CREATE TABLE IF NOT EXISTS public.business_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  offer_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  terms TEXT,
  status TEXT DEFAULT 'draft',
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Member Companies Table (for Association dashboard)
CREATE TABLE IF NOT EXISTS public.member_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  total_members INTEGER DEFAULT 0,
  total_savings DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Analytics Tracking Table (for Admin advanced analytics)
CREATE TABLE IF NOT EXISTS public.analytics_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  savings_amount DECIMAL(10, 2) DEFAULT 0,
  category public.discount_category,
  district TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Indexes
CREATE INDEX IF NOT EXISTS idx_b2b_directory_user_id ON public.b2b_directory(user_id);
CREATE INDEX IF NOT EXISTS idx_b2b_directory_partner_type ON public.b2b_directory(partner_type);
CREATE INDEX IF NOT EXISTS idx_employees_employer_id ON public.employees(employer_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_company_memberships_employer_id ON public.company_memberships(employer_id);
CREATE INDEX IF NOT EXISTS idx_member_qr_codes_user_id ON public.member_qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sender_id ON public.email_campaigns(sender_id);
CREATE INDEX IF NOT EXISTS idx_billing_records_user_id ON public.billing_records(user_id);
CREATE INDEX IF NOT EXISTS idx_business_offers_business_id ON public.business_offers(business_id);
CREATE INDEX IF NOT EXISTS idx_member_companies_association_id ON public.member_companies(association_id);
CREATE INDEX IF NOT EXISTS idx_analytics_tracking_user_id ON public.analytics_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_tracking_event_type ON public.analytics_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_tracking_created_at ON public.analytics_tracking(created_at);

-- 13. Enable RLS
ALTER TABLE public.b2b_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_tracking ENABLE ROW LEVEL SECURITY;

-- 14. RLS Policies

-- B2B Directory: Public read, authenticated users manage own
DROP POLICY IF EXISTS "public_read_b2b_directory" ON public.b2b_directory;
CREATE POLICY "public_read_b2b_directory"
ON public.b2b_directory
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "users_manage_own_b2b_directory" ON public.b2b_directory;
CREATE POLICY "users_manage_own_b2b_directory"
ON public.b2b_directory
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Employees: Employers manage their own employees
DROP POLICY IF EXISTS "employers_manage_employees" ON public.employees;
CREATE POLICY "employers_manage_employees"
ON public.employees
FOR ALL
TO authenticated
USING (employer_id = auth.uid())
WITH CHECK (employer_id = auth.uid());

-- Company Memberships: Employers manage their own
DROP POLICY IF EXISTS "employers_manage_memberships" ON public.company_memberships;
CREATE POLICY "employers_manage_memberships"
ON public.company_memberships
FOR ALL
TO authenticated
USING (employer_id = auth.uid())
WITH CHECK (employer_id = auth.uid());

-- Member QR Codes: Users manage their own
DROP POLICY IF EXISTS "users_manage_own_qr_codes" ON public.member_qr_codes;
CREATE POLICY "users_manage_own_qr_codes"
ON public.member_qr_codes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Email Campaigns: Users manage their own
DROP POLICY IF EXISTS "users_manage_own_campaigns" ON public.email_campaigns;
CREATE POLICY "users_manage_own_campaigns"
ON public.email_campaigns
FOR ALL
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Billing Records: Users manage their own
DROP POLICY IF EXISTS "users_manage_own_billing" ON public.billing_records;
CREATE POLICY "users_manage_own_billing"
ON public.billing_records
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Business Offers: Business owners manage their own
DROP POLICY IF EXISTS "business_owners_manage_offers" ON public.business_offers;
CREATE POLICY "business_owners_manage_offers"
ON public.business_offers
FOR ALL
TO authenticated
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "public_read_business_offers" ON public.business_offers;
CREATE POLICY "public_read_business_offers"
ON public.business_offers
FOR SELECT
TO authenticated
USING (is_active = true AND status = 'live');

-- Member Companies: Associations manage their own
DROP POLICY IF EXISTS "associations_manage_member_companies" ON public.member_companies;
CREATE POLICY "associations_manage_member_companies"
ON public.member_companies
FOR ALL
TO authenticated
USING (association_id = auth.uid())
WITH CHECK (association_id = auth.uid());

-- Analytics Tracking: Users can insert their own, admins can read all
DROP POLICY IF EXISTS "users_insert_own_analytics" ON public.analytics_tracking;
CREATE POLICY "users_insert_own_analytics"
ON public.analytics_tracking
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_read_all_analytics" ON public.analytics_tracking;
CREATE POLICY "admins_read_all_analytics"
ON public.analytics_tracking
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'::public.user_role
  )
);

-- 15. Updated_at triggers
DROP TRIGGER IF EXISTS update_b2b_directory_updated_at ON public.b2b_directory;
CREATE TRIGGER update_b2b_directory_updated_at
BEFORE UPDATE ON public.b2b_directory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_memberships_updated_at ON public.company_memberships;
CREATE TRIGGER update_company_memberships_updated_at
BEFORE UPDATE ON public.company_memberships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
BEFORE UPDATE ON public.email_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_billing_records_updated_at ON public.billing_records;
CREATE TRIGGER update_billing_records_updated_at
BEFORE UPDATE ON public.billing_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_offers_updated_at ON public.business_offers;
CREATE TRIGGER update_business_offers_updated_at
BEFORE UPDATE ON public.business_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_member_companies_updated_at ON public.member_companies;
CREATE TRIGGER update_member_companies_updated_at
BEFORE UPDATE ON public.member_companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();