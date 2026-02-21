-- Comprehensive Association Dashboard Mock Data
-- 15-20 member companies with full analytics, employees, savings, and renewal tracking

DO $$
DECLARE
    association_uuid UUID;
    company_uuids UUID[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
    i INTEGER;
    employee_count INTEGER;
    wholesale DECIMAL := 89.99;
    resale DECIMAL := 119.99;
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
        'Stephanie Sanchez', 'Ronald Morris', 'Rebecca Rogers', 'Timothy Reed', 'Laura Cook'
    ];
    company_name TEXT;
    contact_name TEXT;
    contact_email TEXT;
    contact_phone TEXT;
    companies_info CONSTANT JSONB := '[
        {"name": "Island Financial Services", "contact": "Marcus Thompson", "email": "marcus@islandfinancial.ky", "phone": "+1-345-555-0201", "employees": 42},
        {"name": "Caribbean Legal Group", "contact": "Diana Foster", "email": "diana@caribbeanlegal.ky", "phone": "+1-345-555-0202", "employees": 28},
        {"name": "Cayman Tech Solutions", "contact": "Robert Chen", "email": "robert@caymantech.ky", "phone": "+1-345-555-0203", "employees": 35},
        {"name": "Ocean View Realty", "contact": "Patricia Williams", "email": "patricia@oceanviewrealty.ky", "phone": "+1-345-555-0204", "employees": 18},
        {"name": "Summit Consulting Partners", "contact": "Andrew Mitchell", "email": "andrew@summitconsulting.ky", "phone": "+1-345-555-0205", "employees": 50},
        {"name": "Tropical Insurance Co", "contact": "Laura Bennett", "email": "laura@tropicalinsurance.ky", "phone": "+1-345-555-0206", "employees": 31},
        {"name": "Harbor Engineering Ltd", "contact": "Steven Rodriguez", "email": "steven@harboreng.ky", "phone": "+1-345-555-0207", "employees": 22},
        {"name": "Premier Healthcare Group", "contact": "Michelle Carter", "email": "michelle@premierhealthcare.ky", "phone": "+1-345-555-0208", "employees": 45},
        {"name": "Coastal Marketing Agency", "contact": "Brian Patterson", "email": "brian@coastalmarketing.ky", "phone": "+1-345-555-0209", "employees": 15},
        {"name": "Island Logistics Corp", "contact": "Angela Martinez", "email": "angela@islandlogistics.ky", "phone": "+1-345-555-0210", "employees": 38},
        {"name": "Sunset Hospitality Management", "contact": "Kevin Brooks", "email": "kevin@sunsethospitality.ky", "phone": "+1-345-555-0211", "employees": 27},
        {"name": "Atlantic Construction Group", "contact": "Rebecca Turner", "email": "rebecca@atlanticconstruction.ky", "phone": "+1-345-555-0212", "employees": 33},
        {"name": "Bay Area Accounting Services", "contact": "Timothy Hughes", "email": "timothy@bayareaaccounting.ky", "phone": "+1-345-555-0213", "employees": 12},
        {"name": "Paradise IT Solutions", "contact": "Amanda Foster", "email": "amanda@paradiseit.ky", "phone": "+1-345-555-0214", "employees": 25},
        {"name": "Grand Cayman Architects", "contact": "Christopher Evans", "email": "christopher@gcarchitects.ky", "phone": "+1-345-555-0215", "employees": 19},
        {"name": "Tradewinds Import Export", "contact": "Stephanie Collins", "email": "stephanie@tradewinds.ky", "phone": "+1-345-555-0216", "employees": 29},
        {"name": "Reef Security Systems", "contact": "George Anderson", "email": "george@reefsecurity.ky", "phone": "+1-345-555-0217", "employees": 8},
        {"name": "Horizon Business Services", "contact": "Melissa Wright", "email": "melissa@horizonbusiness.ky", "phone": "+1-345-555-0218", "employees": 41}
    ]'::JSONB;
BEGIN
    -- Get association user ID
    SELECT id INTO association_uuid
    FROM public.user_profiles
    WHERE role = 'association'::public.user_role
    LIMIT 1;

    IF association_uuid IS NOT NULL THEN
        -- Insert 18 member companies with varied data
        FOR i IN 1..18 LOOP
            -- Extract company data directly from JSONB (use -> for index, then ->> for field)
            company_name := companies_info->(i-1)->>'name';
            contact_name := companies_info->(i-1)->>'contact';
            contact_email := companies_info->(i-1)->>'email';
            contact_phone := companies_info->(i-1)->>'phone';
            employee_count := (companies_info->(i-1)->>'employees')::INTEGER;
            
            -- Calculate financials
            company_revenue := employee_count * resale;
            company_cost := employee_count * wholesale;
            company_profit := company_revenue - company_cost;
            
            -- Generate varied savings (return multiples between 2× and 6×)
            total_savings := company_cost * (2.0 + (random() * 4.0));
            return_mult := ROUND((total_savings / company_cost)::NUMERIC, 1);
            
            -- Determine renewal date and status (spread across next 90 days)
            renewal_offset := FLOOR(random() * 90 + 1)::INTEGER;
            IF renewal_offset <= 20 THEN
                company_status := 'expiring_soon';
            ELSIF renewal_offset <= 85 THEN
                company_status := 'active';
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
            ON CONFLICT (id) DO NOTHING;
            
            -- Insert employees for this company (5-10 employees per company for sample)
            FOR j IN 1..LEAST(10, employee_count) LOOP
                INSERT INTO public.company_employees (
                    company_id,
                    employee_name,
                    email,
                    phone,
                    membership_status,
                    expiry_date
                ) VALUES (
                    company_uuids[i],
                    employee_names[((i-1)*10 + j) % 50 + 1],
                    LOWER(REPLACE(employee_names[((i-1)*10 + j) % 50 + 1], ' ', '.')) || '@' || LOWER(REPLACE(company_name, ' ', '')) || '.ky',
                    '+1-345-555-' || LPAD((1000 + i*10 + j)::TEXT, 4, '0'),
                    CASE WHEN renewal_offset <= 20 THEN 'expiring_soon' ELSE 'active' END,
                    CURRENT_DATE + (renewal_offset || ' days')::INTERVAL
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
            
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
                ROUND((total_savings * (0.35 + random() * 0.15))::NUMERIC, 2),
                ROUND((total_savings * (0.30 + random() * 0.15))::NUMERIC, 2),
                ROUND((total_savings * (0.15 + random() * 0.15))::NUMERIC, 2),
                return_mult
            )
            ON CONFLICT DO NOTHING;
            
            -- Insert savings by category (8 categories with varied amounts)
            INSERT INTO public.savings_by_category (company_id, category, total_savings, redemption_count, avg_savings_per_redemption)
            VALUES
            (company_uuids[i], 'Restaurants', ROUND((total_savings * 0.18 * (0.8 + random() * 0.4))::NUMERIC, 2), FLOOR(employee_count * 1.2 * (0.8 + random() * 0.4))::INTEGER, ROUND((50 + random() * 50)::NUMERIC, 2)),
            (company_uuids[i], 'Retail', ROUND((total_savings * 0.15 * (0.8 + random() * 0.4))::NUMERIC, 2), FLOOR(employee_count * 0.9 * (0.8 + random() * 0.4))::INTEGER, ROUND((60 + random() * 60)::NUMERIC, 2)),
            (company_uuids[i], 'Health & Wellness', ROUND((total_savings * 0.12 * (0.8 + random() * 0.4))::NUMERIC, 2), FLOOR(employee_count * 0.7 * (0.8 + random() * 0.4))::INTEGER, ROUND((70 + random() * 50)::NUMERIC, 2)),
            (company_uuids[i], 'Services', ROUND((total_savings * 0.10 * (0.8 + random() * 0.4))::NUMERIC, 2), FLOOR(employee_count * 0.6 * (0.8 + random() * 0.4))::INTEGER, ROUND((40 + random() * 40)::NUMERIC, 2)),
            (company_uuids[i], 'Automotive', ROUND((total_savings * 0.08 * (0.8 + random() * 0.4))::NUMERIC, 2), FLOOR(employee_count * 0.4 * (0.8 + random() * 0.4))::INTEGER, ROUND((80 + random() * 70)::NUMERIC, 2)),
            (company_uuids[i], 'Entertainment', ROUND((total_savings * 0.09 * (0.8 + random() * 0.4))::NUMERIC, 2), FLOOR(employee_count * 0.8 * (0.8 + random() * 0.4))::INTEGER, ROUND((30 + random() * 30)::NUMERIC, 2)),
            (company_uuids[i], 'Home & Living', ROUND((total_savings * 0.07 * (0.8 + random() * 0.4))::NUMERIC, 2), FLOOR(employee_count * 0.5 * (0.8 + random() * 0.4))::INTEGER, ROUND((90 + random() * 60)::NUMERIC, 2)),
            (company_uuids[i], 'Other', ROUND((total_savings * 0.06 * (0.8 + random() * 0.4))::NUMERIC, 2), FLOOR(employee_count * 0.3 * (0.8 + random() * 0.4))::INTEGER, ROUND((45 + random() * 35)::NUMERIC, 2))
            ON CONFLICT DO NOTHING;
            
            -- Insert certificate redemptions by category
            INSERT INTO public.certificate_redemptions (company_id, category, redeemed_value, redemption_count, avg_value_per_redemption)
            VALUES
            (company_uuids[i], 'Dining', ROUND((total_savings * 0.10 * (0.8 + random() * 0.4))::NUMERIC, 2), FLOOR(employee_count * 0.4 * (0.8 + random() * 0.4))::INTEGER, ROUND((100 + random() * 100)::NUMERIC, 2)),
            (company_uuids[i], 'Spa & Wellness', ROUND((total_savings * 0.08 * (0.8 + random() * 0.4))::NUMERIC, 2), FLOOR(employee_count * 0.3 * (0.8 + random() * 0.4))::INTEGER, ROUND((120 + random() * 80)::NUMERIC, 2)),
            (company_uuids[i], 'Entertainment', ROUND((total_savings * 0.06 * (0.8 + random() * 0.4))::NUMERIC, 2), FLOOR(employee_count * 0.35 * (0.8 + random() * 0.4))::INTEGER, ROUND((80 + random() * 70)::NUMERIC, 2)),
            (company_uuids[i], 'Activities', ROUND((total_savings * 0.05 * (0.8 + random() * 0.4))::NUMERIC, 2), FLOOR(employee_count * 0.25 * (0.8 + random() * 0.4))::INTEGER, ROUND((90 + random() * 60)::NUMERIC, 2))
            ON CONFLICT DO NOTHING;
            
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
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        RAISE NOTICE 'Successfully inserted 18 member companies with comprehensive analytics data';
    ELSE
        RAISE NOTICE 'No association user found. Skipping mock data insertion.';
    END IF;
END $$;