-- Discount Club Cayman Database Schema
-- This migration creates all tables for public/member views, business directory, advertising banners, and certificates

-- 1. Types (ENUMs)
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('member', 'business', 'employer', 'association', 'admin');

DROP TYPE IF EXISTS public.membership_tier CASCADE;
CREATE TYPE public.membership_tier AS ENUM ('individual', 'family', 'employer', 'association');

DROP TYPE IF EXISTS public.banner_position CASCADE;
CREATE TYPE public.banner_position AS ENUM ('top', 'mid', 'bottom');

DROP TYPE IF EXISTS public.banner_duration CASCADE;
CREATE TYPE public.banner_duration AS ENUM ('monthly', 'six_months', 'annual');

DROP TYPE IF EXISTS public.discount_category CASCADE;
CREATE TYPE public.discount_category AS ENUM ('food', 'groceries', 'health', 'auto', 'home', 'services', 'family', 'travel', 'retail', 'entertainment');

-- 2. Core Tables
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'member'::public.user_role,
    membership_tier public.membership_tier DEFAULT 'individual'::public.membership_tier,
    membership_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    category public.discount_category NOT NULL,
    location TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    offer_text TEXT NOT NULL,
    terms TEXT,
    category public.discount_category NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    member_only BOOLEAN DEFAULT true,
    valid_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    face_value DECIMAL(10, 2) NOT NULL,
    member_price DECIMAL(10, 2) NOT NULL,
    quantity_available INTEGER DEFAULT 0,
    quantity_sold INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.certificate_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id UUID REFERENCES public.certificates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    total_paid DECIMAL(10, 2) NOT NULL,
    is_redeemed BOOLEAN DEFAULT false,
    redeemed_at TIMESTAMPTZ,
    purchased_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.advertising_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    position public.banner_position NOT NULL,
    category public.discount_category,
    duration public.banner_duration NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.banner_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position public.banner_position NOT NULL UNIQUE,
    max_slots INTEGER DEFAULT 3,
    monthly_price DECIMAL(10, 2) NOT NULL,
    six_month_discount DECIMAL(5, 2) DEFAULT 5.00,
    annual_discount DECIMAL(5, 2) DEFAULT 5.00,
    rotation_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.travel_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    regular_price DECIMAL(10, 2),
    member_price DECIMAL(10, 2) NOT NULL,
    savings_amount DECIMAL(10, 2),
    destination TEXT,
    deal_type TEXT,
    is_featured BOOLEAN DEFAULT false,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);
CREATE INDEX IF NOT EXISTS idx_discounts_business_id ON public.discounts(business_id);
CREATE INDEX IF NOT EXISTS idx_discounts_category ON public.discounts(category);
CREATE INDEX IF NOT EXISTS idx_certificates_business_id ON public.certificates(business_id);
CREATE INDEX IF NOT EXISTS idx_certificate_purchases_user_id ON public.certificate_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_advertising_banners_business_id ON public.advertising_banners(business_id);
CREATE INDEX IF NOT EXISTS idx_advertising_banners_position ON public.advertising_banners(position);
CREATE INDEX IF NOT EXISTS idx_advertising_banners_category ON public.advertising_banners(category);

-- 4. Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role, membership_tier)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'member'::public.user_role),
        COALESCE((NEW.raw_user_meta_data->>'membership_tier')::public.membership_tier, 'individual'::public.membership_tier)
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertising_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_deals ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- User Profiles
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "public_read_user_profiles" ON public.user_profiles;
CREATE POLICY "public_read_user_profiles"
ON public.user_profiles
FOR SELECT
TO public
USING (true);

-- Businesses
DROP POLICY IF EXISTS "businesses_manage_own" ON public.businesses;
CREATE POLICY "businesses_manage_own"
ON public.businesses
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "public_read_businesses" ON public.businesses;
CREATE POLICY "public_read_businesses"
ON public.businesses
FOR SELECT
TO public
USING (is_active = true);

-- Discounts
DROP POLICY IF EXISTS "discounts_manage_via_business" ON public.discounts;
CREATE POLICY "discounts_manage_via_business"
ON public.discounts
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.id = discounts.business_id
        AND b.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.id = discounts.business_id
        AND b.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "public_read_discounts" ON public.discounts;
CREATE POLICY "public_read_discounts"
ON public.discounts
FOR SELECT
TO public
USING (is_active = true);

-- Certificates
DROP POLICY IF EXISTS "certificates_manage_via_business" ON public.certificates;
CREATE POLICY "certificates_manage_via_business"
ON public.certificates
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.id = certificates.business_id
        AND b.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.id = certificates.business_id
        AND b.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "members_read_certificates" ON public.certificates;
CREATE POLICY "members_read_certificates"
ON public.certificates
FOR SELECT
TO authenticated
USING (is_active = true);

-- Certificate Purchases
DROP POLICY IF EXISTS "users_manage_own_certificate_purchases" ON public.certificate_purchases;
CREATE POLICY "users_manage_own_certificate_purchases"
ON public.certificate_purchases
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Advertising Banners
DROP POLICY IF EXISTS "banners_manage_via_business" ON public.advertising_banners;
CREATE POLICY "banners_manage_via_business"
ON public.advertising_banners
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.id = advertising_banners.business_id
        AND b.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.id = advertising_banners.business_id
        AND b.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "public_read_active_banners" ON public.advertising_banners;
CREATE POLICY "public_read_active_banners"
ON public.advertising_banners
FOR SELECT
TO public
USING (is_active = true AND start_date <= CURRENT_TIMESTAMP AND end_date >= CURRENT_TIMESTAMP);

-- Banner Settings (Admin only)
DROP POLICY IF EXISTS "public_read_banner_settings" ON public.banner_settings;
CREATE POLICY "public_read_banner_settings"
ON public.banner_settings
FOR SELECT
TO public
USING (true);

-- Travel Deals
DROP POLICY IF EXISTS "members_read_travel_deals" ON public.travel_deals;
CREATE POLICY "members_read_travel_deals"
ON public.travel_deals
FOR SELECT
TO authenticated
USING (is_active = true);

-- 7. Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_businesses_updated_at ON public.businesses;
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Mock Data
DO $$
DECLARE
    member_uuid UUID := gen_random_uuid();
    business_uuid UUID := gen_random_uuid();
    employer_uuid UUID := gen_random_uuid();
    association_uuid UUID := gen_random_uuid();
    admin_uuid UUID := gen_random_uuid();
    
    business1_id UUID := gen_random_uuid();
    business2_id UUID := gen_random_uuid();
    business3_id UUID := gen_random_uuid();
    business4_id UUID := gen_random_uuid();
BEGIN
    -- Create auth users
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (member_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'member@example.com', crypt('member123', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Sarah Thompson', 'role', 'member', 'membership_tier', 'family'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (business_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'business@example.com', crypt('business123', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Fosters Food Fair', 'role', 'business'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (employer_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'employer@example.com', crypt('employer123', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Cayman Airways', 'role', 'employer'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (association_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'association@example.com', crypt('association123', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Cayman Islands Chamber', 'role', 'association'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@example.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Admin User', 'role', 'admin'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
    ON CONFLICT (id) DO NOTHING;

    -- Wait for trigger to create user_profiles
    PERFORM pg_sleep(0.1);

    -- Create businesses
    INSERT INTO public.businesses (id, owner_id, name, description, logo_url, category, location, phone, email, is_featured, is_active)
    VALUES
        (business1_id, business_uuid, 'Fosters Food Fair', 'Your trusted grocery store with 32% member discount on weekly shopping', 'https://images.unsplash.com/photo-1589658857538-1bc64f2bc2b8', 'groceries'::public.discount_category, 'George Town', '345-949-5155', 'info@fosters.ky', true, true),
        (business2_id, business_uuid, 'Island Wellness Spa', 'Luxury spa treatments with 25% member discount', 'https://images.unsplash.com/photo-1656570788684-5b1b01709fc1', 'health'::public.discount_category, 'Seven Mile Beach', '345-945-3333', 'spa@islandwellness.ky', true, true),
        (business3_id, business_uuid, 'Coral Reef Restaurant', 'Fine dining with 20% off dinner menu for members', 'https://images.unsplash.com/photo-1560130934-590b85fc08e7', 'food'::public.discount_category, 'George Town', '345-949-7777', 'reservations@coralreef.ky', false, true),
        (business4_id, business_uuid, 'Cayman Auto Care', 'Professional auto services with $50 off full service', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3', 'auto'::public.discount_category, 'West Bay', '345-949-2222', 'service@caymanautoca re.ky', false, true)
    ON CONFLICT (id) DO NOTHING;

    -- Create discounts
    INSERT INTO public.discounts (business_id, title, description, offer_text, terms, category, is_featured, member_only, valid_until)
    VALUES
        (business1_id, '32% Off Weekly Shopping', 'Save big on your weekly grocery shopping at Fosters', '32% off weekly shopping', 'Valid on purchases over $100. Cannot be combined with other offers.', 'groceries'::public.discount_category, true, true, now() + interval '1 year'),
        (business2_id, '25% Off All Spa Treatments', 'Relax and rejuvenate with member-exclusive spa discounts', '25% off all treatments', 'Advance booking required. Subject to availability.', 'health'::public.discount_category, true, true, now() + interval '1 year'),
        (business3_id, '20% Off Dinner Menu', 'Enjoy fine dining at Coral Reef with member savings', '20% off dinner menu', 'Valid Tuesday through Thursday. Reservations recommended.', 'food'::public.discount_category, false, true, now() + interval '6 months'),
        (business4_id, '$50 Off Full Service', 'Professional auto care with member discount', '$50 off full service', 'Cannot be combined with other offers. Valid on services over $200.', 'auto'::public.discount_category, false, true, now() + interval '1 year')
    ON CONFLICT (id) DO NOTHING;

    -- Create certificates
    INSERT INTO public.certificates (business_id, title, description, face_value, member_price, quantity_available, quantity_sold)
    VALUES
        (business1_id, '$50 Grocery Certificate', 'Redeemable at any Fosters location', 50.00, 40.00, 100, 24),
        (business1_id, '$100 Grocery Certificate', 'Redeemable at any Fosters location', 100.00, 75.00, 50, 12),
        (business2_id, '$100 Spa Certificate', 'Redeemable for any spa service', 100.00, 80.00, 30, 8)
    ON CONFLICT (id) DO NOTHING;

    -- Create travel deals
    INSERT INTO public.travel_deals (title, description, image_url, regular_price, member_price, savings_amount, destination, deal_type, is_featured, valid_until)
    VALUES
        ('Hilton Grand Cayman', 'Luxury beachfront resort with member-exclusive rates', 'https://images.unsplash.com/photo-1566073771259-6a8506099945', 299.00, 89.00, 210.00, 'Grand Cayman', 'Hotel', true, now() + interval '3 months'),
        ('Caribbean Cruise Package', 'All-inclusive cruise with member savings', 'https://images.unsplash.com/photo-1548574505-5e239809ee19', 1200.00, 899.00, 301.00, 'Caribbean', 'Cruise', true, now() + interval '6 months'),
        ('Miami Weekend Getaway', 'Flight and hotel package with member discount', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21', 650.00, 499.00, 151.00, 'Miami', 'Package', false, now() + interval '2 months')
    ON CONFLICT (id) DO NOTHING;

    -- Create banner settings
    INSERT INTO public.banner_settings (position, max_slots, monthly_price, six_month_discount, annual_discount, rotation_enabled)
    VALUES
        ('top'::public.banner_position, 3, 500.00, 5.00, 5.00, true),
        ('mid'::public.banner_position, 3, 350.00, 5.00, 5.00, true),
        ('bottom'::public.banner_position, 3, 250.00, 5.00, 5.00, true)
    ON CONFLICT (position) DO NOTHING;

    -- Create sample advertising banners
    INSERT INTO public.advertising_banners (business_id, title, image_url, link_url, position, duration, price, start_date, end_date, display_order)
    VALUES
        (business1_id, 'Fosters Top Banner', 'https://images.unsplash.com/photo-1542838132-92c53300491e', '/business-profile/fosters', 'top'::public.banner_position, 'monthly'::public.banner_duration, 500.00, now(), now() + interval '1 month', 1),
        (business2_id, 'Island Wellness Mid Banner', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef', '/business-profile/island-wellness', 'mid'::public.banner_position, 'six_months'::public.banner_duration, 1995.00, now(), now() + interval '6 months', 1)
    ON CONFLICT (id) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;