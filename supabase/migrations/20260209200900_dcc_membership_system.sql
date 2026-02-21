-- DCC Membership System Migration
-- Comprehensive membership management for Individual, Business, and Association memberships
-- Includes forms, approval workflows, status tracking, email templates, and member uploads

-- 1. Create ENUMs
DROP TYPE IF EXISTS public.membership_status CASCADE;
CREATE TYPE public.membership_status AS ENUM (
    'submitted',
    'payment_pending',
    'special_pricing_review',
    'approved_payment',
    'upload_requested',
    'upload_submitted',
    'under_review',
    'awaiting_organization_approval',
    'members_approved',
    'active',
    'rejected'
);

DROP TYPE IF EXISTS public.organization_type CASCADE;
CREATE TYPE public.organization_type AS ENUM ('business', 'association');

DROP TYPE IF EXISTS public.district_name CASCADE;
CREATE TYPE public.district_name AS ENUM (
    'george_town',
    'west_bay',
    'bodden_town',
    'north_side',
    'east_end',
    'cayman_brac',
    'little_cayman'
);

-- 2. Individual Membership Applications Table
CREATE TABLE IF NOT EXISTS public.individual_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_initial TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    district public.district_name NOT NULL,
    paypal_order_id TEXT UNIQUE,
    paypal_payer_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_amount DECIMAL(10, 2) DEFAULT 119.99,
    email_confirmed BOOLEAN DEFAULT false,
    email_confirmation_token TEXT,
    email_confirmation_sent_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    status public.membership_status DEFAULT 'submitted'::public.membership_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Business/Association Membership Applications Table
CREATE TABLE IF NOT EXISTS public.organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_name TEXT NOT NULL,
    organization_type public.organization_type NOT NULL,
    organization_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    estimated_members INTEGER NOT NULL,
    actual_members INTEGER,
    per_member_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    special_pricing BOOLEAN DEFAULT false,
    special_pricing_reason TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_instructions_sent BOOLEAN DEFAULT false,
    meeting_requested BOOLEAN DEFAULT false,
    meeting_notes TEXT,
    status public.membership_status DEFAULT 'submitted'::public.membership_status,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Member Upload Records Table
CREATE TABLE IF NOT EXISTS public.member_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_membership_id UUID REFERENCES public.organization_memberships(id) ON DELETE CASCADE,
    uploaded_by TEXT NOT NULL,
    file_name TEXT,
    upload_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    total_members INTEGER DEFAULT 0,
    approved_members INTEGER DEFAULT 0,
    rejected_members INTEGER DEFAULT 0,
    admin_reviewed BOOLEAN DEFAULT false,
    admin_reviewed_at TIMESTAMPTZ,
    admin_reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    organization_approved BOOLEAN DEFAULT false,
    organization_approved_at TIMESTAMPTZ,
    approval_token TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Individual Member Records (from uploads)
CREATE TABLE IF NOT EXISTS public.uploaded_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_upload_id UUID REFERENCES public.member_uploads(id) ON DELETE CASCADE,
    organization_membership_id UUID REFERENCES public.organization_memberships(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    middle_initial TEXT,
    district public.district_name,
    status TEXT DEFAULT 'pending',
    admin_approved BOOLEAN DEFAULT false,
    admin_approved_at TIMESTAMPTZ,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Email Templates Table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name TEXT NOT NULL UNIQUE,
    template_key TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    placeholders JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Email Log Table
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent',
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 8. Membership Pricing Configuration
CREATE TABLE IF NOT EXISTS public.membership_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_type TEXT NOT NULL UNIQUE,
    price_per_member DECIMAL(10, 2) NOT NULL,
    min_members INTEGER DEFAULT 1,
    max_members INTEGER,
    special_pricing_threshold INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Indexes
CREATE INDEX IF NOT EXISTS idx_individual_memberships_email ON public.individual_memberships(email);
CREATE INDEX IF NOT EXISTS idx_individual_memberships_status ON public.individual_memberships(status);
CREATE INDEX IF NOT EXISTS idx_individual_memberships_paypal_order ON public.individual_memberships(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_organization_memberships_email ON public.organization_memberships(email);
CREATE INDEX IF NOT EXISTS idx_organization_memberships_status ON public.organization_memberships(status);
CREATE INDEX IF NOT EXISTS idx_organization_memberships_type ON public.organization_memberships(organization_type);
CREATE INDEX IF NOT EXISTS idx_member_uploads_org_id ON public.member_uploads(organization_membership_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_members_upload_id ON public.uploaded_members(member_upload_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_members_org_id ON public.uploaded_members(organization_membership_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_members_email ON public.uploaded_members(email);
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON public.email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient_email);

-- 10. Enable RLS
ALTER TABLE public.individual_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_pricing ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies

-- Individual Memberships: Users can view their own, admin can manage all
DROP POLICY IF EXISTS "users_view_own_individual_memberships" ON public.individual_memberships;
CREATE POLICY "users_view_own_individual_memberships"
ON public.individual_memberships
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

DROP POLICY IF EXISTS "admin_manage_individual_memberships" ON public.individual_memberships;
CREATE POLICY "admin_manage_individual_memberships"
ON public.individual_memberships
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

-- Organization Memberships: Admin only
DROP POLICY IF EXISTS "admin_manage_organization_memberships" ON public.organization_memberships;
CREATE POLICY "admin_manage_organization_memberships"
ON public.organization_memberships
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

-- Member Uploads: Admin only
DROP POLICY IF EXISTS "admin_manage_member_uploads" ON public.member_uploads;
CREATE POLICY "admin_manage_member_uploads"
ON public.member_uploads
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

-- Uploaded Members: Admin only
DROP POLICY IF EXISTS "admin_manage_uploaded_members" ON public.uploaded_members;
CREATE POLICY "admin_manage_uploaded_members"
ON public.uploaded_members
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

-- Email Templates: Public read, admin manage
DROP POLICY IF EXISTS "public_read_email_templates" ON public.email_templates;
CREATE POLICY "public_read_email_templates"
ON public.email_templates
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_email_templates" ON public.email_templates;
CREATE POLICY "admin_manage_email_templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

-- Email Logs: Admin only
DROP POLICY IF EXISTS "admin_view_email_logs" ON public.email_logs;
CREATE POLICY "admin_view_email_logs"
ON public.email_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

-- Membership Pricing: Public read, admin manage
DROP POLICY IF EXISTS "public_read_membership_pricing" ON public.membership_pricing;
CREATE POLICY "public_read_membership_pricing"
ON public.membership_pricing
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_membership_pricing" ON public.membership_pricing;
CREATE POLICY "admin_manage_membership_pricing"
ON public.membership_pricing
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
);

-- 12. Triggers for updated_at
DROP TRIGGER IF EXISTS update_individual_memberships_updated_at ON public.individual_memberships;
CREATE TRIGGER update_individual_memberships_updated_at
    BEFORE UPDATE ON public.individual_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_organization_memberships_updated_at ON public.organization_memberships;
CREATE TRIGGER update_organization_memberships_updated_at
    BEFORE UPDATE ON public.organization_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_member_uploads_updated_at ON public.member_uploads;
CREATE TRIGGER update_member_uploads_updated_at
    BEFORE UPDATE ON public.member_uploads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_uploaded_members_updated_at ON public.uploaded_members;
CREATE TRIGGER update_uploaded_members_updated_at
    BEFORE UPDATE ON public.uploaded_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON public.email_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_membership_pricing_updated_at ON public.membership_pricing;
CREATE TRIGGER update_membership_pricing_updated_at
    BEFORE UPDATE ON public.membership_pricing
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Insert Default Email Templates
INSERT INTO public.email_templates (template_name, template_key, subject, body, placeholders, description)
VALUES
    (
        'Individual Sales Notification',
        'individual_sales_notification',
        'New Individual Membership Purchase',
        'A new individual membership has been purchased.\n\nDetails:\nName: [FirstName] [MiddleInitial] [LastName]\nEmail: [Email]\nPhone: [Phone]\nDistrict: [District]\nPayment Amount: $[PaymentAmount]\nPayPal Order ID: [PayPalOrderID]\nDate: [PurchaseDate]',
        '["FirstName", "MiddleInitial", "LastName", "Email", "Phone", "District", "PaymentAmount", "PayPalOrderID", "PurchaseDate"]'::jsonb,
        'Sent to IndSales@DiscountClubCayman.com when individual completes payment'
    ),
    (
        'Individual Email Confirmation',
        'individual_email_confirmation',
        'Confirm Your Email - Discount Club Cayman',
        'Dear [FirstName] [LastName],\n\nThank you for joining Discount Club Cayman!\n\nPlease confirm your email address by clicking the link below:\n[ConfirmationLink]\n\nImportant: This must be a valid and active email address. We periodically validate our members and use this email to provide important updates such as new business additions and special member-only deals.\n\nYour membership will be activated once your email is confirmed.\n\nBest regards,\nDiscount Club Cayman Team',
        '["FirstName", "LastName", "ConfirmationLink"]'::jsonb,
        'Sent to individual member after payment for email confirmation'
    ),
    (
        'Business/Association Submission Confirmation',
        'organization_submission_confirmation',
        'Membership Application Received - [OrganizationName]',
        'Dear [ContactName],\n\nThank you for your interest in Discount Club Cayman!\n\nWe have received your [OrganizationType] membership application for [OrganizationName].\n\nApplication Details:\nEstimated Members: [EstimatedMembers]\nContact Email: [Email]\nContact Phone: [Phone]\n\nPayment Instructions:\n[PaymentInstructions]\n\nOur team will review your application and contact you shortly.\n\nBest regards,\nDiscount Club Cayman Team',
        '["ContactName", "OrganizationType", "OrganizationName", "EstimatedMembers", "Email", "Phone", "PaymentInstructions"]'::jsonb,
        'Sent to business/association contact after form submission'
    ),
    (
        'Corporate Sales Notification',
        'corporate_sales_notification',
        'New [OrganizationType] Membership Application',
        'A new [OrganizationType] membership application has been submitted.\n\nOrganization: [OrganizationName]\nContact: [ContactName]\nEmail: [Email]\nPhone: [Phone]\nEstimated Members: [EstimatedMembers]\nMeeting Requested: [MeetingRequested]\nSubmission Date: [SubmissionDate]',
        '["OrganizationType", "OrganizationName", "ContactName", "Email", "Phone", "EstimatedMembers", "MeetingRequested", "SubmissionDate"]'::jsonb,
        'Sent to CorpSales@DiscountClubCayman.com when business/association submits form'
    ),
    (
        'Member Upload Request',
        'member_upload_request',
        'Member List Upload Required - [OrganizationName]',
        'Dear [ContactName],\n\nYour [OrganizationType] membership application for [OrganizationName] has been approved!\n\nNext Steps:\nPlease upload your member list using the link below:\n[UploadLink]\n\nRequired Information for Each Member:\n- First Name\n- Last Name\n- Email Address\n- Phone Number (optional)\n\nOnce uploaded, our team will review the list and send it to you for final approval.\n\nBest regards,\nDiscount Club Cayman Team',
        '["ContactName", "OrganizationType", "OrganizationName", "UploadLink"]'::jsonb,
        'Sent to organization contact requesting member list upload'
    ),
    (
        'Organization Approval Request',
        'organization_approval_request',
        'Review and Approve Member List - [OrganizationName]',
        'Dear [ContactName],\n\nWe have reviewed the member list for [OrganizationName].\n\nTotal Members: [TotalMembers]\n\nPlease review the attached member list and approve it using the link below:\n[ApprovalLink]\n\nIf you notice any errors or need to make changes, please contact us.\n\nBest regards,\nDiscount Club Cayman Team',
        '["ContactName", "OrganizationName", "TotalMembers", "ApprovalLink"]'::jsonb,
        'Sent to organization contact for final member list approval'
    ),
    (
        'Members Approved Notification',
        'members_approved_notification',
        'Members Activated - [OrganizationName]',
        'Dear [ContactName],\n\nGreat news! All members for [OrganizationName] have been approved and activated.\n\nTotal Members Activated: [TotalMembers]\n\nYour members can now access their Discount Club Cayman benefits.\n\nBest regards,\nDiscount Club Cayman Team',
        '["ContactName", "OrganizationName", "TotalMembers"]'::jsonb,
        'Sent to organization contact when all members are approved and activated'
    )
ON CONFLICT (template_key) DO NOTHING;

-- 14. Insert Default Membership Pricing
INSERT INTO public.membership_pricing (membership_type, price_per_member, min_members, max_members, special_pricing_threshold, description)
VALUES
    ('individual', 119.99, 1, 1, NULL, 'Individual annual membership - $119.99 per year'),
    ('business', 119.99, 1, 100, 100, 'Business membership - $119.99 per member per year (special pricing for 100+ members)'),
    ('association', 119.99, 1, 100, 100, 'Association membership - $119.99 per member per year (special pricing for 100+ members)')
ON CONFLICT (membership_type) DO NOTHING;

-- 15. Mock Data
DO $$
DECLARE
    existing_admin_id UUID;
    sample_individual_id UUID := gen_random_uuid();
    sample_business_id UUID := gen_random_uuid();
    sample_association_id UUID := gen_random_uuid();
    sample_upload_id UUID := gen_random_uuid();
BEGIN
    -- Get existing admin user
    SELECT id INTO existing_admin_id FROM public.user_profiles WHERE role = 'admin'::public.user_role LIMIT 1;
    
    IF existing_admin_id IS NOT NULL THEN
        -- Sample Individual Membership (completed payment)
        INSERT INTO public.individual_memberships (
            id, first_name, last_name, middle_initial, phone, email, district,
            paypal_order_id, payment_status, payment_amount, email_confirmed, status
        ) VALUES (
            sample_individual_id,
            'Sarah',
            'Thompson',
            'M',
            '345-916-1234',
            'sarah.thompson@example.com',
            'george_town'::public.district_name,
            'PAYPAL-' || gen_random_uuid()::TEXT,
            'completed',
            119.99,
            true,
            'active'::public.membership_status
        ) ON CONFLICT (id) DO NOTHING;
        
        -- Sample Business Membership (pending approval)
        INSERT INTO public.organization_memberships (
            id, contact_name, organization_type, organization_name, email, phone,
            estimated_members, per_member_price, special_pricing, status
        ) VALUES (
            sample_business_id,
            'John Mitchell',
            'business'::public.organization_type,
            'Cayman Tech Solutions',
            'john.mitchell@caymantech.com',
            '345-949-5555',
            45,
            119.99,
            false,
            'payment_pending'::public.membership_status
        ) ON CONFLICT (id) DO NOTHING;
        
        -- Sample Association Membership (special pricing review)
        INSERT INTO public.organization_memberships (
            id, contact_name, organization_type, organization_name, email, phone,
            estimated_members, special_pricing, special_pricing_reason, status
        ) VALUES (
            sample_association_id,
            'Maria Rodriguez',
            'association'::public.organization_type,
            'Cayman Islands Teachers Association',
            'maria.rodriguez@cita.ky',
            '345-949-7777',
            150,
            true,
            'Over 100 members - requires special pricing approval',
            'special_pricing_review'::public.membership_status
        ) ON CONFLICT (id) DO NOTHING;
        
        -- Sample Member Upload
        INSERT INTO public.member_uploads (
            id, organization_membership_id, uploaded_by, file_name,
            total_members, status
        ) VALUES (
            sample_upload_id,
            sample_business_id,
            'john.mitchell@caymantech.com',
            'cayman_tech_members.csv',
            45,
            'pending'
        ) ON CONFLICT (id) DO NOTHING;
        
        -- Sample Uploaded Members
        INSERT INTO public.uploaded_members (
            member_upload_id, organization_membership_id,
            first_name, last_name, email, phone, district, status
        ) VALUES
            (
                sample_upload_id, sample_business_id,
                'Emily', 'Johnson', 'emily.johnson@caymantech.com',
                '345-916-2001', 'george_town'::public.district_name, 'pending'
            ),
            (
                sample_upload_id, sample_business_id,
                'Michael', 'Brown', 'michael.brown@caymantech.com',
                '345-916-2002', 'west_bay'::public.district_name, 'pending'
            ),
            (
                sample_upload_id, sample_business_id,
                'Jessica', 'Davis', 'jessica.davis@caymantech.com',
                '345-916-2003', 'bodden_town'::public.district_name, 'pending'
            )
        ON CONFLICT (id) DO NOTHING;
        
    ELSE
        RAISE NOTICE 'No admin user found. Skipping mock membership data.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;