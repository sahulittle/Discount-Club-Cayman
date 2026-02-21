-- Add UPDATE and SELECT policies for banner_settings table to allow admin users to modify and view banner pricing and configuration
-- This fixes the issue where banner settings changes were not being saved and displayed

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admin_update_banner_settings" ON public.banner_settings;
DROP POLICY IF EXISTS "admin_select_banner_settings" ON public.banner_settings;

-- Create SELECT policy for admin users (needed for .select() after update)
CREATE POLICY "admin_select_banner_settings"
ON public.banner_settings
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'::public.user_role
    )
);

-- Create UPDATE policy for admin users
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