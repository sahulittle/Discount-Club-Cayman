-- Standard Pricing Table Migration
-- Simplifies pricing to single standard pricing per plan type (Individual, Business, Association)
-- Updates existing standard_pricing table structure

-- Drop existing table and recreate with new structure
DROP TABLE IF EXISTS public.standard_pricing CASCADE;

-- Create standard_pricing table with new structure
CREATE TABLE public.standard_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type TEXT NOT NULL CHECK (plan_type IN ('individual', 'business', 'association')),
    annual_price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan_type)
);

-- Add index
CREATE INDEX idx_standard_pricing_plan_type ON public.standard_pricing(plan_type);

-- Enable RLS
ALTER TABLE public.standard_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public read access
DROP POLICY IF EXISTS "public_read_standard_pricing" ON public.standard_pricing;
CREATE POLICY "public_read_standard_pricing"
ON public.standard_pricing
FOR SELECT
TO public
USING (is_active = true);

-- Admin full access
DROP POLICY IF EXISTS "admin_manage_standard_pricing" ON public.standard_pricing;
CREATE POLICY "admin_manage_standard_pricing"
ON public.standard_pricing
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

-- Insert default pricing
INSERT INTO public.standard_pricing (plan_type, annual_price, description)
VALUES 
    ('individual', 119.99, 'Fixed annual pricing for individual members'),
    ('business', 99.99, 'Starting price per member per year. Negotiable for 100+ members.'),
    ('association', 89.99, 'Starting price per member per year. Negotiable pricing available.')
ON CONFLICT (plan_type) DO NOTHING;