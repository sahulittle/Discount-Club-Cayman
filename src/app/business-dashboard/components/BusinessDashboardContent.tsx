'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import PayPalPayment from '@/components/common/PayPalPayment';

export default function BusinessDashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<'top' | 'mid' | 'bottom'>('top');
  const [selectedDuration, setSelectedDuration] = useState<'monthly' | 'six_months' | 'annual'>('monthly');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerLinkUrl, setBannerLinkUrl] = useState('');
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment'>('details');
  const [myBanners, setMyBanners] = useState<any[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  const businessData = {
    name: "Foster\'s Food Fair",
    category: 'Groceries',
    profileViews: 1240,
    offerSaves: 342,
    certificateRedemptions: 28,
    engagementRate: 27.5,
  };

  const activeOffers = [
    {
      id: 'offer_1',
      title: '32% off weekly shopping',
      type: 'percentage',
      value: 32,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      views: 842,
      saves: 156,
      status: 'active',
    },
    {
      id: 'offer_2',
      title: 'Buy 2 Get 1 Free on organic produce',
      type: 'fixed',
      value: 0,
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      views: 398,
      saves: 89,
      status: 'active',
    },
  ];

  const activeCertificates = [
    {
      id: 'cert_1',
      title: '$50 Grocery Certificate',
      faceValue: 50,
      memberPrice: 40,
      sold: 24,
      redeemed: 18,
      status: 'active',
    },
    {
      id: 'cert_2',
      title: '$100 Grocery Certificate',
      faceValue: 100,
      memberPrice: 75,
      sold: 12,
      redeemed: 8,
      status: 'active',
    },
  ];

  const chartData = [
    { month: 'Aug', views: 820, saves: 124, redemptions: 18 },
    { month: 'Sep', views: 950, saves: 168, redemptions: 22 },
    { month: 'Oct', views: 1080, saves: 215, redemptions: 24 },
    { month: 'Nov', views: 1150, saves: 267, redemptions: 26 },
    { month: 'Dec', views: 1240, saves: 342, redemptions: 28 },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
            Welcome, {businessData?.name}
          </h1>
          <p className="text-xl text-muted-foreground">
            Your offers reached <span className="text-primary font-semibold">{businessData?.profileViews}</span> members this month
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Profile Views</p>
              <Icon name="EyeIcon" size={20} className="text-primary" />
            </div>
            <p className="text-3xl font-heading font-bold text-foreground">
              {businessData?.profileViews}
            </p>
            <p className="text-xs text-success mt-1">+12% from last month</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Offer Saves</p>
              <Icon name="BookmarkIcon" size={20} className="text-primary" />
            </div>
            <p className="text-3xl font-heading font-bold text-foreground">
              {businessData?.offerSaves}
            </p>
            <p className="text-xs text-success mt-1">+18% from last month</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Redemptions</p>
              <Icon name="CheckCircleIcon" size={20} className="text-primary" />
            </div>
            <p className="text-3xl font-heading font-bold text-foreground">
              {businessData?.certificateRedemptions}
            </p>
            <p className="text-xs text-success mt-1">+8% from last month</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Engagement Rate</p>
              <Icon name="ChartBarIcon" size={20} className="text-primary" />
            </div>
            <p className="text-3xl font-heading font-bold text-foreground">
              {businessData?.engagementRate}%
            </p>
            <p className="text-xs text-success mt-1">+3% from last month</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-border mb-8">
          <div className="border-b border-border px-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'overview' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'offers' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Offers
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'certificates'
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Certificates
              </button>
              <button
                onClick={() => setActiveTab('banners')}
                className={`py-4 border-b-2 font-semibold transition-colors ${
                  activeTab === 'banners' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Banners
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Analytics Chart */}
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-6">
                    Performance Overview
                  </h3>
                  <div className="bg-muted/30 rounded-xl p-6">
                    <div className="h-80 flex items-end justify-between gap-3 sm:gap-4 md:gap-6">
                      {chartData?.map((data, index) => (
                        <div key={`chart_${index}`} className="flex-1 flex flex-col items-center gap-3">
                          {/* Bars Container */}
                          <div className="w-full flex items-end justify-center gap-1 h-64">
                            {/* Views Bar */}
                            <div className="flex flex-col items-center gap-1 flex-1">
                              <div className="w-full flex flex-col items-center">
                                <span className="text-xs font-semibold text-primary mb-1">
                                  {data?.views}
                                </span>
                                <div
                                  className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                                  style={{ height: `${(data?.views / 1500) * 200}px`, minHeight: '20px' }}
                                />
                              </div>
                            </div>
                            
                            {/* Saves Bar */}
                            <div className="flex flex-col items-center gap-1 flex-1">
                              <div className="w-full flex flex-col items-center">
                                <span className="text-xs font-semibold text-secondary mb-1">
                                  {data?.saves}
                                </span>
                                <div
                                  className="w-full bg-secondary rounded-t transition-all hover:opacity-80"
                                  style={{ height: `${(data?.saves / 400) * 200}px`, minHeight: '20px' }}
                                />
                              </div>
                            </div>
                            
                            {/* Redemptions Bar */}
                            <div className="flex flex-col items-center gap-1 flex-1">
                              <div className="w-full flex flex-col items-center">
                                <span className="text-xs font-semibold text-accent mb-1">
                                  {data?.redemptions}
                                </span>
                                <div
                                  className="w-full bg-accent rounded-t transition-all hover:opacity-80"
                                  style={{ height: `${(data?.redemptions / 30) * 200}px`, minHeight: '20px' }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Month Label */}
                          <p className="text-sm font-bold text-foreground">
                            {data?.month}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-primary rounded" />
                        <span className="text-sm font-medium text-foreground">Profile Views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-secondary rounded" />
                        <span className="text-sm font-medium text-foreground">Offer Saves</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-accent rounded" />
                        <span className="text-sm font-medium text-foreground">Redemptions</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button className="flex items-center gap-4 p-4 border-2 border-border rounded-xl hover:border-primary hover:shadow-sm transition-all">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="PlusIcon" size={24} className="text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground">Create New Offer</p>
                        <p className="text-sm text-muted-foreground">Add a discount</p>
                      </div>
                    </button>

                    <button className="flex items-center gap-4 p-4 border-2 border-border rounded-xl hover:border-primary hover:shadow-sm transition-all">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                        <Icon name="TicketIcon" size={24} className="text-secondary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground">Create Certificate</p>
                        <p className="text-sm text-muted-foreground">Add a voucher</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Offers Tab */}
            {activeTab === 'offers' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    Active Offers
                  </h3>
                  <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center gap-2">
                    <Icon name="PlusIcon" size={18} />
                    Create Offer
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Offer Title
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Duration
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Views
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Saves
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOffers?.map((offer) => (
                        <tr key={offer?.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-4 px-4">
                            <p className="font-semibold text-foreground">{offer?.title}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                              {offer?.type === 'percentage' ? `${offer?.value}% off` : 'Fixed'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">
                            {offer?.startDate} to {offer?.endDate}
                          </td>
                          <td className="py-4 px-4 text-sm text-foreground font-semibold">
                            {offer?.views}
                          </td>
                          <td className="py-4 px-4 text-sm text-foreground font-semibold">
                            {offer?.saves}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <Icon name="PencilIcon" size={16} className="text-muted-foreground" />
                              </button>
                              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <Icon name="PauseIcon" size={16} className="text-muted-foreground" />
                              </button>
                              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <Icon name="TrashIcon" size={16} className="text-error" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    Active Certificates
                  </h3>
                  <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center gap-2">
                    <Icon name="PlusIcon" size={18} />
                    Create Certificate
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Certificate Title
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Face Value
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Member Price
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Sold
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Redeemed
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCertificates?.map((cert) => (
                        <tr key={cert?.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-4 px-4">
                            <p className="font-semibold text-foreground">{cert?.title}</p>
                          </td>
                          <td className="py-4 px-4 text-sm text-foreground font-semibold">
                            ${cert?.faceValue}
                          </td>
                          <td className="py-4 px-4 text-sm text-primary font-semibold">
                            ${cert?.memberPrice}
                          </td>
                          <td className="py-4 px-4 text-sm text-foreground font-semibold">
                            {cert?.sold}
                          </td>
                          <td className="py-4 px-4 text-sm text-success font-semibold">
                            {cert?.redeemed}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <Icon name="PencilIcon" size={16} className="text-muted-foreground" />
                              </button>
                              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <Icon name="PauseIcon" size={16} className="text-muted-foreground" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Banners Tab */}
            {activeTab === 'banners' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    Advertising Banners
                  </h3>
                  <button 
                    onClick={() => {
                      setShowBannerModal(true);
                      setPaymentStep('details');
                    }}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
                  >
                    <Icon name="PlusIcon" size={18} />
                    Purchase Banner
                  </button>
                </div>

                {/* Banner Pricing Info */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Icon name="SparklesIcon" size={20} className="text-white" />
                      </div>
                      <h4 className="font-heading font-bold text-lg text-foreground">Top Placement</h4>
                    </div>
                    <p className="text-3xl font-heading font-bold text-primary mb-2">$500<span className="text-sm text-muted-foreground">/month</span></p>
                    <p className="text-sm text-muted-foreground mb-4">728x200px • Premium visibility</p>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex items-center gap-2">
                        <Icon name="CheckCircleIcon" size={16} className="text-success" />
                        10% off 6-month plan
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="CheckCircleIcon" size={16} className="text-success" />
                        15% off annual plan
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-6 border border-secondary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                        <Icon name="StarIcon" size={20} className="text-white" />
                      </div>
                      <h4 className="font-heading font-bold text-lg text-foreground">Mid Placement</h4>
                    </div>
                    <p className="text-3xl font-heading font-bold text-secondary mb-2">$350<span className="text-sm text-muted-foreground">/month</span></p>
                    <p className="text-sm text-muted-foreground mb-4">728x200px • Great exposure</p>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex items-center gap-2">
                        <Icon name="CheckCircleIcon" size={16} className="text-success" />
                        10% off 6-month plan
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="CheckCircleIcon" size={16} className="text-success" />
                        15% off annual plan
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 border border-accent/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                        <Icon name="BoltIcon" size={20} className="text-white" />
                      </div>
                      <h4 className="font-heading font-bold text-lg text-foreground">Bottom Placement</h4>
                    </div>
                    <p className="text-3xl font-heading font-bold text-accent mb-2">$250<span className="text-sm text-muted-foreground">/month</span></p>
                    <p className="text-sm text-muted-foreground mb-4">728x200px • Solid reach</p>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex items-center gap-2">
                        <Icon name="CheckCircleIcon" size={16} className="text-success" />
                        10% off 6-month plan
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="CheckCircleIcon" size={16} className="text-success" />
                        15% off annual plan
                      </li>
                    </ul>
                  </div>
                </div>

                {/* My Banners */}
                <div>
                  <h4 className="font-heading text-lg font-bold text-foreground mb-4">My Active Banners</h4>
                  {myBanners?.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-xl">
                      <Icon name="PhotoIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No active banners yet. Purchase your first banner to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myBanners?.map((banner) => (
                        <div key={banner?.id} className="bg-white rounded-xl p-6 border border-border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-foreground mb-2">{banner?.title}</h5>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Icon name="MapPinIcon" size={14} />
                                  {banner?.position} placement
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="CalendarIcon" size={14} />
                                  {new Date(banner?.start_date).toLocaleDateString()} - {new Date(banner?.end_date).toLocaleDateString()}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  banner?.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                                }`}>
                                  {banner?.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Banner Purchase Modal */}
        {showBannerModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-heading text-2xl font-bold text-foreground">
                  {paymentStep === 'details' ? 'Purchase Banner Ad' : 'Complete Payment'}
                </h3>
                <button 
                  onClick={() => {
                    setShowBannerModal(false);
                    setBannerTitle('');
                    setBannerImageUrl('');
                    setBannerLinkUrl('');
                    setPaymentStep('details');
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Icon name="XMarkIcon" size={24} className="text-muted-foreground" />
                </button>
              </div>

              <div className="p-6">
                {paymentStep === 'details' ? (
                  <div className="space-y-6">
                    {/* Banner Details Form */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Banner Title *
                      </label>
                      <input
                        type="text"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        placeholder="Enter banner title"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Banner Image URL
                      </label>
                      <input
                        type="url"
                        value={bannerImageUrl}
                        onChange={(e) => setBannerImageUrl(e.target.value)}
                        placeholder="https://example.com/banner.jpg (728x200px)"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Link URL
                      </label>
                      <input
                        type="url"
                        value={bannerLinkUrl}
                        onChange={(e) => setBannerLinkUrl(e.target.value)}
                        placeholder="https://your-website.com"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Placement Position *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['top', 'mid', 'bottom'] as const).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => setSelectedPosition(pos)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedPosition === pos
                                ? 'border-primary bg-primary/10' :'border-border hover:border-primary/50'
                            }`}
                          >
                            <p className="font-semibold text-foreground capitalize">{pos}</p>
                            <p className="text-sm text-muted-foreground">
                              ${pos === 'top' ? '500' : pos === 'mid' ? '350' : '250'}/mo
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Duration *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'monthly' as const, label: '1 Month', discount: 0 },
                          { value: 'six_months' as const, label: '6 Months', discount: 5 },
                          { value: 'annual' as const, label: '1 Year', discount: 5 }
                        ].map((dur) => (
                          <button
                            key={dur.value}
                            onClick={() => setSelectedDuration(dur.value)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedDuration === dur.value
                                ? 'border-primary bg-primary/10' :'border-border hover:border-primary/50'
                            }`}
                          >
                            <p className="font-semibold text-foreground">{dur.label}</p>
                            {dur.discount > 0 && (
                              <p className="text-xs text-success font-semibold">Save {dur.discount}%</p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-muted/30 rounded-xl p-6">
                      <h4 className="font-semibold text-foreground mb-4">Price Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base Price:</span>
                          <span className="font-semibold text-foreground">
                            ${selectedPosition === 'top' ? '500' : selectedPosition === 'mid' ? '350' : '250'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-semibold text-foreground">
                            {selectedDuration === 'monthly' ? '1 month' : selectedDuration === 'six_months' ? '6 months' : '12 months'}
                          </span>
                        </div>
                        {(selectedDuration === 'six_months' || selectedDuration === 'annual') && (
                          <div className="flex justify-between text-success">
                            <span>Discount (5%):</span>
                            <span className="font-semibold">-${(
                              (selectedPosition === 'top' ? 500 : selectedPosition === 'mid' ? 350 : 250) *
                              (selectedDuration === 'six_months' ? 6 : 12) * 0.05
                            ).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t border-border pt-2 mt-2 flex justify-between">
                          <span className="font-bold text-foreground">Total:</span>
                          <span className="font-bold text-primary text-lg">
                            ${(
                              (selectedPosition === 'top' ? 500 : selectedPosition === 'mid' ? 350 : 250) *
                              (selectedDuration === 'monthly' ? 1 : selectedDuration === 'six_months' ? 6 : 12) *
                              (selectedDuration === 'monthly' ? 1 : 0.95)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!bannerTitle.trim()) {
                          alert('Please enter a banner title');
                          return;
                        }
                        setPaymentStep('payment');
                      }}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
                    >
                      Continue to Payment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-muted/30 rounded-xl p-6">
                      <h4 className="font-semibold text-foreground mb-2">Order Summary</h4>
                      <p className="text-sm text-muted-foreground mb-4">{bannerTitle}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="text-2xl font-bold text-primary">
                          ${(
                            (selectedPosition === 'top' ? 500 : selectedPosition === 'mid' ? 350 : 250) *
                            (selectedDuration === 'monthly' ? 1 : selectedDuration === 'six_months' ? 6 : 12) *
                            (selectedDuration === 'monthly' ? 1 : 0.95)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <PayPalPayment
                      businessId={businessData?.id || ''}
                      position={selectedPosition}
                      duration={selectedDuration}
                      price={parseFloat((
                        (selectedPosition === 'top' ? 500 : selectedPosition === 'mid' ? 350 : 250) *
                        (selectedDuration === 'monthly' ? 1 : selectedDuration === 'six_months' ? 6 : 12) *
                        (selectedDuration === 'monthly' ? 1 : 0.95)
                      ).toFixed(2))}
                      bannerTitle={bannerTitle}
                      bannerImageUrl={bannerImageUrl}
                      bannerLinkUrl={bannerLinkUrl}
                      onSuccess={() => {
                        setShowBannerModal(false);
                        setBannerTitle('');
                        setBannerImageUrl('');
                        setBannerLinkUrl('');
                        setPaymentStep('details');
                        alert('Banner purchased successfully! Your banner will be activated shortly.');
                      }}
                      onError={(error) => {
                        alert(`Payment failed: ${error}`);
                      }}
                    />

                    <button
                      onClick={() => setPaymentStep('details')}
                      className="w-full py-3 border-2 border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-all"
                    >
                      Back to Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}