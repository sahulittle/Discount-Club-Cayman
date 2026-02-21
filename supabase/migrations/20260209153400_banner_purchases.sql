-- Banner Purchases Migration
-- Adds table for tracking banner purchases via PayPal with payment details and banner management

-- 1. Create banner_purchases table
CREATE TABLE IF NOT EXISTS public.banner_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    banner_id UUID REFERENCES public.advertising_banners(id) ON DELETE SET NULL,
    position public.banner_position NOT NULL,
    duration public.banner_duration NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount_applied DECIMAL(5, 2) DEFAULT 0.00,
    total_paid DECIMAL(10, 2) NOT NULL,
    paypal_order_id TEXT NOT NULL UNIQUE,
    paypal_payer_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    banner_title TEXT NOT NULL,
    banner_image_url TEXT,
    banner_link_url TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add indexes
CREATE INDEX IF NOT EXISTS idx_banner_purchases_business_id ON public.banner_purchases(business_id);
CREATE INDEX IF NOT EXISTS idx_banner_purchases_banner_id ON public.banner_purchases(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_purchases_paypal_order_id ON public.banner_purchases(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_banner_purchases_payment_status ON public.banner_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_banner_purchases_dates ON public.banner_purchases(start_date, end_date);

-- 3. Enable RLS
ALTER TABLE public.banner_purchases ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "businesses_manage_own_banner_purchases" ON public.banner_purchases;
CREATE POLICY "businesses_manage_own_banner_purchases"
ON public.banner_purchases
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

-- 5. Insert banner pricing settings (if not exists)
DO $$
BEGIN
    INSERT INTO public.banner_settings (position, max_slots, monthly_price, six_month_discount, annual_discount, rotation_enabled)
    VALUES 
        ('top'::public.banner_position, 3, 500.00, 5.00, 5.00, true),
        ('mid'::public.banner_position, 3, 350.00, 5.00, 5.00, true),
        ('bottom'::public.banner_position, 3, 250.00, 5.00, 5.00, true)
    ON CONFLICT (position) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Banner settings insertion skipped: %', SQLERRM;
END $$;
