-- Fix RLS for member_companies table
-- The table was missing RLS policies, causing data to be invisible to association users

-- Enable RLS on member_companies
ALTER TABLE public.member_companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "associations_view_own_member_companies" ON public.member_companies;
DROP POLICY IF EXISTS "associations_manage_own_member_companies" ON public.member_companies;

-- Create SELECT policy for associations to view their own companies
CREATE POLICY "associations_view_own_member_companies"
ON public.member_companies
FOR SELECT
TO authenticated
USING (association_id = auth.uid());

-- Create ALL policy for associations to manage their own companies
CREATE POLICY "associations_manage_own_member_companies"
ON public.member_companies
FOR ALL
TO authenticated
USING (association_id = auth.uid())
WITH CHECK (association_id = auth.uid());

-- Also add admin access policy
DROP POLICY IF EXISTS "admins_view_all_member_companies" ON public.member_companies;
CREATE POLICY "admins_view_all_member_companies"
ON public.member_companies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'::public.user_role
  )
);