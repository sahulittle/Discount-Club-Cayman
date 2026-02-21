-- Fix: Associate simulated company data with ALL association users
-- This ensures the dashboard displays data for any logged-in association user

DO $$
DECLARE
    association_uuid UUID;
    company_record RECORD;
BEGIN
    -- Get all association users
    FOR association_uuid IN 
        SELECT id FROM public.user_profiles WHERE role = 'association'::public.user_role
    LOOP
        -- Check if this association already has companies
        IF NOT EXISTS (SELECT 1 FROM public.member_companies WHERE association_id = association_uuid) THEN
            -- Copy the simulated companies for this association
            FOR company_record IN 
                SELECT * FROM public.member_companies WHERE association_id IN (
                    SELECT id FROM public.user_profiles WHERE role = 'association'::public.user_role LIMIT 1
                )
            LOOP
                -- Insert company for this association
                INSERT INTO public.member_companies (
                    association_id, company_name, contact_name, contact_email, contact_phone,
                    qty_employees, status, renewal_date, wholesale_price, resale_price,
                    revenue, cost, profit, total_members, total_savings, is_active
                ) VALUES (
                    association_uuid,
                    company_record.company_name,
                    company_record.contact_name,
                    company_record.contact_email,
                    company_record.contact_phone,
                    company_record.qty_employees,
                    company_record.status,
                    company_record.renewal_date,
                    company_record.wholesale_price,
                    company_record.resale_price,
                    company_record.revenue,
                    company_record.cost,
                    company_record.profit,
                    company_record.total_members,
                    company_record.total_savings,
                    company_record.is_active
                );
            END LOOP;
        END IF;
    END LOOP;
END $$;