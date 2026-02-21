-- Diagnostic and Fix Migration for Association Dashboard Data Visibility
-- This migration will identify the issue and fix the association_id assignments

DO $$
DECLARE
    association_user_id UUID;
    association_user_email TEXT;
    company_count INTEGER;
    company_association_ids UUID[];
    distinct_association_count INTEGER;
BEGIN
    -- Step 1: Find the association user
    SELECT id, email INTO association_user_id, association_user_email
    FROM auth.users
    WHERE id IN (
        SELECT id FROM public.user_profiles WHERE role = 'association'::public.user_role
    )
    LIMIT 1;

    RAISE NOTICE '=== DIAGNOSTIC REPORT ===';
    RAISE NOTICE 'Association User ID: %', COALESCE(association_user_id::text, 'NOT FOUND');
    RAISE NOTICE 'Association User Email: %', COALESCE(association_user_email, 'NOT FOUND');

    -- Step 2: Check simulated companies
    SELECT COUNT(*) INTO company_count
    FROM public.member_companies
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

    RAISE NOTICE 'Simulated Companies Found: %', company_count;

    -- Step 3: Check what association_ids the companies currently have
    SELECT ARRAY_AGG(DISTINCT association_id) INTO company_association_ids
    FROM public.member_companies
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

    RAISE NOTICE 'Current Association IDs on Companies: %', company_association_ids;

    -- Step 4: Check if there's a mismatch
    IF association_user_id IS NOT NULL AND company_count > 0 THEN
        SELECT COUNT(DISTINCT association_id) INTO distinct_association_count
        FROM public.member_companies
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
        )
        AND association_id != association_user_id;

        IF distinct_association_count > 0 THEN
            RAISE NOTICE '=== MISMATCH DETECTED ===';
            RAISE NOTICE 'Companies have wrong association_id. Fixing now...';

            -- Fix member_companies
            UPDATE public.member_companies
            SET association_id = association_user_id
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

            -- Fix company_analytics
            UPDATE public.company_analytics
            SET association_id = association_user_id
            WHERE company_id IN (
                SELECT id FROM public.member_companies
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
                )
            );

            -- Fix association_revenue_summary
            UPDATE public.association_revenue_summary
            SET association_id = association_user_id
            WHERE company_id IN (
                SELECT id FROM public.member_companies
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
                )
            );

            -- Fix renewal_reminders if any exist
            UPDATE public.renewal_reminders
            SET association_id = association_user_id
            WHERE company_id IN (
                SELECT id FROM public.member_companies
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
                )
            );

            RAISE NOTICE '=== FIX APPLIED ===';
            RAISE NOTICE 'All simulated company data now assigned to: %', association_user_id;
        ELSE
            RAISE NOTICE '=== NO MISMATCH ===';
            RAISE NOTICE 'All companies already have correct association_id';
        END IF;
    ELSE
        IF association_user_id IS NULL THEN
            RAISE WARNING 'No association user found in database!';
        END IF;
        IF company_count = 0 THEN
            RAISE WARNING 'No simulated companies found in database!';
        END IF;
    END IF;

    RAISE NOTICE '=== END DIAGNOSTIC ===';
END $$;