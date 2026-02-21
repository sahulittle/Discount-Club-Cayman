-- Ad Performance Tracking Migration
-- Adds tables for tracking banner ad views, clicks, impressions, and performance metrics
-- Enables association analytics dashboard with revenue summaries and forecasts

-- 1. Create ad performance tracking table
CREATE TABLE IF NOT EXISTS public.ad_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_id UUID REFERENCES public.advertising_banners(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE WHEN views > 0 THEN (clicks::DECIMAL / views::DECIMAL * 100) ELSE 0 END
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(banner_id, date)
);

-- 2. Create ad revenue summary table (aggregated by placement and category)
CREATE TABLE IF NOT EXISTS public.ad_revenue_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    association_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    placement public.banner_position,
    category public.discount_category,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    total_ads INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    avg_ctr DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add indexes
CREATE INDEX IF NOT EXISTS idx_ad_performance_banner_id ON public.ad_performance(banner_id);
CREATE INDEX IF NOT EXISTS idx_ad_performance_business_id ON public.ad_performance(business_id);
CREATE INDEX IF NOT EXISTS idx_ad_performance_date ON public.ad_performance(date);
CREATE INDEX IF NOT EXISTS idx_ad_revenue_summary_association_id ON public.ad_revenue_summary(association_id);
CREATE INDEX IF NOT EXISTS idx_ad_revenue_summary_period ON public.ad_revenue_summary(period_start, period_end);

-- 4. Enable RLS
ALTER TABLE public.ad_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_revenue_summary ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Ad Performance
DROP POLICY IF EXISTS "businesses_view_own_ad_performance" ON public.ad_performance;
CREATE POLICY "businesses_view_own_ad_performance"
ON public.ad_performance
FOR SELECT
TO authenticated
USING (
    business_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    ) OR
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'association'::public.user_role
    )
);

DROP POLICY IF EXISTS "system_insert_ad_performance" ON public.ad_performance;
CREATE POLICY "system_insert_ad_performance"
ON public.ad_performance
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "system_update_ad_performance" ON public.ad_performance;
CREATE POLICY "system_update_ad_performance"
ON public.ad_performance
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Ad Revenue Summary
DROP POLICY IF EXISTS "associations_view_revenue_summary" ON public.ad_revenue_summary;
CREATE POLICY "associations_view_revenue_summary"
ON public.ad_revenue_summary
FOR SELECT
TO authenticated
USING (
    association_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

DROP POLICY IF EXISTS "system_manage_revenue_summary" ON public.ad_revenue_summary;
CREATE POLICY "system_manage_revenue_summary"
ON public.ad_revenue_summary
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Triggers
DROP TRIGGER IF EXISTS update_ad_performance_updated_at ON public.ad_performance;
CREATE TRIGGER update_ad_performance_updated_at
    BEFORE UPDATE ON public.ad_performance
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ad_revenue_summary_updated_at ON public.ad_revenue_summary;
CREATE TRIGGER update_ad_revenue_summary_updated_at
    BEFORE UPDATE ON public.ad_revenue_summary
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Insert mock ad performance data
DO $$
DECLARE
    banner_rec RECORD;
    days_back INTEGER;
    daily_views INTEGER;
    daily_clicks INTEGER;
BEGIN
    -- Generate performance data for all active banners
    FOR banner_rec IN 
        SELECT id, business_id, position, category
        FROM public.advertising_banners
        WHERE is_active = true
    LOOP
        -- Generate last 30 days of performance data
        FOR days_back IN 0..29 LOOP
            -- Randomize views and clicks based on position
            daily_views := CASE banner_rec.position
                WHEN 'top'::public.banner_position THEN 150 + floor(random() * 100)::INTEGER
                WHEN 'mid'::public.banner_position THEN 100 + floor(random() * 80)::INTEGER
                WHEN 'bottom'::public.banner_position THEN 60 + floor(random() * 50)::INTEGER
            END;
            
            daily_clicks := floor(daily_views * (0.02 + random() * 0.03))::INTEGER;
            
            INSERT INTO public.ad_performance (
                banner_id,
                business_id,
                date,
                views,
                clicks,
                impressions
            )
            VALUES (
                banner_rec.id,
                banner_rec.business_id,
                CURRENT_DATE - days_back,
                daily_views,
                daily_clicks,
                daily_views
            )
            ON CONFLICT (banner_id, date) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 8. Insert mock revenue summary data
DO $$
DECLARE
    association_uuid UUID;
    placement_val public.banner_position;
    category_val public.discount_category;
BEGIN
    -- Get association user
    SELECT id INTO association_uuid
    FROM public.user_profiles
    WHERE role = 'association'::public.user_role
    LIMIT 1;

    IF association_uuid IS NOT NULL THEN
        -- Generate revenue summaries by placement
        FOR placement_val IN SELECT unnest(ARRAY['top'::public.banner_position, 'mid'::public.banner_position, 'bottom'::public.banner_position])
        LOOP
            INSERT INTO public.ad_revenue_summary (
                association_id,
                period_start,
                period_end,
                placement,
                category,
                total_revenue,
                total_ads,
                total_views,
                total_clicks,
                avg_ctr
            )
            SELECT
                association_uuid,
                CURRENT_DATE - 30,
                CURRENT_DATE,
                placement_val,
                NULL,
                CASE placement_val
                    WHEN 'top'::public.banner_position THEN 2500.00 + (random() * 500)::DECIMAL(10,2)
                    WHEN 'mid'::public.banner_position THEN 1750.00 + (random() * 350)::DECIMAL(10,2)
                    WHEN 'bottom'::public.banner_position THEN 1000.00 + (random() * 200)::DECIMAL(10,2)
                END,
                CASE placement_val
                    WHEN 'top'::public.banner_position THEN 5
                    WHEN 'mid'::public.banner_position THEN 5
                    WHEN 'bottom'::public.banner_position THEN 3
                END,
                CASE placement_val
                    WHEN 'top'::public.banner_position THEN 4500
                    WHEN 'mid'::public.banner_position THEN 3000
                    WHEN 'bottom'::public.banner_position THEN 1800
                END,
                CASE placement_val
                    WHEN 'top'::public.banner_position THEN 135
                    WHEN 'mid'::public.banner_position THEN 90
                    WHEN 'bottom'::public.banner_position THEN 54
                END,
                CASE placement_val
                    WHEN 'top'::public.banner_position THEN 3.00
                    WHEN 'mid'::public.banner_position THEN 3.00
                    WHEN 'bottom'::public.banner_position THEN 3.00
                END
            ON CONFLICT DO NOTHING;
        END LOOP;

        -- Generate revenue summaries by category
        FOR category_val IN SELECT unnest(ARRAY['food'::public.discount_category, 'retail'::public.discount_category, 'services'::public.discount_category, 'entertainment'::public.discount_category])
        LOOP
            INSERT INTO public.ad_revenue_summary (
                association_id,
                period_start,
                period_end,
                placement,
                category,
                total_revenue,
                total_ads,
                total_views,
                total_clicks,
                avg_ctr
            )
            VALUES (
                association_uuid,
                CURRENT_DATE - 30,
                CURRENT_DATE,
                NULL,
                category_val,
                800.00 + (random() * 400)::DECIMAL(10,2),
                2 + floor(random() * 3)::INTEGER,
                1500 + floor(random() * 1000)::INTEGER,
                45 + floor(random() * 30)::INTEGER,
                2.50 + (random() * 1.5)::DECIMAL(5,2)
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
END $$;