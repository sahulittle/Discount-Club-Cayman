import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' ?'https://api-m.paypal.com'
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, position, duration, price, bannerTitle, bannerImageUrl, bannerLinkUrl } = body;

    // Verify business ownership
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, owner_id')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .single();

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found or unauthorized' }, { status: 403 });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    if (duration === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (duration === 'six_months') {
      endDate.setMonth(endDate.getMonth() + 6);
    } else if (duration === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
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
            value: price.toFixed(2)
          },
          description: `Banner Ad - ${position} placement - ${duration}`,
          custom_id: businessId
        }]
      })
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }

    // Store purchase record
    const { error: insertError } = await supabase
      .from('banner_purchases')
      .insert({
        business_id: businessId,
        position,
        duration,
        price,
        total_paid: price,
        paypal_order_id: orderData.id,
        payment_status: 'pending',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        banner_title: bannerTitle,
        banner_image_url: bannerImageUrl,
        banner_link_url: bannerLinkUrl,
        is_active: false
      });

    if (insertError) {
      console.error('Failed to store purchase:', insertError);
    }

    return NextResponse.json({ orderId: orderData.id });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
