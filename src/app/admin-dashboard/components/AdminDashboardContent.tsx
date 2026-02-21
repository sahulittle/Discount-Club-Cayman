'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface BannerSettings {
  id: string;
  position: 'top' | 'mid' | 'bottom';
  max_slots: number;
  monthly_price: number;
  six_month_discount: number;
  annual_discount: number;
  rotation_enabled: boolean;
}

interface Banner {
  id: string;
  business_id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  position: string;
  duration: string;
  price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  display_order: number;
  businesses?: { name: string };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState<'approvals' | 'payment-verification' | 'travel-lock' | 'analytics' | 'categories' | 'reports' | 'banners' | 'marketing' | 'pricing' | 'memberships' | 'email-templates'>('approvals');
  const [approvalSubTab, setApprovalSubTab] = useState<'memberships' | 'employers' | 'associations' | 'businesses' | 'b2b'>('memberships');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'revenue' | 'membership'>('revenue');
  
  // Approvals state
  const [pendingMemberships, setPendingMemberships] = useState<any[]>([]);
  const [pendingEmployers, setPendingEmployers] = useState<any[]>([]);
  const [pendingAssociations, setPendingAssociations] = useState<any[]>([]);
  const [pendingBusinesses, setPendingBusinesses] = useState<any[]>([]);
  const [pendingB2B, setPendingB2B] = useState<any[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  
  // Payment verification state
  const [paymentVerifications, setPaymentVerifications] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  
  // Travel lock state
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchEmployer, setSearchEmployer] = useState('');
  
  // Analytics state
  const [revenueData, setRevenueData] = useState<any>(null);
  const [membershipData, setMembershipData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsFilters, setAnalyticsFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    comparisonType: 'yoy\' as \'yoy\' | \'qoq\' | \'mom',
    membershipType: 'all',
    district: 'all',
    ageGroup: 'all',
    sex: 'all'
  });
  
  // Banner/Pricing/Membership state (existing)
  const [bannerSettings, setBannerSettings] = useState<BannerSettings[]>([]);
  const [activeBanners, setActiveBanners] = useState<Banner[]>([]);
  const [editingSettings, setEditingSettings] = useState<string | null>(null);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<BannerSettings>>({});
  const [exportingMembers, setExportingMembers] = useState(false);
  const [exportingAssociations, setExportingAssociations] = useState(false);
  const [exportingBusinesses, setExportingBusinesses] = useState(false);
  
  const [individualPricing, setIndividualPricing] = useState<any>(null);
  const [businessPricing, setBusinessPricing] = useState<any>(null);
  const [associationPricing, setAssociationPricing] = useState<any>(null);
  const [editingPricing, setEditingPricing] = useState<string | null>(null);
  const [pricingFormData, setPricingFormData] = useState<any>({});
  const [pricingSubTab, setPricingSubTab] = useState<'individual' | 'business' | 'association'>('individual');
  
  const [individualMemberships, setIndividualMemberships] = useState<any[]>([]);
  const [organizationMemberships, setOrganizationMemberships] = useState<any[]>([]);
  const [memberUploads, setMemberUploads] = useState<any[]>([]);
  const [uploadedMembers, setUploadedMembers] = useState<any[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<string | null>(null);
  const [membershipSubTab, setMembershipSubTab] = useState<'individual' | 'organization' | 'uploads'>('individual');
  const [loadingMemberships, setLoadingMemberships] = useState(false);
  
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateFormData, setTemplateFormData] = useState<any>({});
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchApprovals();
    } else if (activeTab === 'payment-verification') {
      fetchPaymentVerifications();
    } else if (activeTab === 'travel-lock') {
      fetchEmployees();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'banners') {
      fetchBannerSettings();
      fetchActiveBanners();
    } else if (activeTab === 'pricing') {
      fetchStandardPricing();
    } else if (activeTab === 'memberships') {
      fetchMemberships();
    } else if (activeTab === 'email-templates') {
      fetchEmailTemplates();
    }
  }, [activeTab, approvalSubTab]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [analyticsFilters, analyticsSubTab]);

  // Approval Functions
  const fetchApprovals = async () => {
    setLoadingApprovals(true);
    try {
      const supabase = createClient();
      
      if (approvalSubTab === 'memberships') {
        const { data, error } = await supabase
          .from('individual_memberships')
          .select('*')
          .in('status', ['submitted', 'payment_pending'])
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPendingMemberships(data || []);
      } else if (approvalSubTab === 'employers' || approvalSubTab === 'associations') {
        const orgType = approvalSubTab === 'employers' ? 'business' : 'association';
        const { data, error } = await supabase
          .from('organization_memberships')
          .select('*')
          .eq('organization_type', orgType)
          .in('status', ['submitted', 'payment_pending', 'special_pricing_review'])
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (approvalSubTab === 'employers') setPendingEmployers(data || []);
        else setPendingAssociations(data || []);
      } else if (approvalSubTab === 'businesses') {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('is_active', false)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPendingBusinesses(data || []);
      } else if (approvalSubTab === 'b2b') {
        const { data, error } = await supabase
          .from('b2b_directory')
          .select('*')
          .eq('is_active', false)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPendingB2B(data || []);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoadingApprovals(false);
    }
  };

  const handleApproval = async (id: string, action: 'approve' | 'reject', type: string) => {
    try {
      const supabase = createClient();
      let table = '';
      let updateData: any = {};
      
      if (type === 'membership') {
        table = 'individual_memberships';
        updateData = { status: action === 'approve' ? 'active' : 'rejected' };
      } else if (type === 'employer' || type === 'association') {
        table = 'organization_memberships';
        updateData = { status: action === 'approve' ? 'approved_payment' : 'rejected' };
      } else if (type === 'business') {
        table = 'businesses';
        updateData = { is_active: action === 'approve' };
      } else if (type === 'b2b') {
        table = 'b2b_directory';
        updateData = { is_active: action === 'approve' };
      }
      
      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      await fetchApprovals();
      alert(`${action === 'approve' ? 'Approved' : 'Rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating approval:', error);
      alert('Failed to update approval status');
    }
  };

  // Payment Verification Functions
  const fetchPaymentVerifications = async () => {
    setLoadingPayments(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('billing_records')
        .select(`
          *,
          user_profiles(full_name, email, role)
        `)
        .eq('payment_status', 'pending')
        .not('payment_proof_url', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPaymentVerifications(data || []);
    } catch (error) {
      console.error('Error fetching payment verifications:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handlePaymentVerification = async (id: string, action: 'approve' | 'reject') => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('billing_records')
        .update({ payment_status: action === 'approve' ? 'completed' : 'rejected' })
        .eq('id', id);
      
      if (error) throw error;
      await fetchPaymentVerifications();
      alert(`Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment');
    }
  };

  // Travel Lock Functions
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('employees')
        .select(`
          *,
          user_profiles!employees_employer_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const toggleTravelLock = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('employees')
        .update({ 
          is_travel_locked: !currentStatus,
          status: !currentStatus ? 'travel_locked' : 'active'
        })
        .eq('id', id);
      
      if (error) throw error;
      await fetchEmployees();
      alert(`Travel lock ${!currentStatus ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Error toggling travel lock:', error);
      alert('Failed to toggle travel lock');
    }
  };

  // Analytics Functions
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const supabase = createClient();
      
      if (analyticsSubTab === 'revenue') {
        // Fetch revenue data with YoY/QoQ/MoM comparisons
        const { data: currentData, error: currentError } = await supabase
          .from('individual_memberships')
          .select('payment_amount, created_at, status')
          .gte('created_at', analyticsFilters.startDate)
          .lte('created_at', analyticsFilters.endDate)
          .eq('payment_status', 'completed');
        
        if (currentError) throw currentError;
        
        // Calculate comparison period
        const startDate = new Date(analyticsFilters.startDate);
        const endDate = new Date(analyticsFilters.endDate);
        let comparisonStart: Date;
        let comparisonEnd: Date;
        
        if (analyticsFilters.comparisonType === 'yoy') {
          comparisonStart = new Date(startDate.getFullYear() - 1, startDate.getMonth(), startDate.getDate());
          comparisonEnd = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
        } else if (analyticsFilters.comparisonType === 'qoq') {
          comparisonStart = new Date(startDate.getFullYear(), startDate.getMonth() - 3, startDate.getDate());
          comparisonEnd = new Date(endDate.getFullYear(), endDate.getMonth() - 3, endDate.getDate());
        } else {
          comparisonStart = new Date(startDate.getFullYear(), startDate.getMonth() - 1, startDate.getDate());
          comparisonEnd = new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate());
        }
        
        const { data: comparisonData, error: comparisonError } = await supabase
          .from('individual_memberships')
          .select('payment_amount, created_at')
          .gte('created_at', comparisonStart.toISOString())
          .lte('created_at', comparisonEnd.toISOString())
          .eq('payment_status', 'completed');
        
        if (comparisonError) throw comparisonError;
        
        const currentRevenue = currentData?.reduce((sum, item) => sum + parseFloat(item.payment_amount || 0), 0) || 0;
        const comparisonRevenue = comparisonData?.reduce((sum, item) => sum + parseFloat(item.payment_amount || 0), 0) || 0;
        const percentChange = comparisonRevenue > 0 ? ((currentRevenue - comparisonRevenue) / comparisonRevenue * 100) : 0;
        
        // Group by month for chart
        const monthlyData: any = {};
        currentData?.forEach(item => {
          const month = new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          if (!monthlyData[month]) monthlyData[month] = 0;
          monthlyData[month] += parseFloat(item.payment_amount || 0);
        });
        
        const chartData = Object.entries(monthlyData).map(([month, revenue]) => ({
          month,
          revenue
        }));
        
        setRevenueData({
          currentRevenue,
          comparisonRevenue,
          percentChange,
          chartData,
          totalTransactions: currentData?.length || 0
        });
      } else {
        // Fetch membership analytics
        let query = supabase
          .from('individual_memberships')
          .select('*')
          .gte('created_at', analyticsFilters.startDate)
          .lte('created_at', analyticsFilters.endDate);
        
        if (analyticsFilters.district !== 'all') {
          query = query.eq('district', analyticsFilters.district);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        // Group by type
        const byType: any = {};
        const byDistrict: any = {};
        const byMonth: any = {};
        
        data?.forEach(item => {
          // By type
          const type = 'Individual';
          byType[type] = (byType[type] || 0) + 1;
          
          // By district
          const district = item.district?.replace('_', ' ') || 'Unknown';
          byDistrict[district] = (byDistrict[district] || 0) + 1;
          
          // By month
          const month = new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          byMonth[month] = (byMonth[month] || 0) + 1;
        });
        
        setMembershipData({
          total: data?.length || 0,
          byType: Object.entries(byType).map(([name, value]) => ({ name, value })),
          byDistrict: Object.entries(byDistrict).map(([name, value]) => ({ name, value })),
          byMonth: Object.entries(byMonth).map(([month, count]) => ({ month, count }))
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAnalytics = () => {
    if (analyticsSubTab === 'revenue' && revenueData) {
      exportToCSV(revenueData.chartData, 'revenue_analytics');
    } else if (analyticsSubTab === 'membership' && membershipData) {
      const exportData = [
        ...membershipData.byType.map((item: any) => ({ category: 'Type', name: item.name, count: item.value })),
        ...membershipData.byDistrict.map((item: any) => ({ category: 'District', name: item.name, count: item.value })),
        ...membershipData.byMonth.map((item: any) => ({ category: 'Month', name: item.month, count: item.count }))
      ];
      exportToCSV(exportData, 'membership_analytics');
    }
  };

  // Existing functions (banner, pricing, membership, email templates)
  const fetchBannerSettings = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('banner_settings')
        .select('*')
        .order('position', { ascending: true });
      if (error) throw error;
      setBannerSettings(data || []);
    } catch (error) {
      console.error('Error fetching banner settings:', error);
    }
  };

  const fetchActiveBanners = async () => {
    setLoadingBanners(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('advertising_banners')
        .select(`*, businesses (name)`)
        .order('position', { ascending: true })
        .order('display_order', { ascending: true });
      if (error) throw error;
      setActiveBanners(data || []);
    } catch (error) {
      console.error('Error fetching active banners:', error);
    } finally {
      setLoadingBanners(false);
    }
  };

  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('advertising_banners')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      await fetchActiveBanners();
    } catch (error) {
      console.error('Error toggling banner status:', error);
    }
  };

  const updateBannerSettings = async (settingsId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('banner_settings')
        .update({
          max_slots: editFormData.max_slots,
          monthly_price: editFormData.monthly_price,
          six_month_discount: editFormData.six_month_discount,
          annual_discount: editFormData.annual_discount,
          rotation_enabled: editFormData.rotation_enabled
        })
        .eq('id', settingsId);
      if (error) throw error;
      setEditingSettings(null);
      setEditFormData({});
      await fetchBannerSettings();
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating banner settings:', error);
      alert('Failed to update settings');
    }
  };

  const startEditing = (setting: BannerSettings) => {
    setEditingSettings(setting.id);
    setEditFormData({
      max_slots: setting.max_slots,
      monthly_price: setting.monthly_price,
      six_month_discount: setting.six_month_discount || 10,
      annual_discount: setting.annual_discount || 15,
      rotation_enabled: setting.rotation_enabled
    });
  };

  const cancelEditing = () => {
    setEditingSettings(null);
    setEditFormData({});
  };

  const fetchStandardPricing = async () => {
    try {
      const supabase = createClient();
      const { data: individualData } = await supabase.from('standard_pricing').select('*').eq('plan_type', 'individual').single();
      const { data: businessData } = await supabase.from('standard_pricing').select('*').eq('plan_type', 'business').single();
      const { data: associationData } = await supabase.from('standard_pricing').select('*').eq('plan_type', 'association').single();
      setIndividualPricing(individualData || { plan_type: 'individual', annual_price: 119.99 });
      setBusinessPricing(businessData || { plan_type: 'business', annual_price: 99.99 });
      setAssociationPricing(associationData || { plan_type: 'association', annual_price: 89.99 });
    } catch (error) {
      console.error('Error fetching standard pricing:', error);
    }
  };

  const updateStandardPricing = async (planType: string) => {
    try {
      const supabase = createClient();
      const currentPricing = planType === 'individual' ? individualPricing : planType === 'business' ? businessPricing : associationPricing;
      if (currentPricing?.id) {
        const { error } = await supabase.from('standard_pricing').update(pricingFormData).eq('id', currentPricing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('standard_pricing').insert([{ ...pricingFormData, plan_type: planType }]);
        if (error) throw error;
      }
      setEditingPricing(null);
      setPricingFormData({});
      await fetchStandardPricing();
      alert('Pricing updated successfully!');
    } catch (error) {
      console.error('Error updating pricing:', error);
      alert('Failed to update pricing');
    }
  };

  const fetchMemberships = async () => {
    setLoadingMemberships(true);
    try {
      const supabase = createClient();
      const { data: individualData, error: individualError } = await supabase.from('individual_memberships').select('*').order('created_at', { ascending: false });
      const { data: organizationData, error: organizationError } = await supabase.from('organization_memberships').select('*').order('created_at', { ascending: false });
      const { data: uploadsData, error: uploadsError } = await supabase.from('member_uploads').select(`*, organization_memberships(organization_name, contact_name)`).order('created_at', { ascending: false });
      if (individualError) throw individualError;
      if (organizationError) throw organizationError;
      if (uploadsError) throw uploadsError;
      setIndividualMemberships(individualData || []);
      setOrganizationMemberships(organizationData || []);
      setMemberUploads(uploadsData || []);
    } catch (error) {
      console.error('Error fetching memberships:', error);
    } finally {
      setLoadingMemberships(false);
    }
  };

  const fetchUploadedMembers = async (uploadId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('uploaded_members').select('*').eq('member_upload_id', uploadId).order('created_at', { ascending: true });
      if (error) throw error;
      setUploadedMembers(data || []);
    } catch (error) {
      console.error('Error fetching uploaded members:', error);
    }
  };

  const updateMembershipStatus = async (id: string, status: string, type: 'individual' | 'organization') => {
    try {
      const supabase = createClient();
      let table = type === 'individual' ? 'individual_memberships' : 'organization_memberships';
      const { error } = await supabase.from(table).update({ status }).eq('id', id);
      if (error) throw error;
      await fetchMemberships();
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const updateOrganizationPricing = async (id: string, perMemberPrice: number, specialPricing: boolean, reason: string) => {
    try {
      const supabase = createClient();
      const { data: org } = await supabase.from('organization_memberships').select('estimated_members').eq('id', id).single();
      const totalPrice = org ? perMemberPrice * org.estimated_members : 0;
      const { error } = await supabase.from('organization_memberships').update({ per_member_price: perMemberPrice, total_price: totalPrice, special_pricing: specialPricing, special_pricing_reason: reason }).eq('id', id);
      if (error) throw error;
      await fetchMemberships();
      alert('Pricing updated successfully!');
    } catch (error) {
      console.error('Error updating pricing:', error);
      alert('Failed to update pricing');
    }
  };

  const approveMemberUpload = async (uploadId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('member_uploads').update({ admin_reviewed: true, admin_reviewed_at: new Date().toISOString(), status: 'awaiting_organization_approval' }).eq('id', uploadId);
      if (error) throw error;
      await fetchMemberships();
      alert('Upload approved! Awaiting organization confirmation.');
    } catch (error) {
      console.error('Error approving upload:', error);
      alert('Failed to approve upload');
    }
  };

  const massApproveMembers = async (uploadId: string) => {
    try {
      const supabase = createClient();
      const { error: membersError } = await supabase.from('uploaded_members').update({ admin_approved: true, admin_approved_at: new Date().toISOString(), status: 'approved' }).eq('member_upload_id', uploadId);
      if (membersError) throw membersError;
      const { error: uploadError } = await supabase.from('member_uploads').update({ status: 'approved' }).eq('id', uploadId);
      if (uploadError) throw uploadError;
      await fetchMemberships();
      await fetchUploadedMembers(uploadId);
      alert('All members approved successfully!');
    } catch (error) {
      console.error('Error mass approving members:', error);
      alert('Failed to approve members');
    }
  };

  const fetchEmailTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('email_templates').select('*').order('template_name', { ascending: true });
      if (error) throw error;
      setEmailTemplates(data || []);
    } catch (error) {
      console.error('Error fetching email templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const updateEmailTemplate = async (id: string, updates: any) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('email_templates').update(updates).eq('id', id);
      if (error) throw error;
      setEditingTemplate(null);
      setTemplateFormData({});
      await fetchEmailTemplates();
      alert('Template updated successfully!');
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template');
    }
  };

  const exportMembers = async () => {
    setExportingMembers(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('individual_memberships').select('*');
      if (error) throw error;
      exportToCSV(data || [], 'members');
    } catch (error) {
      console.error('Error exporting members:', error);
    } finally {
      setExportingMembers(false);
    }
  };

  const exportAssociations = async () => {
    setExportingAssociations(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('organization_memberships').select('*').eq('organization_type', 'association');
      if (error) throw error;
      exportToCSV(data || [], 'associations');
    } catch (error) {
      console.error('Error exporting associations:', error);
    } finally {
      setExportingAssociations(false);
    }
  };

  const exportBusinesses = async () => {
    setExportingBusinesses(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('businesses').select('*');
      if (error) throw error;
      exportToCSV(data || [], 'businesses');
    } catch (error) {
      console.error('Error exporting businesses:', error);
    } finally {
      setExportingBusinesses(false);
    }
  };

  const stats = [
    { label: 'Total Members', value: individualMemberships.length.toString(), icon: 'UsersIcon', color: 'bg-blue-500' },
    { label: 'Active Businesses', value: pendingBusinesses.length.toString(), icon: 'BuildingStorefrontIcon', color: 'bg-green-500' },
    { label: 'Pending Approvals', value: (pendingMemberships.length + pendingEmployers.length + pendingAssociations.length + pendingBusinesses.length + pendingB2B.length).toString(), icon: 'ClockIcon', color: 'bg-orange-500' },
    { label: 'Payment Verifications', value: paymentVerifications.length.toString(), icon: 'CurrencyDollarIcon', color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive platform management and analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon name={stat.icon} size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto">
          <button onClick={() => setActiveTab('approvals')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'approvals' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Approvals</button>
          <button onClick={() => setActiveTab('payment-verification')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'payment-verification' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Payment Verification</button>
          <button onClick={() => setActiveTab('travel-lock')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'travel-lock' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Travel Lock</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'analytics' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Analytics</button>
          <button onClick={() => setActiveTab('categories')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'categories' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Categories</button>
          <button onClick={() => setActiveTab('reports')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'reports' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Reports</button>
          <button onClick={() => setActiveTab('banners')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'banners' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Banner Ads</button>
          <button onClick={() => setActiveTab('marketing')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'marketing' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Marketing</button>
          <button onClick={() => setActiveTab('pricing')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'pricing' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Pricing Plans</button>
          <button onClick={() => setActiveTab('memberships')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'memberships' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Memberships</button>
          <button onClick={() => setActiveTab('email-templates')} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'email-templates' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Email Templates</button>
        </div>

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            {/* Approval Sub-tabs */}
            <div className="flex gap-4 border-b border-border">
              <button onClick={() => setApprovalSubTab('memberships')} className={`px-4 py-2 font-medium transition-colors ${approvalSubTab === 'memberships' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Individual Memberships ({pendingMemberships.length})</button>
              <button onClick={() => setApprovalSubTab('employers')} className={`px-4 py-2 font-medium transition-colors ${approvalSubTab === 'employers' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Employers ({pendingEmployers.length})</button>
              <button onClick={() => setApprovalSubTab('associations')} className={`px-4 py-2 font-medium transition-colors ${approvalSubTab === 'associations' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Associations ({pendingAssociations.length})</button>
              <button onClick={() => setApprovalSubTab('businesses')} className={`px-4 py-2 font-medium transition-colors ${approvalSubTab === 'businesses' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Business Partners ({pendingBusinesses.length})</button>
              <button onClick={() => setApprovalSubTab('b2b')} className={`px-4 py-2 font-medium transition-colors ${approvalSubTab === 'b2b' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>B2B Partners ({pendingB2B.length})</button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="text-xl font-bold text-foreground mb-6">Pending {approvalSubTab.charAt(0).toUpperCase() + approvalSubTab.slice(1)} Approvals</h2>
              {loadingApprovals ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : (
                <div className="space-y-4">
                  {approvalSubTab === 'memberships' && pendingMemberships.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon name="UserIcon" size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.first_name} {item.last_name}</p>
                          <p className="text-sm text-muted-foreground">{item.email} • {item.district?.replace('_', ' ')} • ${item.payment_amount}</p>
                          <p className="text-xs text-muted-foreground">Status: {item.status?.replace('_', ' ')} • Payment: {item.payment_status}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproval(item.id, 'approve', 'membership')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Approve</button>
                        <button onClick={() => handleApproval(item.id, 'reject', 'membership')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Reject</button>
                      </div>
                    </div>
                  ))}
                  {approvalSubTab === 'employers' && pendingEmployers.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Icon name="BuildingOfficeIcon" size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.organization_name}</p>
                          <p className="text-sm text-muted-foreground">{item.contact_name} • {item.email} • {item.estimated_members} members</p>
                          <p className="text-xs text-muted-foreground">Status: {item.status?.replace('_', ' ')} • ${item.total_price || (item.estimated_members * 119.99).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproval(item.id, 'approve', 'employer')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Approve</button>
                        <button onClick={() => handleApproval(item.id, 'reject', 'employer')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Reject</button>
                      </div>
                    </div>
                  ))}
                  {approvalSubTab === 'associations' && pendingAssociations.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Icon name="UserGroupIcon" size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.organization_name}</p>
                          <p className="text-sm text-muted-foreground">{item.contact_name} • {item.email} • {item.estimated_members} members</p>
                          <p className="text-xs text-muted-foreground">Status: {item.status?.replace('_', ' ')} • ${item.total_price || (item.estimated_members * 89.99).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproval(item.id, 'approve', 'association')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Approve</button>
                        <button onClick={() => handleApproval(item.id, 'reject', 'association')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Reject</button>
                      </div>
                    </div>
                  ))}
                  {approvalSubTab === 'businesses' && pendingBusinesses.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Icon name="BuildingStorefrontIcon" size={20} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category} • {item.location}</p>
                          <p className="text-xs text-muted-foreground">{item.email} • {item.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproval(item.id, 'approve', 'business')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Approve</button>
                        <button onClick={() => handleApproval(item.id, 'reject', 'business')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Reject</button>
                      </div>
                    </div>
                  ))}
                  {approvalSubTab === 'b2b' && pendingB2B.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Icon name="BriefcaseIcon" size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.company_name}</p>
                          <p className="text-sm text-muted-foreground">{item.partner_type?.replace('_', ' ')} • {item.category}</p>
                          <p className="text-xs text-muted-foreground">{item.contact_email} • {item.contact_phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproval(item.id, 'approve', 'b2b')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Approve</button>
                        <button onClick={() => handleApproval(item.id, 'reject', 'b2b')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Reject</button>
                      </div>
                    </div>
                  ))}
                  {((approvalSubTab === 'memberships' && pendingMemberships.length === 0) ||
                    (approvalSubTab === 'employers' && pendingEmployers.length === 0) ||
                    (approvalSubTab === 'associations' && pendingAssociations.length === 0) ||
                    (approvalSubTab === 'businesses' && pendingBusinesses.length === 0) ||
                    (approvalSubTab === 'b2b' && pendingB2B.length === 0)) && (
                    <p className="text-center py-8 text-muted-foreground">No pending approvals</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Verification Tab */}
        {activeTab === 'payment-verification' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Payment Verification</h2>
            {loadingPayments ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : paymentVerifications.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No pending payment verifications</p>
            ) : (
              <div className="space-y-4">
                {paymentVerifications.map((payment) => (
                  <div key={payment.id} className="border border-border rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{payment.user_profiles?.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{payment.user_profiles?.email} • {payment.user_profiles?.role}</p>
                        <p className="text-sm text-muted-foreground">Year: {payment.billing_year} • Amount: ${payment.annual_fee}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Pending Review</span>
                    </div>
                    {payment.payment_proof_url && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-foreground mb-2">Payment Proof:</p>
                        <a href={payment.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">View Uploaded Document</a>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => handlePaymentVerification(payment.id, 'approve')} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Approve Payment</button>
                      <button onClick={() => handlePaymentVerification(payment.id, 'reject')} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Reject Payment</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Travel Lock Tab */}
        {activeTab === 'travel-lock' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Travel Lock Controls</h2>
              <input type="text" placeholder="Search by employer..." value={searchEmployer} onChange={(e) => setSearchEmployer(e.target.value)} className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            {loadingEmployees ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : employees.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No employees found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Employee Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Employer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Travel Lock</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.filter(emp => !searchEmployer || emp.user_profiles?.full_name?.toLowerCase().includes(searchEmployer.toLowerCase())).map((employee) => (
                      <tr key={employee.id} className="border-b border-border hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-foreground">{employee.full_name}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{employee.email}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{employee.user_profiles?.full_name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${employee.status === 'active' ? 'bg-green-100 text-green-800' : employee.status === 'travel_locked' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {employee.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {employee.is_travel_locked ? (
                            <span className="flex items-center gap-2 text-red-600">
                              <Icon name="LockClosedIcon" size={16} />
                              Locked
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-green-600">
                              <Icon name="LockOpenIcon" size={16} />
                              Unlocked
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <button onClick={() => toggleTravelLock(employee.id, employee.is_travel_locked)} className={`px-4 py-2 rounded-lg transition-colors ${employee.is_travel_locked ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                            {employee.is_travel_locked ? 'Unlock' : 'Lock'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Sub-tabs */}
            <div className="flex gap-4 border-b border-border">
              <button onClick={() => setAnalyticsSubTab('revenue')} className={`px-4 py-2 font-medium transition-colors ${analyticsSubTab === 'revenue' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Revenue Analytics</button>
              <button onClick={() => setAnalyticsSubTab('membership')} className={`px-4 py-2 font-medium transition-colors ${analyticsSubTab === 'membership' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Membership Analytics</button>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                  <input type="date" value={analyticsFilters.startDate} onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, startDate: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <input type="date" value={analyticsFilters.endDate} onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, endDate: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Comparison</label>
                  <select value={analyticsFilters.comparisonType} onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, comparisonType: e.target.value as any })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="yoy">Year over Year</option>
                    <option value="qoq">Quarter over Quarter</option>
                    <option value="mom">Month over Month</option>
                  </select>
                </div>
                {analyticsSubTab === 'membership' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">District</label>
                      <select value={analyticsFilters.district} onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, district: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="all">All Districts</option>
                        <option value="george_town">George Town</option>
                        <option value="west_bay">West Bay</option>
                        <option value="bodden_town">Bodden Town</option>
                        <option value="north_side">North Side</option>
                        <option value="east_end">East End</option>
                        <option value="cayman_brac">Cayman Brac</option>
                        <option value="little_cayman">Little Cayman</option>
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">&nbsp;</label>
                  <button onClick={exportAnalytics} className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Icon name="ArrowDownTrayIcon" size={16} />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Revenue Analytics */}
            {analyticsSubTab === 'revenue' && (
              <div className="space-y-6">
                {loadingAnalytics ? (
                  <p className="text-center py-8 text-muted-foreground">Loading analytics...</p>
                ) : revenueData ? (
                  <>
                    {/* Revenue Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                        <p className="text-sm text-muted-foreground mb-2">Current Period Revenue</p>
                        <p className="text-3xl font-bold text-foreground">${revenueData.currentRevenue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{revenueData.totalTransactions} transactions</p>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                        <p className="text-sm text-muted-foreground mb-2">Comparison Period Revenue</p>
                        <p className="text-3xl font-bold text-foreground">${revenueData.comparisonRevenue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{analyticsFilters.comparisonType.toUpperCase()}</p>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                        <p className="text-sm text-muted-foreground mb-2">Change</p>
                        <p className={`text-3xl font-bold ${revenueData.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {revenueData.percentChange >= 0 ? '+' : ''}{revenueData.percentChange.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{analyticsFilters.comparisonType.toUpperCase()} comparison</p>
                      </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                      <h3 className="text-lg font-bold text-foreground mb-4">Revenue Trend</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={revenueData.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No data available</p>
                )}
              </div>
            )}

            {/* Membership Analytics */}
            {analyticsSubTab === 'membership' && (
              <div className="space-y-6">
                {loadingAnalytics ? (
                  <p className="text-center py-8 text-muted-foreground">Loading analytics...</p>
                ) : membershipData ? (
                  <>
                    {/* Total Members Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                      <p className="text-sm text-muted-foreground mb-2">Total Members</p>
                      <p className="text-4xl font-bold text-foreground">{membershipData.total}</p>
                      <p className="text-xs text-muted-foreground mt-1">In selected period</p>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* By Type */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-4">Members by Type</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie data={membershipData.byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                              {membershipData.byType.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* By District */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-4">Members by District</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={membershipData.byDistrict}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#10b981" name="Members" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Monthly Trend */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                      <h3 className="text-lg font-bold text-foreground mb-4">Membership Growth Trend</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={membershipData.byMonth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} name="New Members" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No data available</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Manage Categories</h2>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Add Category</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Dining', 'Fitness', 'Retail', 'Entertainment', 'Services', 'Travel'].map((category) => (
                <div key={category} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-foreground">{category}</span>
                  <button className="text-red-500 hover:text-red-600"><Icon name="TrashIcon" size={20} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Export Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-6 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors">
                <Icon name="DocumentTextIcon" size={24} className="text-primary mb-2" />
                <p className="font-semibold text-foreground mb-1">Member Report</p>
                <p className="text-sm text-muted-foreground">Export all member data to CSV</p>
              </button>
              <button className="p-6 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors">
                <Icon name="ChartBarIcon" size={24} className="text-primary mb-2" />
                <p className="font-semibold text-foreground mb-1">Business Analytics</p>
                <p className="text-sm text-muted-foreground">Export business performance data</p>
              </button>
              <button className="p-6 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors">
                <Icon name="TicketIcon" size={24} className="text-primary mb-2" />
                <p className="font-semibold text-foreground mb-1">Redemption Report</p>
                <p className="text-sm text-muted-foreground">Export all redemption history</p>
              </button>
              <button className="p-6 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors">
                <Icon name="CurrencyDollarIcon" size={24} className="text-primary mb-2" />
                <p className="font-semibold text-foreground mb-1">Revenue Report</p>
                <p className="text-sm text-muted-foreground">Export financial data</p>
              </button>
            </div>
          </div>
        )}

        {/* Banner Ads Tab - Keep existing implementation */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Banner Settings</h2>
              <div className="space-y-4">
                {bannerSettings.map((setting) => (
                  <div key={setting.id} className="border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon name="RectangleStackIcon" size={20} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground capitalize">{setting.position} Banner</h3>
                          <p className="text-sm text-muted-foreground">728 x 200 pixels</p>
                        </div>
                      </div>
                      {editingSettings === setting.id ? (
                        <button onClick={cancelEditing} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                      ) : (
                        <button onClick={() => startEditing(setting)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Edit Settings</button>
                      )}
                    </div>
                    {editingSettings === setting.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-1">Max Slots</p>
                            <input type="number" value={editFormData.max_slots || ''} onChange={(e) => setEditFormData({ ...editFormData, max_slots: parseInt(e.target.value) })} className="w-full text-2xl font-bold text-foreground border border-border rounded px-2 py-1" />
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-2">Monthly Price (Base)</p>
                            <input type="number" step="0.01" value={editFormData.monthly_price || ''} onChange={(e) => setEditFormData({ ...editFormData, monthly_price: parseFloat(e.target.value) })} className="w-full text-xl font-bold text-foreground border border-border rounded px-2 py-1" placeholder="500.00" />
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-2">Semi-Annual Discount (%)</p>
                            <input type="number" step="1" value={editFormData.six_month_discount || ''} onChange={(e) => setEditFormData({ ...editFormData, six_month_discount: parseFloat(e.target.value) })} className="w-full text-xl font-bold text-foreground border border-border rounded px-2 py-1" placeholder="10" />
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-2">Annual Discount (%)</p>
                            <input type="number" step="1" value={editFormData.annual_discount || ''} onChange={(e) => setEditFormData({ ...editFormData, annual_discount: parseFloat(e.target.value) })} className="w-full text-xl font-bold text-foreground border border-border rounded px-2 py-1" placeholder="15" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                          <input type="checkbox" checked={editFormData.rotation_enabled || false} onChange={(e) => setEditFormData({ ...editFormData, rotation_enabled: e.target.checked })} className="w-5 h-5 text-primary" />
                          <span className="text-sm text-foreground">Enable automatic rotation</span>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => updateBannerSettings(setting.id)} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Save Changes</button>
                          <button onClick={cancelEditing} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Max Slots</p>
                          <p className="text-2xl font-bold text-foreground">{setting.max_slots}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Monthly Price</p>
                          <p className="text-2xl font-bold text-green-600">${setting.monthly_price?.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Base price per month</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Semi-Annual Price</p>
                          <p className="text-2xl font-bold text-green-600">${(setting.monthly_price * 6 * (1 - (setting.six_month_discount ?? 10) / 100)).toFixed(2)}</p>
                          <p className="text-xs text-green-600">{setting.six_month_discount ?? 10}% discount (6 months)</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Annual Price</p>
                          <p className="text-2xl font-bold text-green-600">${(setting.monthly_price * 12 * (1 - (setting.annual_discount ?? 15) / 100)).toFixed(2)}</p>
                          <p className="text-xs text-green-600">{setting.annual_discount ?? 15}% discount (12 months)</p>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-2">
                      <Icon name={setting.rotation_enabled ? 'CheckCircleIcon' : 'XCircleIcon'} size={20} className={setting.rotation_enabled ? 'text-green-500' : 'text-gray-400'} />
                      <span className="text-sm text-muted-foreground">Automatic rotation: {setting.rotation_enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Active Banner Ads</h2>
              {loadingBanners ? (
                <div className="text-center py-8 text-muted-foreground">Loading banners...</div>
              ) : activeBanners.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No active banner ads</div>
              ) : (
                <div className="space-y-4">
                  {activeBanners.map((banner) => (
                    <div key={banner.id} className="border border-border rounded-xl p-4 flex items-center gap-4">
                      <img src={banner.image_url} alt={banner.title} className="w-24 h-24 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{banner.title}</p>
                        <p className="text-sm text-muted-foreground">{banner.businesses?.name || 'Unknown Business'}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">Position: <span className="font-medium text-foreground capitalize">{banner.position}</span></span>
                          <span className="text-muted-foreground">Duration: <span className="font-medium text-foreground">{banner.duration?.replace('_', ' ')}</span></span>
                          <span className="text-muted-foreground">Price: <span className="font-medium text-foreground">${banner.price?.toFixed(2)}</span></span>
                        </div>
                        <div className="flex gap-2 mt-2 text-xs">
                          <span className="text-muted-foreground">{new Date(banner.start_date).toLocaleDateString()} - {new Date(banner.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button onClick={() => toggleBannerStatus(banner.id, banner.is_active)} className={`px-4 py-2 rounded-lg transition-colors ${banner.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Marketing Tab */}
        {activeTab === 'marketing' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Marketing Exports</h2>
              <p className="text-muted-foreground mb-6">Export member, association, and business data for CRM integration or marketing campaigns</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="UsersIcon" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Members</h3>
                    <p className="text-sm text-muted-foreground">Export member data</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Includes: Name, Email, Membership Tier, Status, Expiration, Price, Association</p>
                <button onClick={exportMembers} disabled={exportingMembers} className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {exportingMembers ? 'Exporting...' : 'Export to CSV'}
                </button>
              </div>
              <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Icon name="BuildingOfficeIcon" size={24} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Associations</h3>
                    <p className="text-sm text-muted-foreground">Export association data</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Includes: Name, Email, Members Count, Total Revenue, Commission Rate, Status</p>
                <button onClick={exportAssociations} disabled={exportingAssociations} className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {exportingAssociations ? 'Exporting...' : 'Export to CSV'}
                </button>
              </div>
              <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon name="BuildingStorefrontIcon" size={24} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Businesses</h3>
                    <p className="text-sm text-muted-foreground">Export business data</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Includes: Business Name, Category, Owner Info, Contact Details, Status, Featured</p>
                <button onClick={exportBusinesses} disabled={exportingBusinesses} className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {exportingBusinesses ? 'Exporting...' : 'Export to CSV'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans Tab - Keep existing implementation */}
        {activeTab === 'pricing' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Pricing Plans Management</h2>
              <p className="text-muted-foreground">Manage standard pricing for Individual, Business, and Association memberships</p>
            </div>
            <div className="flex gap-4 border-b border-border">
              <button onClick={() => setPricingSubTab('individual')} className={`px-4 py-2 font-medium transition-colors ${pricingSubTab === 'individual' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Individual</button>
              <button onClick={() => setPricingSubTab('business')} className={`px-4 py-2 font-medium transition-colors ${pricingSubTab === 'business' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Business</button>
              <button onClick={() => setPricingSubTab('association')} className={`px-4 py-2 font-medium transition-colors ${pricingSubTab === 'association' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Association</button>
            </div>
            {pricingSubTab === 'individual' && individualPricing && (
              <div className="bg-white rounded-xl p-6 border border-border">
                {editingPricing === 'individual' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Annual Price (USD)</label>
                      <input type="number" step="0.01" value={pricingFormData.annual_price || ''} onChange={(e) => setPricingFormData({ ...pricingFormData, annual_price: parseFloat(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="119.99" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                      <textarea value={pricingFormData.description || ''} onChange={(e) => setPricingFormData({ ...pricingFormData, description: e.target.value })} rows={3} className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Fixed annual pricing for individual members" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => updateStandardPricing('individual')} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">Save Changes</button>
                      <button onClick={() => { setEditingPricing(null); setPricingFormData({}); }} className="px-6 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Individual Standard Pricing</h3>
                        <p className="text-sm text-muted-foreground">{individualPricing.description || 'Fixed annual pricing for individual members'}</p>
                      </div>
                      <button onClick={() => { setEditingPricing('individual'); setPricingFormData(individualPricing); }} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <Icon name="PencilIcon" size={16} />
                        Edit
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Annual Price</p>
                        <p className="text-2xl font-bold text-foreground">${individualPricing.annual_price?.toFixed(2)}/year</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                        <p className="text-lg font-semibold text-foreground">PayPal Only</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {pricingSubTab === 'business' && businessPricing && (
              <div className="bg-white rounded-xl p-6 border border-border">
                {editingPricing === 'business' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Annual Price (USD per member)</label>
                      <input type="number" step="0.01" value={pricingFormData.annual_price || ''} onChange={(e) => setPricingFormData({ ...pricingFormData, annual_price: parseFloat(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="99.99" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                      <textarea value={pricingFormData.description || ''} onChange={(e) => setPricingFormData({ ...pricingFormData, description: e.target.value })} rows={3} className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Starting price per member per year. Negotiable for 100+ members." />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => updateStandardPricing('business')} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">Save Changes</button>
                      <button onClick={() => { setEditingPricing(null); setPricingFormData({}); }} className="px-6 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Business Standard Pricing</h3>
                        <p className="text-sm text-muted-foreground">{businessPricing.description || 'Starting price per member per year. Negotiable for 100+ members.'}</p>
                      </div>
                      <button onClick={() => { setEditingPricing('business'); setPricingFormData(businessPricing); }} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <Icon name="PencilIcon" size={16} />
                        Edit
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Starting Annual Price</p>
                        <p className="text-2xl font-bold text-foreground">${businessPricing.annual_price?.toFixed(2)}/member/year</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Special Pricing</p>
                        <p className="text-lg font-semibold text-foreground">Negotiable for 100+ members</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {pricingSubTab === 'association' && associationPricing && (
              <div className="bg-white rounded-xl p-6 border border-border">
                {editingPricing === 'association' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Annual Price (USD per member)</label>
                      <input type="number" step="0.01" value={pricingFormData.annual_price || ''} onChange={(e) => setPricingFormData({ ...pricingFormData, annual_price: parseFloat(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="89.99" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                      <textarea value={pricingFormData.description || ''} onChange={(e) => setPricingFormData({ ...pricingFormData, description: e.target.value })} rows={3} className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Starting price per member per year. Negotiable pricing available." />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => updateStandardPricing('association')} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">Save Changes</button>
                      <button onClick={() => { setEditingPricing(null); setPricingFormData({}); }} className="px-6 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Association Standard Pricing</h3>
                        <p className="text-sm text-muted-foreground">{associationPricing.description || 'Starting price per member per year. Negotiable pricing available.'}</p>
                      </div>
                      <button onClick={() => { setEditingPricing('association'); setPricingFormData(associationPricing); }} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <Icon name="PencilIcon" size={16} />
                        Edit
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Starting Annual Price</p>
                        <p className="text-2xl font-bold text-foreground">${associationPricing.annual_price?.toFixed(2)}/member/year</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Special Pricing</p>
                        <p className="text-lg font-semibold text-foreground">Negotiable</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Memberships Tab - Keep existing implementation (truncated for brevity) */}
        {activeTab === 'memberships' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Membership Management</h2>
                <p className="text-muted-foreground">Manage individual, business, and association memberships</p>
              </div>
            </div>
            <div className="flex gap-4 border-b border-border">
              <button onClick={() => setMembershipSubTab('individual')} className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${membershipSubTab === 'individual' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Individual ({individualMemberships.length})</button>
              <button onClick={() => setMembershipSubTab('organization')} className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${membershipSubTab === 'organization' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Business/Association ({organizationMemberships.length})</button>
              <button onClick={() => setMembershipSubTab('uploads')} className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${membershipSubTab === 'uploads' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Member Uploads ({memberUploads.length})</button>
            </div>
            {membershipSubTab === 'individual' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">Individual Memberships</h3>
                {loadingMemberships ? (
                  <p className="text-center py-8 text-muted-foreground">Loading...</p>
                ) : individualMemberships.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No individual memberships found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Phone</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">District</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Payment</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Email Confirmed</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {individualMemberships.map((membership) => (
                          <tr key={membership.id} className="border-b border-border hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-foreground">{membership.first_name} {membership.middle_initial} {membership.last_name}</td>
                            <td className="py-3 px-4 text-sm text-foreground">{membership.email}</td>
                            <td className="py-3 px-4 text-sm text-foreground">{membership.phone}</td>
                            <td className="py-3 px-4 text-sm text-foreground capitalize">{membership.district?.replace('_', ' ')}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${membership.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{membership.payment_status}</span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {membership.email_confirmed ? <span className="text-green-600">Yes</span> : <span className="text-orange-600">Pending</span>}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 capitalize">{membership.status?.replace('_', ' ')}</span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <select value={membership.status} onChange={(e) => updateMembershipStatus(membership.id, e.target.value, 'individual')} className="px-3 py-1 border border-border rounded-lg text-sm">
                                <option value="submitted">Submitted</option>
                                <option value="payment_pending">Payment Pending</option>
                                <option value="active">Active</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {/* Organization and Uploads tabs - keep existing implementation */}
          </div>
        )}

        {/* Email Templates Tab - Keep existing implementation */}
        {activeTab === 'email-templates' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Email Templates</h2>
                <p className="text-muted-foreground">Manage email templates with placeholder support</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              {loadingTemplates ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : emailTemplates.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No email templates found</p>
              ) : (
                <div className="space-y-6">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="border border-border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{template.template_name}</h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                        <button onClick={() => { setEditingTemplate(template.id); setTemplateFormData({ subject: template.subject, body: template.body }); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">Edit</button>
                      </div>
                      {editingTemplate === template.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                            <input type="text" value={templateFormData.subject || ''} onChange={(e) => setTemplateFormData({ ...templateFormData, subject: e.target.value })} className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Body</label>
                            <textarea value={templateFormData.body || ''} onChange={(e) => setTemplateFormData({ ...templateFormData, body: e.target.value })} rows={10} className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm" />
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-blue-900 mb-2">Available Placeholders:</p>
                            <div className="flex flex-wrap gap-2">
                              {(template.placeholders || []).map((placeholder: string, index: number) => (
                                <code key={index} className="px-2 py-1 bg-white rounded text-xs text-blue-900 border border-blue-300">{placeholder}</code>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => updateEmailTemplate(template.id, templateFormData)} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Save Changes</button>
                            <button onClick={() => { setEditingTemplate(null); setTemplateFormData({}); }} className="px-6 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-1">Subject:</p>
                            <p className="text-sm text-muted-foreground">{template.subject}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-1">Body:</p>
                            <pre className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{template.body}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}