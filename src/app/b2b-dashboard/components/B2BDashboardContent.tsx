'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import toast, { Toaster } from 'react-hot-toast';

export default function B2BDashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'directory' | 'profile' | 'campaigns' | 'advertising' | 'billing'>('directory');
  const [directory, setDirectory] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [campaignForm, setCampaignForm] = useState({
    campaign_name: '',
    subject: '',
    html_body: '',
    recipient_type: 'employers'
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient();

      // Fetch B2B Directory
      const { data: directoryData } = await supabase
        .from('b2b_directory')
        .select('*')
        .eq('is_active', true)
        .order('company_name', { ascending: true });
      setDirectory(directoryData || []);

      // Fetch Email Campaigns
      const { data: campaignsData } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('sender_id', user?.id)
        .order('created_at', { ascending: false });
      setCampaigns(campaignsData || []);

      // Fetch Billing
      const { data: billingData } = await supabase
        .from('billing_records')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      setBilling(billingData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignForm.campaign_name || !campaignForm.subject || !campaignForm.html_body) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from('email_campaigns').insert({
        sender_id: user?.id,
        ...campaignForm,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success('Campaign sent successfully!');
      setCampaignForm({ campaign_name: '', subject: '', html_body: '', recipient_type: 'employers' });
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send campaign');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-24 pb-12">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">B2B Business Partner Dashboard</h1>
          <p className="text-muted-foreground">Manage your B2B partnerships and communications</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
          {[
            { key: 'directory', label: 'Directory', icon: 'BuildingOffice2Icon' },
            { key: 'profile', label: 'My Profile', icon: 'UserCircleIcon' },
            { key: 'campaigns', label: 'Email Campaigns', icon: 'EnvelopeIcon' },
            { key: 'advertising', label: 'Advertising', icon: 'MegaphoneIcon' },
            { key: 'billing', label: 'Billing', icon: 'CreditCardIcon' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={20} />
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Directory Tab */}
        {activeTab === 'directory' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">B2B Directory</h2>
              <p className="text-muted-foreground">Connect with employers, business partners, and associations</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {directory.map((partner) => (
                <div key={partner.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition-all text-center">
                  {partner.logo_url ? (
                    <AppImage
                      src={partner.logo_url}
                      alt={partner.company_name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-contain mx-auto mb-4 rounded-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon name="BuildingOffice2Icon" size={40} className="text-primary" />
                    </div>
                  )}
                  <h3 className="font-bold text-foreground mb-1">{partner.company_name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{partner.partner_type}</p>
                  {partner.category && (
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {partner.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Create Email Campaign</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignForm.campaign_name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, campaign_name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Monthly Newsletter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject Line</label>
                  <input
                    type="text"
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Exclusive B2B Opportunities"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Recipients</label>
                  <select
                    value={campaignForm.recipient_type}
                    onChange={(e) => setCampaignForm({ ...campaignForm, recipient_type: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="employers">Employers</option>
                    <option value="business_partners">Business Partners</option>
                    <option value="associations">Associations</option>
                    <option value="all">All B2B Partners</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Content (HTML)</label>
                  <textarea
                    value={campaignForm.html_body}
                    onChange={(e) => setCampaignForm({ ...campaignForm, html_body: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-64"
                    placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                  />
                </div>
                <button
                  onClick={handleSendCampaign}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Send Campaign
                </button>
              </div>
            </div>

            {/* Campaign History */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Campaign History</h2>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-foreground">{campaign.campaign_name}</h3>
                      <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sent to {campaign.recipient_type} • {campaign.sent_count || 0} recipients
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        campaign.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Annual Billing</h2>
              {billing ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <p className="text-sm text-muted-foreground mb-2">Billing Year</p>
                      <p className="text-3xl font-bold text-foreground">{billing.billing_year}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6">
                      <p className="text-sm text-muted-foreground mb-2">Annual Fee</p>
                      <p className="text-3xl font-bold text-foreground">${billing.annual_fee}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-6">
                      <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        billing.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {billing.payment_status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-sm text-muted-foreground mb-2">Renewal Date</p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Date(billing.renewal_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  {billing.payment_status !== 'paid' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                      <h3 className="font-bold text-foreground mb-4">Upload Payment Proof</h3>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="w-full px-4 py-2 border border-border rounded-lg"
                      />
                      <button className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                        Submit Payment Proof
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="CreditCardIcon" size={64} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No billing records found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">My Profile</h2>
            <p className="text-muted-foreground">Profile management coming soon</p>
          </div>
        )}

        {/* Advertising Tab */}
        {activeTab === 'advertising' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Advertising</h2>
            <p className="text-muted-foreground">Advertising management coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}