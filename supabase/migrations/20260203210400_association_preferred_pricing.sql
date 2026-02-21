-- Association Preferred Pricing & Revenue Share Migration
-- Adds special pricing tier for associations better than employer pricing
-- Includes commission tracking and revenue share for association coffers

-- 1. Add association-specific pricing columns to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS association_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS membership_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 0.00;

-- 2. Create association pricing tiers table
CREATE TABLE IF NOT EXISTS public.association_pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    association_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL,
    individual_price DECIMAL(10, 2) NOT NULL,
    family_price DECIMAL(10, 2),
    commission_per_signup DECIMAL(10, 2) NOT NULL,
    commission_percentage DECIMAL(5, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create association revenue tracking table
CREATE TABLE IF NOT EXISTS public.association_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    association_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    membership_type public.membership_tier NOT NULL,
    membership_price DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create standard pricing reference table
CREATE TABLE IF NOT EXISTS public.standard_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_type TEXT NOT NULL UNIQUE,
    individual_price DECIMAL(10, 2) NOT NULL,
    family_price DECIMAL(10, 2),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Add indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_association_id ON public.user_profiles(association_id);
CREATE INDEX IF NOT EXISTS idx_association_pricing_tiers_association_id ON public.association_pricing_tiers(association_id);
CREATE INDEX IF NOT EXISTS idx_association_revenue_association_id ON public.association_revenue(association_id);
CREATE INDEX IF NOT EXISTS idx_association_revenue_member_id ON public.association_revenue(member_id);

-- 6. Enable RLS
ALTER TABLE public.association_pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.association_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_pricing ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Association Pricing Tiers
DROP POLICY IF EXISTS "associations_manage_own_pricing" ON public.association_pricing_tiers;
CREATE POLICY "associations_manage_own_pricing"
ON public.association_pricing_tiers
FOR ALL
TO authenticated
USING (
    association_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
)
WITH CHECK (
    association_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

DROP POLICY IF EXISTS "public_read_association_pricing" ON public.association_pricing_tiers;
CREATE POLICY "public_read_association_pricing"
ON public.association_pricing_tiers
FOR SELECT
TO public
USING (is_active = true);

-- Association Revenue
DROP POLICY IF EXISTS "associations_view_own_revenue" ON public.association_revenue;
CREATE POLICY "associations_view_own_revenue"
ON public.association_revenue
FOR SELECT
TO authenticated
USING (
    association_id = auth.uid() OR
    member_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

DROP POLICY IF EXISTS "system_insert_association_revenue" ON public.association_revenue;
CREATE POLICY "system_insert_association_revenue"
ON public.association_revenue
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Standard Pricing
DROP POLICY IF EXISTS "public_read_standard_pricing" ON public.standard_pricing;
CREATE POLICY "public_read_standard_pricing"
ON public.standard_pricing
FOR SELECT
TO public
USING (is_active = true);

-- 8. Triggers
DROP TRIGGER IF EXISTS update_association_pricing_tiers_updated_at ON public.association_pricing_tiers;
CREATE TRIGGER update_association_pricing_tiers_updated_at
    BEFORE UPDATE ON public.association_pricing_tiers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_standard_pricing_updated_at ON public.standard_pricing;
CREATE TRIGGER update_standard_pricing_updated_at
    BEFORE UPDATE ON public.standard_pricing
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Insert standard pricing tiers
INSERT INTO public.standard_pricing (tier_type, individual_price, family_price, description)
VALUES
    ('individual', 119.99, NULL, 'Standard individual membership - annual'),
    ('family', 179.99, 179.99, 'Standard family membership (up to 4 members) - annual'),
    ('employer', 89.99, 149.99, 'Employer-sponsored pricing - better than individual rates'),
    ('association_preferred', 69.99, 119.99, 'Association preferred pricing - best available rates, better than employer')
ON CONFLICT (tier_type) DO NOTHING;

-- 10. Insert mock association pricing and revenue data
DO $$
DECLARE
    association_uuid UUID;
    member1_uuid UUID := gen_random_uuid();
    member2_uuid UUID := gen_random_uuid();
    pricing_tier_id UUID := gen_random_uuid();
BEGIN
    -- Get the association user ID from existing mock data
    SELECT id INTO association_uuid
    FROM public.user_profiles
    WHERE role = 'association'::public.user_role
    LIMIT 1;

    IF association_uuid IS NOT NULL THEN
        -- Create association pricing tier
        INSERT INTO public.association_pricing_tiers (
            id, association_id, tier_name, individual_price, family_price,
            commission_per_signup, commission_percentage, is_active
        )
        VALUES (
            pricing_tier_id,
            association_uuid,
            'Cayman Islands Chamber Preferred',
            69.99,
            119.99,
            15.00,
            12.50,
            true
        )
        ON CONFLICT (id) DO NOTHING;

        -- Create mock association members with revenue tracking
        -- Member 1
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
            is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
            recovery_token, recovery_sent_at, email_change_token_new, email_change,
            email_change_sent_at, email_change_token_current, email_change_confirm_status,
            reauthentication_token, reauthentication_sent_at, phone, phone_change,
            phone_change_token, phone_change_sent_at
        ) VALUES (
            member1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'assoc.member1@example.com', crypt('member123', gen_salt('bf', 10)), now(), now(), now(),
            jsonb_build_object('full_name', 'David Martinez', 'role', 'member', 'membership_tier', 'individual'),
            jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
            false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
        )
        ON CONFLICT (id) DO NOTHING;

        -- Wait for trigger
        PERFORM pg_sleep(0.1);

        -- Update member to link to association
        UPDATE public.user_profiles
        SET association_id = association_uuid,
            membership_price = 69.99,
            membership_expires_at = now() + interval '1 year'
        WHERE id = member1_uuid;

        -- Record revenue for association
        INSERT INTO public.association_revenue (
            association_id, member_id, membership_type, membership_price,
            commission_amount, commission_rate, payment_status, paid_at
        )
        VALUES (
            association_uuid,
            member1_uuid,
            'individual'::public.membership_tier,
            69.99,
            15.00,
            12.50,
            'paid',
            now() - interval '15 days'
        )
        ON CONFLICT (id) DO NOTHING;

        -- Member 2
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
            is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
            recovery_token, recovery_sent_at, email_change_token_new, email_change,
            email_change_sent_at, email_change_token_current, email_change_confirm_status,
            reauthentication_token, reauthentication_sent_at, phone, phone_change,
            phone_change_token, phone_change_sent_at
        ) VALUES (
            member2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'assoc.member2@example.com', crypt('member123', gen_salt('bf', 10)), now(), now(), now(),
            jsonb_build_object('full_name', 'Emma Johnson', 'role', 'member', 'membership_tier', 'family'),
            jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
            false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
        )
        ON CONFLICT (id) DO NOTHING;

        -- Wait for trigger
        PERFORM pg_sleep(0.1);

        -- Update member to link to association
        UPDATE public.user_profiles
        SET association_id = association_uuid,
            membership_price = 119.99,
            membership_expires_at = now() + interval '1 year'
        WHERE id = member2_uuid;

        -- Record revenue for association
        INSERT INTO public.association_revenue (
            association_id, member_id, membership_type, membership_price,
            commission_amount, commission_rate, payment_status, paid_at
        )
        VALUES (
            association_uuid,
            member2_uuid,
            'family'::public.membership_tier,
            119.99,
            15.00,
            12.50,
            'paid',
            now() - interval '8 days'
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Association pricing mock data insertion failed: %', SQLERRM;
END $$;