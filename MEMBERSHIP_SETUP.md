# DCC Membership System - External Setup Required

## Email Notification System

The membership system logs email notifications to the `email_logs` table in the database. To send actual emails, you need to implement an email service.

### Recommended Options:

1. **Supabase Edge Functions** (Recommended)
   - Create an Edge Function to process email_logs table
   - Use a service like Resend, SendGrid, or AWS SES
   - Trigger function on new email_logs inserts

2. **External Email Service**
   - Poll email_logs table for unsent emails
   - Send via your preferred email provider
   - Update status to 'sent' or 'failed'

### Email Recipients:
- **IndSales@DiscountClubCayman.com** - Individual membership sales notifications
- **CorpSales@DiscountClubCayman.com** - Business/Association sales notifications
- **Member emails** - Confirmation and approval notifications

## PayPal Configuration

Ensure your PayPal credentials are configured in `.env`:

```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
PAYPAL_MODE=sandbox  # Change to 'live' for production
```

## Database Migration

Run the migration to create all membership tables:

```bash
# Migration file: supabase/migrations/20260209200900_dcc_membership_system.sql
# This creates:
# - individual_memberships table
# - organization_memberships table
# - member_uploads table
# - uploaded_members table
# - email_templates table (with default templates)
# - email_logs table
# - membership_pricing table
```

## Admin Access

To access the Memberships and Email Templates tabs in the Admin Dashboard:
1. Log in with an admin account
2. Navigate to Admin Dashboard
3. Click on "Memberships" or "Email Templates" tabs

## Testing the System

### Individual Membership Flow:
1. Visit `/membership`
2. Select "Individual" membership
3. Fill in the form (all fields required)
4. Complete PayPal payment ($119.99)
5. Check email for confirmation link
6. Admin receives notification at IndSales@DiscountClubCayman.com

### Business/Association Flow:
1. Visit `/membership`
2. Select "Business" or "Association"
3. Fill in the form
4. Submit application
5. Admin reviews in Admin Dashboard > Memberships > Organization tab
6. Admin can set special pricing for 100+ members
7. Admin approves and requests member upload
8. Organization uploads member list
9. Admin reviews in spreadsheet view
10. Admin sends for organization approval
11. Organization approves
12. Admin performs mass approval

## Email Template Customization

Default email templates are created in the database. Customize them in:
- Admin Dashboard > Email Templates tab
- Edit subject and body
- Use placeholders like [FirstName], [OrganizationName], etc.

## Status Workflow

### Individual:
- submitted → payment_pending → active

### Business/Association:
- submitted → payment_pending → special_pricing_review (if >100 members)
- → approved_payment → upload_requested → upload_submitted
- → under_review → awaiting_organization_approval → members_approved → active
