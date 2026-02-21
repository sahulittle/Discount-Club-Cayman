import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { orderId } = await request.json();

    // Capture PayPal payment
    const accessToken = await getPayPalAccessToken();
    
    const captureResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok || captureData.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment capture failed' }, { status: 400 });
    }

    // Update membership record
    const { data: membership, error: fetchError } = await supabase
      .from('individual_memberships')
      .select('*')
      .eq('paypal_order_id', orderId)
      .single();

    if (fetchError || !membership) {
      return NextResponse.json({ error: 'Membership record not found' }, { status: 404 });
    }

    // Generate email confirmation token
    const confirmationToken = `${membership.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Update payment status and generate confirmation token
    const { error: updateError } = await supabase
      .from('individual_memberships')
      .update({
        payment_status: 'completed',
        paypal_payer_id: captureData.payer?.payer_id,
        status: 'payment_pending',
        email_confirmation_token: confirmationToken,
        email_confirmation_sent_at: new Date().toISOString()
      })
      .eq('paypal_order_id', orderId);

    if (updateError) {
      console.error('Failed to update membership:', updateError);
    }

    // Log email notifications (in production, these would trigger actual emails)
    // 1. Send to IndSales@DiscountClubCayman.com
    await supabase.from('email_logs').insert({
      recipient_email: 'IndSales@DiscountClubCayman.com',
      subject: 'New Individual Membership Purchase',
      body: `New individual membership purchase:\n\nName: ${membership.first_name} ${membership.middle_initial || ''} ${membership.last_name}\nEmail: ${membership.email}\nPhone: ${membership.phone}\nDistrict: ${membership.district}\nPayment: $119.99\nPayPal Order: ${orderId}`,
      status: 'sent',
      metadata: { membership_id: membership.id, type: 'sales_notification' }
    });

    // 2. Send confirmation email to member
    const confirmationLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/confirm-email?token=${confirmationToken}`;
    await supabase.from('email_logs').insert({
      recipient_email: membership.email,
      subject: 'Confirm Your Email - Discount Club Cayman',
      body: `Dear ${membership.first_name} ${membership.last_name},\n\nThank you for joining Discount Club Cayman!\n\nPlease confirm your email: ${confirmationLink}\n\nImportant: This must be a valid and active email address.`,
      status: 'sent',
      metadata: { membership_id: membership.id, type: 'email_confirmation', token: confirmationToken }
    });

    return NextResponse.json({ 
      success: true, 
      captureData,
      confirmationRequired: true,
      message: 'Payment successful! Please check your email to confirm your address.'
    });
  } catch (error: any) {
    console.error('Capture membership order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
