'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface Business {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Certificate {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  face_value: number;
  member_price: number;
  quantity_available: number;
  quantity_sold: number;
  businesses: Business;
}

export default function CertificatesContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          businesses (id, name, logo_url)
        `)
        .eq('is_active', true)
        .gt('quantity_available', 0)
        .order('face_value', { ascending: true });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const calculateSavings = (faceValue: number, memberPrice: number) => {
    return faceValue - memberPrice;
  };

  const calculateSavingsPercentage = (faceValue: number, memberPrice: number) => {
    return Math.round(((faceValue - memberPrice) / faceValue) * 100);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6">
              Redeemable Certificates
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Purchase certificates at member-exclusive prices and redeem them at participating businesses. Your membership pays for itself!
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-foreground mb-4">
              How Certificates Work
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to instant savings
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                1
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                Purchase
              </h3>
              <p className="text-muted-foreground">
                Buy certificates at discounted member prices. Pay less than face value.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                2
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                Receive
              </h3>
              <p className="text-muted-foreground">
                Get your certificate instantly in your member dashboard.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                3
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                Redeem
              </h3>
              <p className="text-muted-foreground">
                Use the full face value at participating businesses. Keep the savings!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Certificates */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-foreground mb-4">
              Available Certificates
            </h2>
            <p className="text-xl text-muted-foreground">
              Purchase now and save instantly
            </p>
          </div>

          {loadingCertificates ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : certificates?.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="TicketIcon" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">No certificates available at this time.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {certificates?.map((cert) => (
                <div key={cert?.id} className="bg-white rounded-2xl overflow-hidden border-2 border-border hover:border-primary hover:shadow-xl transition-all">
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      {cert?.businesses?.logo_url ? (
                        <AppImage
                          src={cert?.businesses?.logo_url}
                          alt={cert?.businesses?.name || 'Business'}
                          width={80}
                          height={80}
                          className="w-16 h-16 object-contain rounded-full"
                        />
                      ) : (
                        <Icon name="TicketIcon" size={40} className="text-primary" />
                      )}
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                      {cert?.businesses?.name}
                    </h3>
                    <p className="text-muted-foreground">{cert?.title}</p>
                  </div>

                  <div className="p-6">
                    {cert?.description && (
                      <p className="text-muted-foreground text-sm mb-6">
                        {cert?.description}
                      </p>
                    )}

                    <div className="bg-primary/5 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Face Value</span>
                        <span className="text-2xl font-bold text-foreground">${cert?.face_value}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Member Price</span>
                        <span className="text-2xl font-bold text-primary">${cert?.member_price}</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">You Save</span>
                          <div className="text-right">
                            <span className="text-xl font-bold text-success">
                              ${calculateSavings(cert?.face_value, cert?.member_price)}
                            </span>
                            <span className="text-sm text-success ml-2">
                              ({calculateSavingsPercentage(cert?.face_value, cert?.member_price)}% off)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        {cert?.quantity_available} available
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {cert?.quantity_sold} sold
                      </span>
                    </div>

                    <button className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                      Purchase Certificate
                      <Icon name="ShoppingCartIcon" size={18} />
                    </button>
                  </div>
                </div>
              )) || []}
            </div>
          )}
        </div>
      </div>

      {/* Value Proposition */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
            <h2 className="font-heading text-4xl font-bold mb-6">
              Your Membership Pays for Itself
            </h2>
            <p className="text-xl opacity-90 mb-8">
              With up to $2,000 in certificate savings available, you can recover your membership cost in your first purchase. The more you use, the more you save!
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="text-5xl font-bold mb-2">$2,000</p>
                <p className="opacity-90">Maximum Certificate Value</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">20%</p>
                <p className="opacity-90">Average Savings</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">100%</p>
                <p className="opacity-90">Member Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}