'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';

interface Business {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  category: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  is_featured: boolean;
}

interface Discount {
  id: string;
  title: string;
  description: string | null;
  offer_text: string;
  terms: string | null;
  valid_until: string | null;
}

interface Certificate {
  id: string;
  title: string;
  face_value: number;
  member_price: number;
  quantity_available: number;
}

interface BusinessProfileContentProps {
  businessId: string;
}

export default function BusinessProfileContent({ businessId }: BusinessProfileContentProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessData();
  }, [businessId]);

  const fetchBusinessData = async () => {
    try {
      // Validate businessId is a valid UUID format before querying
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!businessId || !uuidRegex.test(businessId)) {
        console.error('Invalid business ID format:', businessId);
        setLoading(false);
        return;
      }

      const supabase = createClient();

      // Fetch business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (businessError) throw businessError;
      setBusiness(businessData);

      // Fetch discounts
      const { data: discountsData, error: discountsError } = await supabase
        .from('discounts')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (!discountsError) setDiscounts(discountsData || []);

      // Fetch certificates
      const { data: certificatesData, error: certificatesError } = await supabase
        .from('certificates')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .gt('quantity_available', 0);

      if (!certificatesError) setCertificates(certificatesData || []);
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="BuildingStorefrontIcon" size={64} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Business Not Found</h2>
          <p className="text-muted-foreground mb-6">The business you are looking for does not exist.</p>
          <Link
            href="/discounts"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
          >
            <Icon name="ArrowLeftIcon" size={18} />
            Back to Discounts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Business Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start gap-8">
            <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              {business?.logo_url ? (
                <AppImage
                  src={business?.logo_url}
                  alt={business?.name || 'Business logo'}
                  width={128}
                  height={128}
                  className="w-28 h-28 object-contain rounded-xl"
                />
              ) : (
                <Icon name="BuildingStorefrontIcon" size={64} className="text-primary" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-heading text-5xl font-bold text-foreground mb-3">
                    {business?.name}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    {business?.location && (
                      <div className="flex items-center gap-2">
                        <Icon name="MapPinIcon" size={18} />
                        <span>{business?.location}</span>
                      </div>
                    )}
                    {business?.phone && (
                      <div className="flex items-center gap-2">
                        <Icon name="PhoneIcon" size={18} />
                        <a href={`tel:${business?.phone}`} className="hover:text-primary">
                          {business?.phone}
                        </a>
                      </div>
                    )}
                    {business?.email && (
                      <div className="flex items-center gap-2">
                        <Icon name="EnvelopeIcon" size={18} />
                        <a href={`mailto:${business?.email}`} className="hover:text-primary">
                          {business?.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href="/advertise"
                  className="px-6 py-3 bg-accent text-white rounded-full font-semibold hover:bg-accent/90 transition-all shadow-lg flex items-center gap-2"
                >
                  <Icon name="MegaphoneIcon" size={18} />
                  Advertise With Us
                </Link>
              </div>

              {business?.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {business?.description}
                </p>
              )}

              {business?.website && (
                <a
                  href={business?.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
                >
                  <Icon name="GlobeAltIcon" size={18} />
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Discounts & Offers */}
      {discounts?.length > 0 && (
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-8">
              Current Offers
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {discounts?.map((discount) => (
                <div key={discount?.id} className="bg-white rounded-2xl p-8 border border-border hover:shadow-lg transition-all">
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                    {discount?.title}
                  </h3>
                  <p className="text-primary font-bold text-xl mb-4">
                    {discount?.offer_text}
                  </p>
                  {discount?.description && (
                    <p className="text-muted-foreground mb-4">
                      {discount?.description}
                    </p>
                  )}
                  {discount?.terms && (
                    <p className="text-sm text-muted-foreground border-t border-border pt-4">
                      <strong>Terms:</strong> {discount?.terms}
                    </p>
                  )}
                  {discount?.valid_until && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Valid until:</strong> {new Date(discount?.valid_until).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )) || []}
            </div>
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates?.length > 0 && (
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-8">
              Available Certificates
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {certificates?.map((cert) => (
                <div key={cert?.id} className="bg-white rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4">
                    {cert?.title}
                  </h3>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Face Value</span>
                      <span className="font-bold text-foreground">${cert?.face_value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member Price</span>
                      <span className="font-bold text-primary">${cert?.member_price}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="font-semibold text-foreground">You Save</span>
                      <span className="font-bold text-success">${cert?.face_value - cert?.member_price}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {cert?.quantity_available} available
                  </p>
                  <button className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all">
                    Purchase
                  </button>
                </div>
              )) || []}
            </div>
          </div>
        </div>
      )}

      {/* Advertise CTA */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-accent text-white rounded-2xl p-12 text-center">
            <Icon name="MegaphoneIcon" size={64} className="mx-auto mb-6" />
            <h2 className="font-heading text-4xl font-bold mb-4">
              Want to Boost Your Visibility?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Advertise your business with premium banner placements on our high-traffic discount directory. Reach thousands of engaged members actively looking for local deals.
            </p>
            <Link
              href="/advertise"
              className="px-8 py-4 bg-white text-accent rounded-full text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg inline-flex items-center gap-2"
            >
              Learn About Advertising
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}