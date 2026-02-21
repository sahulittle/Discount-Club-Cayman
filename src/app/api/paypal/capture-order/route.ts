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

    // Update purchase record
    const { data: purchase, error: fetchError } = await supabase
      .from('banner_purchases')
      .select('*')
      .eq('paypal_order_id', orderId)
      .single();

    if (fetchError || !purchase) {
      return NextResponse.json({ error: 'Purchase record not found' }, { status: 404 });
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('banner_purchases')
      .update({
        payment_status: 'completed',
        paypal_payer_id: captureData.payer?.payer_id,
        is_active: false
      })
      .eq('paypal_order_id', orderId);

    if (updateError) {
      console.error('Failed to update purchase:', updateError);
    }

    // Create advertising banner
    const { data: banner, error: bannerError } = await supabase
      .from('advertising_banners')
      .insert({
        business_id: purchase.business_id,
        title: purchase.banner_title,
        image_url: purchase.banner_image_url || '',
        link_url: purchase.banner_link_url,
        position: purchase.position,
        duration: purchase.duration,
        price: purchase.total_paid,
        start_date: purchase.start_date,
        end_date: purchase.end_date,
        is_active: true
      })
      .select()
      .single();

    if (bannerError) {
      console.error('Failed to create banner:', bannerError);
    } else {
      // Link banner to purchase
      await supabase
        .from('banner_purchases')
        .update({ banner_id: banner.id, is_active: true })
        .eq('paypal_order_id', orderId);
    }

    return NextResponse.json({ success: true, captureData });
  } catch (error: any) {
    console.error('Capture order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
