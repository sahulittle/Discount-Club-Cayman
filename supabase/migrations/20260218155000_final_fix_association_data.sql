-- Comprehensive fix for Association Dashboard data visibility
-- This migration ensures simulated company data is visible to the logged-in association user

DO $$
DECLARE
    association_users UUID[];
    target_association UUID;
    company_count INTEGER;
    simulated_company_names TEXT[] := ARRAY[
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
    ];
BEGIN
    -- Get all association users
    SELECT ARRAY_AGG(id) INTO association_users
    FROM public.user_profiles
    WHERE role = 'association'::public.user_role;

    IF association_users IS NOT NULL AND array_length(association_users, 1) > 0 THEN
        -- Use the first association user as the target
        target_association := association_users[1];
        
        RAISE NOTICE 'Found % association user(s). Using: %', array_length(association_users, 1), target_association;

        -- Check if simulated companies exist
        SELECT COUNT(*) INTO company_count
        FROM public.member_companies
        WHERE company_name = ANY(simulated_company_names);

        IF company_count > 0 THEN
            -- Update all simulated companies to belong to the target association
            UPDATE public.member_companies
            SET association_id = target_association
            WHERE company_name = ANY(simulated_company_names);

            RAISE NOTICE 'Updated % simulated companies to association_id: %', company_count, target_association;

            -- Update related analytics tables
            UPDATE public.company_analytics
            SET association_id = target_association
            WHERE company_id IN (
                SELECT id FROM public.member_companies 
                WHERE company_name = ANY(simulated_company_names)
            );

            UPDATE public.association_revenue_summary
            SET association_id = target_association
            WHERE company_id IN (
                SELECT id FROM public.member_companies 
                WHERE company_name = ANY(simulated_company_names)
            );

            UPDATE public.renewal_reminders
            SET association_id = target_association
            WHERE company_id IN (
                SELECT id FROM public.member_companies 
                WHERE company_name = ANY(simulated_company_names)
            );

            RAISE NOTICE 'Updated related analytics tables for association: %', target_association;
        ELSE
            RAISE NOTICE 'No simulated companies found to update';
        END IF;
    ELSE
        RAISE WARNING 'No association users found in user_profiles table. Please ensure at least one user has role = association';
    END IF;
END $$;