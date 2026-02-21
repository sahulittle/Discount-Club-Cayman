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
    const body = await request.json();
    const { membershipId, firstName, lastName, middleInitial, phone, email, district } = body;

    // Create individual membership record
    const { data: membership, error: membershipError } = await supabase
      .from('individual_memberships')
      .insert({
        first_name: firstName,
        last_name: lastName,
        middle_initial: middleInitial || null,
        phone,
        email,
        district,
        payment_status: 'pending',
        payment_amount: 119.99,
        status: 'submitted'
      })
      .select()
      .single();

    if (membershipError) {
      console.error('Failed to create membership record:', membershipError);
      return NextResponse.json({ error: 'Failed to create membership record' }, { status: 500 });
    }

    // Create PayPal order
    const accessToken = await getPayPalAccessToken();
    
    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: '119.99'
          },
          description: 'Discount Club Cayman - Individual Annual Membership',
          custom_id: membership.id
        }]
      })
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }

    // Update membership with PayPal order ID
    await supabase
      .from('individual_memberships')
      .update({ paypal_order_id: orderData.id })
      .eq('id', membership.id);

    return NextResponse.json({ orderId: orderData.id, membershipId: membership.id });
  } catch (error: any) {
    console.error('Create membership order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
