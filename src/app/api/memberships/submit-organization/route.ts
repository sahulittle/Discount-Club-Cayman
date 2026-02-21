import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { 
      contactName, 
      organizationType, 
      organizationName, 
      email, 
      phone, 
      estimatedMembers,
      meetingRequested 
    } = body;

    // Determine if special pricing is needed (>100 members)
    const needsSpecialPricing = estimatedMembers > 100;
    const perMemberPrice = 119.99;
    const totalPrice = estimatedMembers * perMemberPrice;

    // Create organization membership record
    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .insert({
        contact_name: contactName,
        organization_type: organizationType,
        organization_name: organizationName,
        email,
        phone,
        estimated_members: estimatedMembers,
        per_member_price: perMemberPrice,
        total_price: totalPrice,
        special_pricing: needsSpecialPricing,
        special_pricing_reason: needsSpecialPricing ? 'Over 100 members - requires admin approval for special pricing' : null,
        meeting_requested: meetingRequested || false,
        status: needsSpecialPricing ? 'special_pricing_review' : 'submitted',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (membershipError) {
      console.error('Failed to create membership record:', membershipError);
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    // Generate payment instructions
    const paymentInstructions = needsSpecialPricing
      ? 'Your application requires special pricing review due to the number of members. Our team will contact you with pricing details and payment instructions.'
      : `Total Amount: $${totalPrice.toFixed(2)} USD\n\nPayment can be made via:\n- Bank Transfer\n- Check\n- Wire Transfer\n\nOur team will contact you with detailed payment instructions.`;

    // Log email to organization contact
    await supabase.from('email_logs').insert({
      recipient_email: email,
      subject: `Membership Application Received - ${organizationName}`,
      body: `Dear ${contactName},\n\nThank you for your ${organizationType} membership application for ${organizationName}.\n\nEstimated Members: ${estimatedMembers}\n\n${paymentInstructions}\n\nBest regards,\nDiscount Club Cayman Team`,
      status: 'sent',
      metadata: { membership_id: membership.id, type: 'organization_confirmation' }
    });

    // Log email to CorpSales@DiscountClubCayman.com
    await supabase.from('email_logs').insert({
      recipient_email: 'CorpSales@DiscountClubCayman.com',
      subject: `New ${organizationType.charAt(0).toUpperCase() + organizationType.slice(1)} Membership Application`,
      body: `New ${organizationType} application:\n\nOrganization: ${organizationName}\nContact: ${contactName}\nEmail: ${email}\nPhone: ${phone}\nEstimated Members: ${estimatedMembers}\nMeeting Requested: ${meetingRequested ? 'Yes' : 'No'}\nSpecial Pricing: ${needsSpecialPricing ? 'Yes' : 'No'}`,
      status: 'sent',
      metadata: { membership_id: membership.id, type: 'corporate_sales_notification' }
    });

    return NextResponse.json({ 
      success: true, 
      membershipId: membership.id,
      needsSpecialPricing,
      message: 'Application submitted successfully! Check your email for next steps.'
    });
  } catch (error: any) {
    console.error('Submit organization membership error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
