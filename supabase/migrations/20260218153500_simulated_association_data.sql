-- Simulated Association Dashboard Data - 10 Fictional Cayman Companies
-- Pricing: Wholesale $84.99, Resale $89.99, Profit $5.00 per employee
-- Total ~200 employees across all companies
-- Return multiples: 4×-7× (average 5×-6×)

-- Add unique constraints to support ON CONFLICT clauses
ALTER TABLE public.company_analytics DROP CONSTRAINT IF EXISTS company_analytics_company_id_key;
ALTER TABLE public.company_analytics ADD CONSTRAINT company_analytics_company_id_key UNIQUE (company_id);

ALTER TABLE public.savings_by_category DROP CONSTRAINT IF EXISTS savings_by_category_company_id_category_key;
ALTER TABLE public.savings_by_category ADD CONSTRAINT savings_by_category_company_id_category_key UNIQUE (company_id, category);

ALTER TABLE public.certificate_redemptions DROP CONSTRAINT IF EXISTS certificate_redemptions_company_id_category_key;
ALTER TABLE public.certificate_redemptions ADD CONSTRAINT certificate_redemptions_company_id_category_key UNIQUE (company_id, category);

ALTER TABLE public.association_revenue_summary DROP CONSTRAINT IF EXISTS association_revenue_summary_unique_period;
ALTER TABLE public.association_revenue_summary ADD CONSTRAINT association_revenue_summary_unique_period UNIQUE (association_id, company_id, period_start, period_end);

DO $$
DECLARE
    association_uuid UUID;
    company_uuids UUID[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
    i INTEGER;
    employee_count INTEGER;
    wholesale CONSTANT DECIMAL := 84.99;
    resale CONSTANT DECIMAL := 89.99;
    profit_per_employee CONSTANT DECIMAL := 5.00;
    company_revenue DECIMAL;
    company_cost DECIMAL;
    company_profit DECIMAL;
    total_savings DECIMAL;
    return_mult DECIMAL;
    renewal_offset INTEGER;
    company_status TEXT;
    j INTEGER;
    employee_names TEXT[] := ARRAY[
        'James Anderson', 'Maria Garcia', 'Robert Taylor', 'Jennifer Martinez', 'Michael Brown',
        'Linda Wilson', 'David Moore', 'Barbara Jackson', 'William Thomas', 'Elizabeth White',
        'Richard Harris', 'Susan Martin', 'Joseph Thompson', 'Jessica Garcia', 'Thomas Robinson',
        'Sarah Clark', 'Charles Rodriguez', 'Karen Lewis', 'Christopher Lee', 'Nancy Walker',
        'Daniel Hall', 'Lisa Allen', 'Matthew Young', 'Betty Hernandez', 'Mark King',
        'Sandra Wright', 'Donald Lopez', 'Ashley Hill', 'Steven Scott', 'Kimberly Green',
        'Paul Adams', 'Donna Baker', 'Andrew Nelson', 'Carol Carter', 'Joshua Mitchell',
        'Michelle Perez', 'Kenneth Roberts', 'Emily Turner', 'Kevin Phillips', 'Amanda Campbell',
        'Brian Parker', 'Melissa Evans', 'George Edwards', 'Deborah Collins', 'Edward Stewart',
        'Stephanie Sanchez', 'Ronald Morris', 'Rebecca Rogers', 'Timothy Reed', 'Laura Cook',
        'Jason Hill', 'Nicole Scott', 'Ryan Green', 'Heather Adams', 'Justin Baker',
        'Samantha Nelson', 'Brandon Carter', 'Rachel Mitchell', 'Aaron Perez', 'Christina Roberts',
        'Jeremy Turner', 'Amber Phillips', 'Eric Campbell', 'Megan Parker', 'Adam Evans',
        'Lauren Edwards', 'Nathan Collins', 'Brittany Stewart', 'Kyle Sanchez', 'Danielle Morris',
        'Sean Rogers', 'Courtney Reed', 'Patrick Cook', 'Vanessa Hill', 'Gregory Scott',
        'Allison Green', 'Benjamin Adams', 'Kathryn Baker', 'Samuel Nelson', 'Victoria Carter',
        'Jonathan Mitchell', 'Christina Perez', 'Nicholas Roberts', 'Alexis Turner', 'Tyler Phillips',
        'Hannah Campbell', 'Zachary Parker', 'Madison Evans', 'Jordan Edwards', 'Taylor Collins',
        'Austin Stewart', 'Kayla Sanchez', 'Dylan Morris', 'Jasmine Rogers', 'Cody Reed'
    ];
    company_name TEXT;
    contact_name TEXT;
    contact_email TEXT;
    contact_phone TEXT;
    employee_counts INTEGER[] := ARRAY[25, 18, 22, 15, 30, 19, 12, 27, 20, 16]; -- Total: 204 employees
    return_multiples DECIMAL[] := ARRAY[5.2, 4.5, 6.1, 4.8, 5.7, 6.5, 4.2, 5.9, 5.4, 6.8]; -- Average: 5.51×
    companies_info CONSTANT JSONB := '[
        {"name": "Cayman Financial Partners Ltd", "contact": "Marcus Thompson", "email": "marcus.thompson@caymanfinancial.ky", "phone": "+1-345-949-2101"},
        {"name": "Island Legal Associates", "contact": "Diana Foster", "email": "diana.foster@islandlegal.ky", "phone": "+1-345-949-2102"},
        {"name": "Caribbean Tech Solutions", "contact": "Robert Chen", "email": "robert.chen@caribbeantech.ky", "phone": "+1-345-949-2103"},
        {"name": "Seven Mile Realty Group", "contact": "Patricia Williams", "email": "patricia.williams@sevenmilerealty.ky", "phone": "+1-345-949-2104"},
        {"name": "Grand Harbour Consulting", "contact": "Andrew Mitchell", "email": "andrew.mitchell@grandharbour.ky", "phone": "+1-345-949-2105"},
        {"name": "Tropic Insurance Services", "contact": "Laura Bennett", "email": "laura.bennett@tropicinsurance.ky", "phone": "+1-345-949-2106"},
        {"name": "Camana Bay Architects", "contact": "Steven Rodriguez", "email": "steven.rodriguez@camanabay.ky", "phone": "+1-345-949-2107"},
        {"name": "Cayman Healthcare Group", "contact": "Michelle Carter", "email": "michelle.carter@caymanhealthcare.ky", "phone": "+1-345-949-2108"},
        {"name": "Sunset Marketing Agency", "contact": "Brian Patterson", "email": "brian.patterson@sunsetmarketing.ky", "phone": "+1-345-949-2109"},
        {"name": "Island Logistics International", "contact": "Angela Martinez", "email": "angela.martinez@islandlogistics.ky", "phone": "+1-345-949-2110"}
    ]'::JSONB;
BEGIN
    -- Get association user ID
    SELECT id INTO association_uuid
    FROM public.user_profiles
    WHERE role = 'association'::public.user_role
    LIMIT 1;

    IF association_uuid IS NOT NULL THEN
        -- Delete existing mock data for clean slate
        DELETE FROM public.certificate_redemptions WHERE company_id IN (SELECT id FROM public.member_companies WHERE association_id = association_uuid);
        DELETE FROM public.savings_by_category WHERE company_id IN (SELECT id FROM public.member_companies WHERE association_id = association_uuid);
        DELETE FROM public.company_analytics WHERE association_id = association_uuid;
        DELETE FROM public.association_revenue_summary WHERE association_id = association_uuid;
        DELETE FROM public.company_employees WHERE company_id IN (SELECT id FROM public.member_companies WHERE association_id = association_uuid);
        DELETE FROM public.member_companies WHERE association_id = association_uuid;
        
        -- Insert 10 member companies with realistic Cayman-style data
        FOR i IN 1..10 LOOP
            -- Extract company data from JSONB
            company_name := companies_info->(i-1)->>'name';
            contact_name := companies_info->(i-1)->>'contact';
            contact_email := companies_info->(i-1)->>'email';
            contact_phone := companies_info->(i-1)->>'phone';
            employee_count := employee_counts[i];
            
            -- Calculate financials with correct pricing model
            company_cost := employee_count * wholesale;  -- What association pays DCC
            company_revenue := employee_count * resale;  -- What association charges companies
            company_profit := employee_count * profit_per_employee;  -- $5 per employee
            
            -- Calculate savings based on target return multiple (4×-7×, average 5×-6×)
            return_mult := return_multiples[i];
            total_savings := ROUND((company_cost * return_mult)::NUMERIC, 2);
            
            -- Determine renewal date and status (spread across next 12 months)
            renewal_offset := FLOOR(random() * 365 + 1)::INTEGER;
            IF renewal_offset <= 30 THEN
                company_status := 'expiring_soon';
            ELSE
                company_status := 'active';
            END IF;
            
            -- Insert company
            INSERT INTO public.member_companies (
                id, association_id, company_name, contact_name, contact_email, contact_phone,
                qty_employees, status, renewal_date, wholesale_price, resale_price,
                revenue, cost, profit, total_members, total_savings, is_active
            ) VALUES (
                company_uuids[i],
                association_uuid,
                company_name,
                contact_name,
                contact_email,
                contact_phone,
                employee_count,
                company_status,
                CURRENT_DATE + (renewal_offset || ' days')::INTERVAL,
                wholesale,
                resale,
                company_revenue,
                company_cost,
                company_profit,
                employee_count,
                total_savings,
                true
            )
            ON CONFLICT (id) DO UPDATE SET
                company_name = EXCLUDED.company_name,
                contact_name = EXCLUDED.contact_name,
                contact_email = EXCLUDED.contact_email,
                contact_phone = EXCLUDED.contact_phone,
                qty_employees = EXCLUDED.qty_employees,
                status = EXCLUDED.status,
                renewal_date = EXCLUDED.renewal_date,
                wholesale_price = EXCLUDED.wholesale_price,
                resale_price = EXCLUDED.resale_price,
                revenue = EXCLUDED.revenue,
                cost = EXCLUDED.cost,
                profit = EXCLUDED.profit,
                total_savings = EXCLUDED.total_savings;
            
            -- Insert employees for this company (all employees with realistic data)
            FOR j IN 1..employee_count LOOP
                INSERT INTO public.company_employees (
                    company_id,
                    employee_name,
                    email,
                    phone,
                    membership_status,
                    expiry_date
                ) VALUES (
                    company_uuids[i],
                    employee_names[((i-1)*20 + j) % 90 + 1],
                    LOWER(REPLACE(employee_names[((i-1)*20 + j) % 90 + 1], ' ', '.')) || '@' || LOWER(REPLACE(SPLIT_PART(company_name, ' ', 1), ' ', '')) || '.ky',
                    '+1-345-' || LPAD((300 + i*100 + j)::TEXT, 7, '0'),
                    CASE WHEN renewal_offset <= 30 THEN 'expiring_soon' ELSE 'active' END,
                    CURRENT_DATE + (renewal_offset || ' days')::INTERVAL
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
            
            -- Calculate channel breakdown (Travel 35-50%, Discounts 30-45%, Certificates 15-30%)
            DECLARE
                travel_pct DECIMAL := 0.35 + (random() * 0.15);  -- 35-50%
                discount_pct DECIMAL := 0.30 + (random() * 0.15);  -- 30-45%
                certificate_pct DECIMAL := 1.0 - travel_pct - discount_pct;  -- Remainder (15-30%)
                travel_savings DECIMAL := ROUND((total_savings * travel_pct)::NUMERIC, 2);
                discount_savings DECIMAL := ROUND((total_savings * discount_pct)::NUMERIC, 2);
                certificate_savings DECIMAL := ROUND((total_savings * certificate_pct)::NUMERIC, 2);
            BEGIN
                -- Insert company analytics
                INSERT INTO public.company_analytics (
                    company_id,
                    association_id,
                    total_cost,
                    total_savings,
                    travel_savings,
                    discount_savings,
                    certificate_savings,
                    return_multiple
                ) VALUES (
                    company_uuids[i],
                    association_uuid,
                    company_cost,
                    total_savings,
                    travel_savings,
                    discount_savings,
                    certificate_savings,
                    return_mult
                )
                ON CONFLICT (company_id) DO UPDATE SET
                    total_cost = EXCLUDED.total_cost,
                    total_savings = EXCLUDED.total_savings,
                    travel_savings = EXCLUDED.travel_savings,
                    discount_savings = EXCLUDED.discount_savings,
                    certificate_savings = EXCLUDED.certificate_savings,
                    return_multiple = EXCLUDED.return_multiple;
            END;
            
            -- Insert discount savings by category with realistic breakdown
            INSERT INTO public.savings_by_category (company_id, category, total_savings, redemption_count, avg_savings_per_redemption)
            VALUES
            (company_uuids[i], 'Restaurants', ROUND((total_savings * 0.12)::NUMERIC, 2), FLOOR(employee_count * 2.5)::INTEGER, ROUND((45 + random() * 35)::NUMERIC, 2)),
            (company_uuids[i], 'Retail', ROUND((total_savings * 0.10)::NUMERIC, 2), FLOOR(employee_count * 1.8)::INTEGER, ROUND((55 + random() * 40)::NUMERIC, 2)),
            (company_uuids[i], 'Automotive', ROUND((total_savings * 0.09)::NUMERIC, 2), FLOOR(employee_count * 0.8)::INTEGER, ROUND((120 + random() * 80)::NUMERIC, 2)),
            (company_uuids[i], 'Services', ROUND((total_savings * 0.08)::NUMERIC, 2), FLOOR(employee_count * 1.2)::INTEGER, ROUND((65 + random() * 45)::NUMERIC, 2)),
            (company_uuids[i], 'Health & Wellness', ROUND((total_savings * 0.11)::NUMERIC, 2), FLOOR(employee_count * 1.5)::INTEGER, ROUND((75 + random() * 50)::NUMERIC, 2)),
            (company_uuids[i], 'Entertainment', ROUND((total_savings * 0.07)::NUMERIC, 2), FLOOR(employee_count * 1.9)::INTEGER, ROUND((35 + random() * 30)::NUMERIC, 2))
            ON CONFLICT (company_id, category) DO UPDATE SET
                total_savings = EXCLUDED.total_savings,
                redemption_count = EXCLUDED.redemption_count,
                avg_savings_per_redemption = EXCLUDED.avg_savings_per_redemption;
            
            -- Insert certificate redemptions by category
            INSERT INTO public.certificate_redemptions (company_id, category, redeemed_value, redemption_count, avg_value_per_redemption)
            VALUES
            (company_uuids[i], 'Dining', ROUND((total_savings * 0.08)::NUMERIC, 2), FLOOR(employee_count * 0.6)::INTEGER, ROUND((110 + random() * 90)::NUMERIC, 2)),
            (company_uuids[i], 'Spa & Wellness', ROUND((total_savings * 0.06)::NUMERIC, 2), FLOOR(employee_count * 0.4)::INTEGER, ROUND((140 + random() * 80)::NUMERIC, 2)),
            (company_uuids[i], 'Entertainment', ROUND((total_savings * 0.05)::NUMERIC, 2), FLOOR(employee_count * 0.5)::INTEGER, ROUND((90 + random() * 60)::NUMERIC, 2)),
            (company_uuids[i], 'Activities', ROUND((total_savings * 0.04)::NUMERIC, 2), FLOOR(employee_count * 0.3)::INTEGER, ROUND((125 + random() * 75)::NUMERIC, 2))
            ON CONFLICT (company_id, category) DO UPDATE SET
                redeemed_value = EXCLUDED.redeemed_value,
                redemption_count = EXCLUDED.redemption_count,
                avg_value_per_redemption = EXCLUDED.avg_value_per_redemption;
            
            -- Insert revenue summary
            INSERT INTO public.association_revenue_summary (
                association_id,
                company_id,
                period_start,
                period_end,
                qty_employees,
                revenue,
                cost,
                profit,
                profit_margin
            ) VALUES (
                association_uuid,
                company_uuids[i],
                CURRENT_DATE - INTERVAL '30 days',
                CURRENT_DATE,
                employee_count,
                company_revenue,
                company_cost,
                company_profit,
                ROUND(((company_profit / company_revenue) * 100)::NUMERIC, 2)
            )
            ON CONFLICT (association_id, company_id, period_start, period_end) DO UPDATE SET
                qty_employees = EXCLUDED.qty_employees,
                revenue = EXCLUDED.revenue,
                cost = EXCLUDED.cost,
                profit = EXCLUDED.profit,
                profit_margin = EXCLUDED.profit_margin;
        END LOOP;
        
        RAISE NOTICE 'Successfully inserted 10 fictional Cayman companies with ~200 total employees';
        RAISE NOTICE 'Pricing: Wholesale $84.99, Resale $89.99, Profit $5.00 per employee';
        RAISE NOTICE 'Return multiples: 4.2× to 6.8× (average 5.51×)';
        RAISE NOTICE 'Total savings demonstrate strong 4×-7× return on investment';
    ELSE
        RAISE NOTICE 'No association user found. Skipping simulated data insertion.';
    END IF;
END $$;