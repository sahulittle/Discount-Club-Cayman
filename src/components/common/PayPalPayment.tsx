'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { createClient } from '@/lib/supabase/client';

interface PayPalPaymentProps {
  businessId: string;
  position: 'top' | 'mid' | 'bottom';
  duration: 'monthly' | 'six_months' | 'annual';
  price: number;
  bannerTitle: string;
  bannerImageUrl?: string;
  bannerLinkUrl?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PayPalPayment({
  businessId,
  position,
  duration,
  price,
  bannerTitle,
  bannerImageUrl,
  bannerLinkUrl,
  onSuccess,
  onError
}: PayPalPaymentProps) {
  const supabase = createClient();

  const createOrder = async () => {
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          position,
          duration,
          price,
          bannerTitle,
          bannerImageUrl,
          bannerLinkUrl
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order');
      return data.orderId;
    } catch (error: any) {
      onError(error.message);
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to capture payment');

      onSuccess();
    } catch (error: any) {
      onError(error.message);
    }
  };

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  if (!clientId) {
    return (
      <div className="text-center py-4 text-red-600">
        PayPal configuration missing. Please add NEXT_PUBLIC_PAYPAL_CLIENT_ID to environment variables.
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: 'USD',
        intent: 'capture'
      }}
    >
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={(err) => onError('Payment failed. Please try again.')}
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        }}
      />
    </PayPalScriptProvider>
  );
}
