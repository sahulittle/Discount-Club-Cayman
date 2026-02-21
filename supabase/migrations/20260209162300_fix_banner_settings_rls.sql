-- Fix banner_settings RLS policies to allow public read access for pricing configuration
-- while keeping UPDATE restricted to admin users only

-- Drop existing policies
DROP POLICY IF EXISTS "admin_select_banner_settings" ON public.banner_settings;
DROP POLICY IF EXISTS "admin_update_banner_settings" ON public.banner_settings;

-- Create public SELECT policy (pricing is public information)
CREATE POLICY "public_select_banner_settings"
ON public.banner_settings
FOR SELECT
TO public
USING (true);

-- Create UPDATE policy for admin users only
CREATE POLICY "admin_update_banner_settings"
ON public.banner_settings
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'::public.user_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'::public.user_role
    )
);