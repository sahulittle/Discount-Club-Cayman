'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface TravelDeal {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  regular_price: number | null;
  member_price: number;
  savings_amount: number | null;
  destination: string | null;
  deal_type: string | null;
  is_featured: boolean;
  valid_until: string | null;
}

export default function TravelContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [travelDeals, setTravelDeals] = useState<TravelDeal[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchTravelDeals();
    }
  }, [user]);

  const fetchTravelDeals = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('travel_deals')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTravelDeals(data || []);
    } catch (error) {
      console.error('Error fetching travel deals:', error);
    } finally {
      setLoadingDeals(false);
    }
  };

  const filteredDeals = selectedType === 'all'
    ? travelDeals
    : travelDeals?.filter(deal => deal?.deal_type?.toLowerCase() === selectedType) || [];

  const featuredDeals = travelDeals?.filter(deal => deal?.is_featured) || [];

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
              Member-Exclusive Travel Deals
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Save up to 70% on hotels, flights, cruises, and vacation packages worldwide. Your membership unlocks incredible travel savings.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Deals */}
      {featuredDeals?.length > 0 && (
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-3xl font-bold text-foreground">
                Featured Deals
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredDeals?.map((deal) => (
                <div key={deal?.id} className="bg-white rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all group">
                  <div className="relative h-48 overflow-hidden">
                    <AppImage
                      src={deal?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                      alt={deal?.title || 'Travel deal'}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-accent text-white rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="MapPinIcon" size={16} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{deal?.destination}</span>
                    </div>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                      {deal?.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {deal?.description}
                    </p>
                    <div className="flex items-end gap-3 mb-4">
                      {deal?.regular_price && (
                        <span className="text-muted-foreground line-through text-sm">
                          ${deal?.regular_price}
                        </span>
                      )}
                      <span className="text-3xl font-bold text-primary">
                        ${deal?.member_price}
                      </span>
                      {deal?.savings_amount && (
                        <span className="text-success font-semibold text-sm">
                          Save ${deal?.savings_amount}
                        </span>
                      )}
                    </div>
                    <button className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                      View Deal
                      <Icon name="ArrowRightIcon" size={18} />
                    </button>
                  </div>
                </div>
              )) || []}
            </div>
          </div>
        </div>
      )}

      {/* All Deals */}
      <div className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              All Travel Deals
            </h2>
            <div className="flex gap-2">
              {['all', 'hotel', 'flight', 'cruise', 'package'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-foreground hover:bg-primary/10'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loadingDeals ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredDeals?.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="GlobeAmericasIcon" size={64} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">No travel deals available at this time.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {filteredDeals?.map((deal) => (
                <div key={deal?.id} className="bg-white rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all group">
                  <div className="relative h-48 overflow-hidden">
                    <AppImage
                      src={deal?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                      alt={deal?.title || 'Travel deal'}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {deal?.deal_type && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold">
                        {deal?.deal_type}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="MapPinIcon" size={16} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{deal?.destination}</span>
                    </div>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                      {deal?.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {deal?.description}
                    </p>
                    <div className="flex items-end gap-3 mb-4">
                      {deal?.regular_price && (
                        <span className="text-muted-foreground line-through text-sm">
                          ${deal?.regular_price}
                        </span>
                      )}
                      <span className="text-3xl font-bold text-primary">
                        ${deal?.member_price}
                      </span>
                    </div>
                    <button className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                      View Deal
                      <Icon name="ArrowRightIcon" size={18} />
                    </button>
                  </div>
                </div>
              )) || []}
            </div>
          )}
        </div>
      </div>

      {/* Travel API Integration Notice */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-primary/10 border-2 border-primary/20 rounded-2xl p-8 text-center">
            <Icon name="InformationCircleIcon" size={48} className="text-primary mx-auto mb-4" />
            <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
              Third-Party Travel API Integration
            </h3>
            <p className="text-muted-foreground mb-6">
              This section will be integrated with a third-party travel booking API to provide real-time hotel, flight, and vacation package searches with member-exclusive rates.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact your administrator to configure the travel API integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}