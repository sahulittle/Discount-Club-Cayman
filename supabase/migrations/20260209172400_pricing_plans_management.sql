-- Pricing Plans Management Migration
-- Adds ability to create/manage business and association pricing tiers
-- Includes custom pricing assignment for individual businesses

-- 1. Create business pricing plans table
CREATE TABLE IF NOT EXISTS public.business_pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name TEXT NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10, 2) NOT NULL,
    annual_price DECIMAL(10, 2) NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    max_discounts INTEGER,
    max_certificates INTEGER,
    banner_access BOOLEAN DEFAULT false,
    priority_placement BOOLEAN DEFAULT false,
    analytics_access BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create association pricing plans table
CREATE TABLE IF NOT EXISTS public.association_pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name TEXT NOT NULL,
    description TEXT,
    individual_price DECIMAL(10, 2) NOT NULL,
    family_price DECIMAL(10, 2) NOT NULL,
    commission_percentage DECIMAL(5, 2) NOT NULL,
    commission_per_signup DECIMAL(10, 2) NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create business custom pricing table (for individual business pricing overrides)
CREATE TABLE IF NOT EXISTS public.business_custom_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.business_pricing_plans(id) ON DELETE SET NULL,
    custom_monthly_price DECIMAL(10, 2),
    custom_annual_price DECIMAL(10, 2),
    custom_commission_rate DECIMAL(5, 2),
    discount_reason TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id)
);

-- 4. Add indexes
CREATE INDEX IF NOT EXISTS idx_business_pricing_plans_active ON public.business_pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_association_pricing_plans_active ON public.association_pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_business_custom_pricing_business_id ON public.business_custom_pricing(business_id);
CREATE INDEX IF NOT EXISTS idx_business_custom_pricing_plan_id ON public.business_custom_pricing(plan_id);

-- 5. Enable RLS
ALTER TABLE public.business_pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.association_pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_custom_pricing ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Business Pricing Plans - Public read, admin manage
DROP POLICY IF EXISTS "public_read_business_pricing_plans" ON public.business_pricing_plans;
CREATE POLICY "public_read_business_pricing_plans"
ON public.business_pricing_plans
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_business_pricing_plans" ON public.business_pricing_plans;
CREATE POLICY "admin_manage_business_pricing_plans"
ON public.business_pricing_plans
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

-- Association Pricing Plans - Public read, admin manage
DROP POLICY IF EXISTS "public_read_association_pricing_plans" ON public.association_pricing_plans;
CREATE POLICY "public_read_association_pricing_plans"
ON public.association_pricing_plans
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_association_pricing_plans" ON public.association_pricing_plans;
CREATE POLICY "admin_manage_association_pricing_plans"
ON public.association_pricing_plans
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

-- Business Custom Pricing - Business owners can view their own, admin can manage all
DROP POLICY IF EXISTS "business_view_own_custom_pricing" ON public.business_custom_pricing;
CREATE POLICY "business_view_own_custom_pricing"
ON public.business_custom_pricing
FOR SELECT
TO authenticated
USING (
    business_id IN (
        SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

DROP POLICY IF EXISTS "admin_manage_business_custom_pricing" ON public.business_custom_pricing;
CREATE POLICY "admin_manage_business_custom_pricing"
ON public.business_custom_pricing
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

-- 7. Triggers for updated_at
DROP TRIGGER IF EXISTS update_business_pricing_plans_updated_at ON public.business_pricing_plans;
CREATE TRIGGER update_business_pricing_plans_updated_at
    BEFORE UPDATE ON public.business_pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_association_pricing_plans_updated_at ON public.association_pricing_plans;
CREATE TRIGGER update_association_pricing_plans_updated_at
    BEFORE UPDATE ON public.association_pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_custom_pricing_updated_at ON public.business_custom_pricing;
CREATE TRIGGER update_business_custom_pricing_updated_at
    BEFORE UPDATE ON public.business_custom_pricing
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Insert default business pricing plans
INSERT INTO public.business_pricing_plans (plan_name, description, monthly_price, annual_price, max_discounts, max_certificates, banner_access, priority_placement, display_order)
VALUES
    ('Basic', 'Perfect for small businesses starting out', 49.99, 499.99, 5, 2, false, false, 1),
    ('Professional', 'For growing businesses with more offers', 99.99, 999.99, 15, 5, true, false, 2),
    ('Premium', 'Full access with priority placement', 199.99, 1999.99, 999, 999, true, true, 3)
ON CONFLICT (id) DO NOTHING;

-- 9. Insert default association pricing plans
INSERT INTO public.association_pricing_plans (plan_name, description, individual_price, family_price, commission_percentage, commission_per_signup, display_order)
VALUES
    ('Standard Association', 'Standard association member pricing', 69.99, 119.99, 12.50, 15.00, 1),
    ('Premium Association', 'Premium association with better rates', 59.99, 99.99, 15.00, 20.00, 2),
    ('Enterprise Association', 'Best rates for large associations', 49.99, 89.99, 20.00, 25.00, 3)
ON CONFLICT (id) DO NOTHING;