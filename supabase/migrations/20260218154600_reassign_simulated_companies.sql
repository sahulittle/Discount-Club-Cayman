-- Fix: Update simulated company data to use the FIRST association user found
-- This ensures data is visible when an association user logs in

DO $$
DECLARE
    target_association_uuid UUID;
    source_association_uuid UUID;
    company_count INTEGER;
BEGIN
    -- Find the first association user (this should be the one logging in)
    SELECT id INTO target_association_uuid
    FROM public.user_profiles
    WHERE role = 'association'::public.user_role
    ORDER BY created_at ASC
    LIMIT 1;

    IF target_association_uuid IS NOT NULL THEN
        -- Check if companies exist for this association
        SELECT COUNT(*) INTO company_count
        FROM public.member_companies
        WHERE association_id = target_association_uuid;

        -- If no companies exist for this association, update all orphaned companies
        IF company_count = 0 THEN
            -- Find companies that might be associated with a different/null association_id
            UPDATE public.member_companies
            SET association_id = target_association_uuid
            WHERE company_name IN (
                'Cayman Financial Partners Ltd',
                'Island Legal Associates',
                'Caribbean Tech Solutions',
                'Seven Mile Realty Group',
                'Grand Harbour Consulting',
                'Tropic Insurance Services',
                'Camana Bay Architects',
                'Cayman Healthcare Group',
                'Sunset Marketing Agency',
                'Island Logistics International'
            );

            -- Update related analytics tables
            UPDATE public.company_analytics
            SET association_id = target_association_uuid
            WHERE company_id IN (
                SELECT id FROM public.member_companies WHERE association_id = target_association_uuid
            );

            UPDATE public.association_revenue_summary
            SET association_id = target_association_uuid
            WHERE company_id IN (
                SELECT id FROM public.member_companies WHERE association_id = target_association_uuid
            );

            UPDATE public.renewal_reminders
            SET association_id = target_association_uuid
            WHERE company_id IN (
                SELECT id FROM public.member_companies WHERE association_id = target_association_uuid
            );

            RAISE NOTICE 'Updated simulated companies to association_id: %', target_association_uuid;
        ELSE
            RAISE NOTICE 'Association % already has % companies', target_association_uuid, company_count;
        END IF;
    ELSE
        RAISE NOTICE 'No association user found in user_profiles';
    END IF;
END $$;