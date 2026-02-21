'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import toast, { Toaster } from 'react-hot-toast';

export default function MemberDashboardContent() {
  const { user } = useAuth();
  const [qrCodeData, setQrCodeData] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [travelDeals, setTravelDeals] = useState<any[]>([]);
  const [newDiscounts, setNewDiscounts] = useState<any[]>([]);
  const [unbeatableDeals, setUnbeatableDeals] = useState<any[]>([]);
  const [newCertificates, setNewCertificates] = useState<any[]>([]);
  const [hotCertificates, setHotCertificates] = useState<any[]>([]);
  const [providerDirectory, setProviderDirectory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateQRCode();
      fetchDashboardData();
      
      // Rotate QR code every 10 minutes
      const qrInterval = setInterval(() => {
        generateQRCode();
      }, 10 * 60 * 1000);
      
      return () => clearInterval(qrInterval);
    }
  }, [user]);

  const generateQRCode = async () => {
    const timestamp = Date.now();
    const qrData = `DCC-MEMBER-${user?.id}-${timestamp}`;
    setQrCodeData(qrData);
    
    // Store in database
    try {
      const supabase = createClient();
      const expiresAt = new Date(timestamp + 10 * 60 * 1000);
      
      await supabase.from('member_qr_codes').insert({
        user_id: user?.id,
        qr_code_data: qrData,
        expires_at: expiresAt.toISOString(),
        is_active: true
      });
    } catch (error) {
      console.error('Error storing QR code:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient();

      // Section 2: Special Travel Deals (3 cards)
      const { data: travelData } = await supabase
        .from('travel_deals')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(3);
      setTravelDeals(travelData || []);

      // Section 3: New Discounts (3 cards)
      const { data: discountsData } = await supabase
        .from('discounts')
        .select(`*, businesses(*)`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      setNewDiscounts(discountsData || []);

      // Section 4: Unbeatable Deals (horizontal scrolling banners)
      const { data: bannersData } = await supabase
        .from('advertising_banners')
        .select(`*, businesses(*)`)
        .eq('is_active', true)
        .eq('position', 'top')
        .order('display_order', { ascending: true });
      setUnbeatableDeals(bannersData || []);

      // Section 5: New Certificates (3 cards)
      const { data: newCertsData } = await supabase
        .from('certificates')
        .select(`*, businesses(name, logo_url)`)
        .eq('is_active', true)
        .gt('quantity_available', 0)
        .order('created_at', { ascending: false })
        .limit(3);
      setNewCertificates(newCertsData || []);

      // Section 6: HOT Certificates (banner)
      const { data: hotCertsData } = await supabase
        .from('certificates')
        .select(`*, businesses(name, logo_url)`)
        .eq('is_active', true)
        .gt('quantity_available', 0)
        .order('quantity_sold', { ascending: false })
        .limit(5);
      setHotCertificates(hotCertsData || []);

      // Section 7: Full Discount Provider Directory (4-column grid)
      const { data: directoryData } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      setProviderDirectory(directoryData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-6">
        {/* Header with QR Code Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
              Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')?.[0]}
            </h1>
            <p className="text-xl text-muted-foreground">
              Your exclusive member benefits await
            </p>
          </div>
          <button
            onClick={() => setShowQRModal(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
          >
            <Icon name="QrCodeIcon" size={24} />
            Show QR Code
          </button>
        </div>

        {/* Section 1: Three Large Horizontal Buttons */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/travel"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8 hover:shadow-xl transition-all group"
          >
            <Icon name="GlobeAltIcon" size={48} className="mb-4" />
            <h3 className="text-2xl font-bold mb-2">Browse Travel</h3>
            <p className="text-blue-100">Save up to 70% on travel deals</p>
          </Link>
          <Link
            href="/discounts"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-8 hover:shadow-xl transition-all group"
          >
            <Icon name="TagIcon" size={48} className="mb-4" />
            <h3 className="text-2xl font-bold mb-2">Browse Discounts</h3>
            <p className="text-green-100">25% off local businesses</p>
          </Link>
          <Link
            href="/certificates"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-8 hover:shadow-xl transition-all group"
          >
            <Icon name="TicketIcon" size={48} className="mb-4" />
            <h3 className="text-2xl font-bold mb-2">Browse Certificates</h3>
            <p className="text-purple-100">Exclusive member certificates</p>
          </Link>
        </div>

        {/* Section 2: Special Travel Deals */}
        <div className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-6">Special Travel Deals</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {travelDeals.map((deal) => (
              <div key={deal.id} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all">
                {deal.image_url && (
                  <AppImage
                    src={deal.image_url}
                    alt={deal.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{deal.title}</h3>
                  <p className="text-muted-foreground mb-4">{deal.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">${deal.member_price}</span>
                      {deal.regular_price && (
                        <span className="text-sm text-muted-foreground line-through ml-2">${deal.regular_price}</span>
                      )}
                    </div>
                    <Link
                      href="/travel"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      View Deal
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: New Discounts */}
        <div className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-6">New Discounts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {newDiscounts.map((discount) => (
              <div key={discount.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-4">
                  {discount.businesses?.logo_url ? (
                    <AppImage
                      src={discount.businesses.logo_url}
                      alt={discount.businesses.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon name="BuildingStorefrontIcon" size={32} className="text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{discount.businesses?.name}</h3>
                    <span className="text-sm text-muted-foreground">{discount.category}</span>
                  </div>
                </div>
                <div className="bg-primary/10 rounded-xl p-4 mb-4">
                  <p className="text-lg font-bold text-primary">{discount.offer_text}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{discount.description}</p>
                <Link
                  href={`/business-profile/${discount.business_id}`}
                  className="text-primary font-semibold hover:underline flex items-center gap-2"
                >
                  View Details
                  <Icon name="ArrowRightIcon" size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Unbeatable Deals (Horizontal Scrolling Banner) */}
        <div className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-6">Unbeatable Deals</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {unbeatableDeals.map((banner) => (
              <Link
                key={banner.id}
                href={banner.link_url || '#'}
                className="flex-shrink-0 w-96 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all"
              >
                <AppImage
                  src={banner.image_url}
                  alt={banner.title}
                  width={384}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-foreground">{banner.title}</h3>
                  <p className="text-sm text-muted-foreground">{banner.businesses?.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section 5: New Certificates */}
        <div className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-6">New Certificates</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {newCertificates.map((cert) => (
              <div key={cert.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-4">
                  {cert.businesses?.logo_url ? (
                    <AppImage
                      src={cert.businesses.logo_url}
                      alt={cert.businesses.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Icon name="TicketIcon" size={24} className="text-secondary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-foreground">{cert.title}</h3>
                    <p className="text-sm text-muted-foreground">{cert.businesses?.name}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Face Value</span>
                    <span className="text-lg font-bold text-foreground">${cert.face_value}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Member Price</span>
                    <span className="text-2xl font-bold text-secondary">${cert.member_price}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{cert.quantity_available} available</span>
                  <Link
                    href="/certificates"
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Purchase
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: HOT Certificates (Ad Banner) */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-heading font-bold mb-6 flex items-center gap-3">
              <Icon name="FireIcon" size={36} />
              HOT Certificates - Limited Time!
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {hotCertificates.map((cert) => (
                <div key={cert.id} className="flex-shrink-0 w-64 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="font-bold mb-2">{cert.title}</h3>
                  <p className="text-sm mb-3">{cert.businesses?.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">${cert.member_price}</span>
                    <Link
                      href="/certificates"
                      className="px-3 py-1 bg-white text-orange-600 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                    >
                      Get It
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 7: Full Discount Provider Directory */}
        <div className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-6">Discount Provider Directory</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {providerDirectory.map((business) => (
              <Link
                key={business.id}
                href={`/business-profile/${business.id}`}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition-all text-center"
              >
                {business.logo_url ? (
                  <AppImage
                    src={business.logo_url}
                    alt={business.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-contain mx-auto mb-4 rounded-xl"
                  />
                ) : (
                  <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="BuildingStorefrontIcon" size={40} className="text-primary" />
                  </div>
                )}
                <h3 className="font-bold text-foreground mb-1">{business.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{business.category}</p>
                <p className="text-xs text-muted-foreground">{business.location || 'Cayman Islands'}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowQRModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">Your Member QR Code</h3>
              <button onClick={() => setShowQRModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="XMarkIcon" size={24} />
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-8 flex items-center justify-center mb-6">
              <QRCodeSVG value={qrCodeData} size={256} level="H" />
            </div>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Show this QR code at participating businesses to redeem your member discounts.
            </p>
            <p className="text-center text-xs text-muted-foreground">
              This code rotates every 10 minutes for security.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}