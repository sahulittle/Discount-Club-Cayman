'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

interface Company {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  qty_employees: number;
  status: string;
  renewal_date: string;
  revenue: number;
  cost: number;
  profit: number;
}

interface Employee {
  id: string;
  employee_name: string;
  email: string;
  phone: string;
  membership_status: string;
  expiry_date: string;
}

export default function AssociationDashboardContent() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'home' | 'companies' | 'revenue' | 'analytics' | 'renewals' | 'export' | 'profile'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Home page state
  const [homeStats, setHomeStats] = useState({
    totalCompanies: 0,
    activeEmployees: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    upcomingRenewals: 0
  });
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<'month' | 'quarter' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sortField, setSortField] = useState<keyof Company>('company_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyEmployees, setCompanyEmployees] = useState<Employee[]>([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  
  // Revenue Summary state
  const [revenueSummary, setRevenueSummary] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0
  });
  const [revenueFilter, setRevenueFilter] = useState<'month' | 'quarter' | 'year' | 'custom'>('month');
  const [revenueBreakdown, setRevenueBreakdown] = useState<any[]>([]);
  
  // Analytics state
  const [analyticsOverview, setAnalyticsOverview] = useState({
    activeEmployees: 0,
    totalCost: 0,
    totalSavings: 0,
    returnMultiple: 0,
    associationProfit: 0
  });
  const [analyticsCompanies, setAnalyticsCompanies] = useState<any[]>([]);
  const [selectedAnalyticsCompany, setSelectedAnalyticsCompany] = useState<any>(null);
  const [showCompanyAnalytics, setShowCompanyAnalytics] = useState(false);
  const [savingsBreakdown, setSavingsBreakdown] = useState<any>(null);
  const [discountsByCategory, setDiscountsByCategory] = useState<any[]>([]);
  const [certificateRedemptions, setCertificateRedemptions] = useState<any[]>([]);
  
  // Renewal Tracking state
  const [renewalCompanies, setRenewalCompanies] = useState<any[]>([]);
  const [renewalFilter, setRenewalFilter] = useState<'30' | '60' | 'expired'>('30');
  
  // Loading states
  const [loading, setLoading] = useState(false);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    
    // Subscribe to member_companies changes
    const companiesChannel = supabase
      .channel('member_companies_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'member_companies',
          filter: `association_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[Real-time] member_companies change detected:', payload);
          toast.success('Company data updated');
          // Refresh data based on active section
          if (activeSection === 'home') {
            fetchHomeData();
          } else if (activeSection === 'companies') {
            fetchCompanies();
          } else if (activeSection === 'revenue') {
            fetchRevenueSummary();
          } else if (activeSection === 'renewals') {
            fetchRenewalData();
          }
        }
      )
      .subscribe();

    // Subscribe to company_analytics changes
    const analyticsChannel = supabase
      .channel('company_analytics_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_analytics',
          filter: `association_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[Real-time] company_analytics change detected:', payload);
          toast.success('Analytics data updated');
          if (activeSection === 'analytics') {
            fetchAnalyticsData();
          }
        }
      )
      .subscribe();

    // Subscribe to savings_by_category changes
    const savingsChannel = supabase
      .channel('savings_by_category_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'savings_by_category'
        },
        (payload) => {
          console.log('[Real-time] savings_by_category change detected:', payload);
          toast.success('Savings data updated');
          if (activeSection === 'analytics' && showCompanyAnalytics && selectedAnalyticsCompany) {
            fetchCompanyAnalyticsDetail(selectedAnalyticsCompany.id);
          }
        }
      )
      .subscribe();

    // Subscribe to certificate_redemptions changes
    const certificatesChannel = supabase
      .channel('certificate_redemptions_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'certificate_redemptions'
        },
        (payload) => {
          console.log('[Real-time] certificate_redemptions change detected:', payload);
          toast.success('Certificate data updated');
          if (activeSection === 'analytics' && showCompanyAnalytics && selectedAnalyticsCompany) {
            fetchCompanyAnalyticsDetail(selectedAnalyticsCompany.id);
          }
        }
      )
      .subscribe();

    // Subscribe to renewal_reminders changes
    const renewalRemindersChannel = supabase
      .channel('renewal_reminders_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'renewal_reminders',
          filter: `association_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[Real-time] renewal_reminders change detected:', payload);
          if (activeSection === 'renewals') {
            fetchRenewalData();
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(companiesChannel);
      supabase.removeChannel(analyticsChannel);
      supabase.removeChannel(savingsChannel);
      supabase.removeChannel(certificatesChannel);
      supabase.removeChannel(renewalRemindersChannel);
    };
  }, [user, activeSection, showCompanyAnalytics, selectedAnalyticsCompany]);

  useEffect(() => {
    if (user) {
      if (activeSection === 'home') {
        fetchHomeData();
      } else if (activeSection === 'companies') {
        fetchCompanies();
      } else if (activeSection === 'revenue') {
        fetchRevenueSummary();
      } else if (activeSection === 'analytics') {
        fetchAnalyticsData();
      } else if (activeSection === 'renewals') {
        fetchRenewalData();
      }
    }
  }, [user, activeSection, dateFilter, revenueFilter, renewalFilter]);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Debug: Log current user info
      console.log('[Association Dashboard] Current user ID:', user?.id);
      console.log('[Association Dashboard] Current user email:', user?.email);
      
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('member_companies')
        .select('*')
        .eq('association_id', user?.id);
      
      // Debug: Log query results
      console.log('[Association Dashboard] Companies query result:', {
        count: companiesData?.length || 0,
        error: companiesError,
        data: companiesData
      });
      
      if (companiesError) throw companiesError;
      
      const totalCompanies = companiesData?.length || 0;
      const activeEmployees = companiesData?.reduce((sum, c) => sum + (c.qty_employees || 0), 0) || 0;
      const totalRevenue = companiesData?.reduce((sum, c) => sum + (parseFloat(c.revenue) || 0), 0) || 0;
      const totalCost = companiesData?.reduce((sum, c) => sum + (parseFloat(c.cost) || 0), 0) || 0;
      const totalProfit = totalRevenue - totalCost;
      
      // Calculate upcoming renewals (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const upcomingRenewals = companiesData?.filter(c => {
        if (!c.renewal_date) return false;
        const renewalDate = new Date(c.renewal_date);
        return renewalDate <= thirtyDaysFromNow && renewalDate >= new Date();
      }).length || 0;
      
      setHomeStats({
        totalCompanies,
        activeEmployees,
        totalRevenue,
        totalCost,
        totalProfit,
        upcomingRenewals
      });
      
      // Generate chart data based on date filter
      const chartData = generateChartData(companiesData || [], dateFilter);
      setRevenueChartData(chartData);
      
    } catch (error) {
      console.error('Error fetching home data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (companiesData: any[], filter: string) => {
    // Mock monthly data for demonstration
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      revenue: Math.random() * 10000 + 5000,
      cost: Math.random() * 7000 + 3000,
      profit: Math.random() * 3000 + 1000
    }));
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('member_companies')
        .select('*')
        .eq('association_id', user?.id)
        .order(sortField, { ascending: sortDirection === 'asc' });
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyEmployees = async (companyId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('company_employees')
        .select('*')
        .eq('company_id', companyId);
      
      if (error) throw error;
      setCompanyEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const handleViewEmployees = async (company: Company) => {
    setSelectedCompany(company);
    await fetchCompanyEmployees(company.id);
    setShowEmployeeModal(true);
  };

  const handleSort = (field: keyof Company) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const fetchRevenueSummary = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: companiesData, error } = await supabase
        .from('member_companies')
        .select('*')
        .eq('association_id', user?.id);
      
      if (error) throw error;
      
      const totalRevenue = companiesData?.reduce((sum, c) => sum + (parseFloat(c.revenue) || 0), 0) || 0;
      const totalCost = companiesData?.reduce((sum, c) => sum + (parseFloat(c.cost) || 0), 0) || 0;
      const totalProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      
      setRevenueSummary({
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin
      });
      
      setRevenueBreakdown(companiesData || []);
    } catch (error) {
      console.error('Error fetching revenue summary:', error);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Fetch company analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('company_analytics')
        .select(`
          *,
          member_companies!inner(
            id,
            company_name,
            qty_employees
          )
        `)
        .eq('association_id', user?.id);
      
      if (analyticsError) throw analyticsError;
      
      // Calculate overview totals
      const activeEmployees = analyticsData?.reduce((sum, a) => sum + (a.member_companies?.qty_employees || 0), 0) || 0;
      const totalCost = analyticsData?.reduce((sum, a) => sum + (parseFloat(a.total_cost) || 0), 0) || 0;
      const totalSavings = analyticsData?.reduce((sum, a) => sum + (parseFloat(a.total_savings) || 0), 0) || 0;
      const returnMultiple = totalCost > 0 ? totalSavings / totalCost : 0;
      
      // Get association profit from companies
      const { data: companiesData } = await supabase
        .from('member_companies')
        .select('profit')
        .eq('association_id', user?.id);
      
      const associationProfit = companiesData?.reduce((sum, c) => sum + (parseFloat(c.profit) || 0), 0) || 0;
      
      setAnalyticsOverview({
        activeEmployees,
        totalCost,
        totalSavings,
        returnMultiple,
        associationProfit
      });
      
      // Format companies data for table
      const formattedCompanies = analyticsData?.map(a => ({
        id: a.member_companies?.id,
        company_name: a.member_companies?.company_name,
        qty_employees: a.member_companies?.qty_employees,
        total_cost: a.total_cost,
        total_savings: a.total_savings,
        return_multiple: parseFloat(a.total_cost) > 0 ? parseFloat(a.total_savings) / parseFloat(a.total_cost) : 0
      })) || [];
      
      setAnalyticsCompanies(formattedCompanies);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyAnalyticsDetail = async (companyId: string) => {
    try {
      const supabase = createClient();
      
      // Fetch company analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('company_analytics')
        .select('*')
        .eq('company_id', companyId)
        .single();
      
      if (analyticsError) throw analyticsError;
      
      // Fetch savings by category
      const { data: savingsData, error: savingsError } = await supabase
        .from('savings_by_category')
        .select('*')
        .eq('company_id', companyId);
      
      if (savingsError) throw savingsError;
      
      // Fetch certificate redemptions
      const { data: certificatesData, error: certificatesError } = await supabase
        .from('certificate_redemptions')
        .select('*')
        .eq('company_id', companyId);
      
      if (certificatesError) throw certificatesError;
      
      setSavingsBreakdown({
        travel: parseFloat(analyticsData.travel_savings) || 0,
        discount: parseFloat(analyticsData.discount_savings) || 0,
        certificate: parseFloat(analyticsData.certificate_savings) || 0
      });
      
      setDiscountsByCategory(savingsData || []);
      setCertificateRedemptions(certificatesData || []);
    } catch (error) {
      console.error('Error fetching company analytics detail:', error);
      toast.error('Failed to load company analytics');
    }
  };

  const handleViewCompanyAnalytics = async (company: any) => {
    setSelectedAnalyticsCompany(company);
    await fetchCompanyAnalyticsDetail(company.id);
    setShowCompanyAnalytics(true);
  };

  const fetchRenewalData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('member_companies')
        .select('*')
        .eq('association_id', user?.id);
      
      if (error) throw error;
      
      // Filter based on renewal filter
      const now = new Date();
      const filtered = data?.filter(c => {
        if (!c.renewal_date) return false;
        const renewalDate = new Date(c.renewal_date);
        const daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (renewalFilter === '30') {
          return daysUntilRenewal > 0 && daysUntilRenewal <= 30;
        } else if (renewalFilter === '60') {
          return daysUntilRenewal > 0 && daysUntilRenewal <= 60;
        } else if (renewalFilter === 'expired') {
          return daysUntilRenewal < 0;
        }
        return false;
      }) || [];
      
      setRenewalCompanies(filtered);
    } catch (error) {
      console.error('Error fetching renewal data:', error);
      toast.error('Failed to load renewal data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (company: any) => {
    try {
      const supabase = createClient();
      await supabase
        .from('renewal_reminders')
        .insert({
          company_id: company.id,
          association_id: user?.id,
          reminder_type: 'renewal',
          sent_to: company.contact_email
        });
      
      toast.success(`Reminder sent to ${company.contact_name}`);
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    }
  };

  const exportToCSV = (data: any[], filename: string, headers?: string[]) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const csvHeaders = headers || Object.keys(data[0]);
    const csvContent = [
      csvHeaders.join(','),
      ...data.map(row => csvHeaders.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const handleExportMembers = () => {
    const exportData = companies.flatMap(company => 
      companyEmployees.map(emp => ({
        company_name: company.company_name,
        employee_name: emp.employee_name,
        email: emp.email,
        phone: emp.phone,
        status: emp.membership_status,
        expiry_date: emp.expiry_date
      }))
    );
    exportToCSV(exportData, 'association_members');
  };

  const exportRevenueToPDF = () => {
    // For now, export as CSV (PDF generation would require additional library)
    exportToCSV(revenueBreakdown, 'revenue_summary', ['company_name', 'qty_employees', 'revenue', 'cost', 'profit']);
  };

  const getReturnMultipleColor = (returnMultiple: number) => {
    if (returnMultiple < 1) return 'text-red-600';
    if (returnMultiple < 2) return 'text-yellow-600';
    if (returnMultiple < 4) return 'text-green-500';
    return 'text-green-700';
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'expiring_soon') return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return 'Active';
    if (status === 'expiring_soon') return 'Expiring Soon';
    return 'Expired';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b border-border fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Icon name="Bars3Icon" size={24} />
            </button>
            <AppImage
              src="/assets/images/DCC_Logo-1770984608226.png"
              alt="Discount Club Cayman"
              width={150}
              height={50}
              className="h-12 w-auto"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Association</p>
            <p className="font-semibold text-foreground">Cayman Islands Chamber</p>
          </div>
        </div>
      </div>

      <div className="flex pt-20">
        {/* Left Sidebar */}
        <div className={`fixed left-0 top-20 bottom-0 w-64 bg-white border-r border-border transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveSection('home')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'home' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-gray-100'
              }`}
            >
              <Icon name="HomeIcon" size={20} />
              <span className="font-medium">Home</span>
            </button>
            
            <button
              onClick={() => setActiveSection('companies')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'companies' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-gray-100'
              }`}
            >
              <Icon name="BuildingOfficeIcon" size={20} />
              <span className="font-medium">Companies</span>
            </button>
            
            <button
              onClick={() => setActiveSection('revenue')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'revenue' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-gray-100'
              }`}
            >
              <Icon name="CurrencyDollarIcon" size={20} />
              <span className="font-medium">Revenue Summary</span>
            </button>
            
            <button
              onClick={() => setActiveSection('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'analytics' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-gray-100'
              }`}
            >
              <Icon name="ChartBarIcon" size={20} />
              <span className="font-medium">Analytics</span>
            </button>
            
            <button
              onClick={() => setActiveSection('renewals')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'renewals' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-gray-100'
              }`}
            >
              <Icon name="ClockIcon" size={20} />
              <span className="font-medium">Renewal Tracking</span>
            </button>
            
            <button
              onClick={handleExportMembers}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-gray-100 transition-colors"
            >
              <Icon name="ArrowDownTrayIcon" size={20} />
              <span className="font-medium">Export Members (CSV)</span>
            </button>
            
            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'profile' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-gray-100'
              }`}
            >
              <Icon name="UserCircleIcon" size={20} />
              <span className="font-medium">Company Profile</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <Icon name="ArrowRightOnRectangleIcon" size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}>
          <div className="p-6">
            {/* HOME SECTION */}
            {activeSection === 'home' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-heading font-bold text-foreground">Overview</h1>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Icon name="BuildingOfficeIcon" size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{homeStats.totalCompanies}</p>
                        <p className="text-sm text-muted-foreground">Total Companies</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <Icon name="UsersIcon" size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{homeStats.activeEmployees}</p>
                        <p className="text-sm text-muted-foreground">Active Employees</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                        <Icon name="CurrencyDollarIcon" size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">${homeStats.totalRevenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                        <Icon name="BanknotesIcon" size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">${homeStats.totalCost.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                        <Icon name="ArrowTrendingUpIcon" size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">${homeStats.totalProfit.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Total Profit</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                        <Icon name="ClockIcon" size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{homeStats.upcomingRenewals}</p>
                        <p className="text-sm text-muted-foreground">Upcoming Renewals (30 Days)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Revenue vs Cost vs Profit Graph */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Revenue vs Cost vs Profit</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDateFilter('month')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          dateFilter === 'month' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-foreground hover:bg-gray-200'
                        }`}
                      >
                        Month
                      </button>
                      <button
                        onClick={() => setDateFilter('quarter')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          dateFilter === 'quarter' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-foreground hover:bg-gray-200'
                        }`}
                      >
                        Quarter
                      </button>
                      <button
                        onClick={() => setDateFilter('year')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          dateFilter === 'year' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-foreground hover:bg-gray-200'
                        }`}
                      >
                        Year
                      </button>
                      <button
                        onClick={() => setDateFilter('custom')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          dateFilter === 'custom' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-foreground hover:bg-gray-200'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                  
                  {dateFilter === 'custom' && (
                    <div className="flex gap-4 mb-6">
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg"
                      />
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg"
                      />
                    </div>
                  )}
                  
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} name="Cost" />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* COMPANIES SECTION */}
            {activeSection === 'companies' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-heading font-bold text-foreground">Companies</h1>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('company_name')}>
                            Company Name {sortField === 'company_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('contact_name')}>
                            Contact Name {sortField === 'contact_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Phone</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('qty_employees')}>
                            Qty Employees {sortField === 'qty_employees' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('status')}>
                            Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('renewal_date')}>
                            Renewal Date {sortField === 'renewal_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</td>
                          </tr>
                        ) : companies.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-muted-foreground">No companies found</td>
                          </tr>
                        ) : (
                          companies.map((company) => (
                            <tr key={company.id} className="border-b border-border hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleViewEmployees(company)}
                                  className="text-primary hover:underline font-medium"
                                >
                                  {company.company_name}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-foreground">{company.contact_name}</td>
                              <td className="py-3 px-4 text-foreground">{company.contact_email}</td>
                              <td className="py-3 px-4 text-foreground">{company.contact_phone}</td>
                              <td className="py-3 px-4 text-foreground">{company.qty_employees}</td>
                              <td className="py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(company.status)}`}>
                                  {getStatusLabel(company.status)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-foreground">
                                {company.renewal_date ? new Date(company.renewal_date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleViewEmployees(company)}
                                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                  View Employees
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* REVENUE SUMMARY SECTION */}
            {activeSection === 'revenue' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-heading font-bold text-foreground">Revenue Summary (P&L)</h1>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
                    <p className="text-3xl font-bold text-foreground">${revenueSummary.totalRevenue.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Total Cost</p>
                    <p className="text-3xl font-bold text-foreground">${revenueSummary.totalCost.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Total Profit</p>
                    <p className="text-3xl font-bold text-green-600">${revenueSummary.totalProfit.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Profit Margin %</p>
                    <p className="text-3xl font-bold text-foreground">{revenueSummary.profitMargin.toFixed(1)}%</p>
                  </div>
                </div>
                
                {/* Date Filters */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setRevenueFilter('month')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      revenueFilter === 'month' ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-foreground hover:bg-gray-50'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setRevenueFilter('quarter')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      revenueFilter === 'quarter' ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-foreground hover:bg-gray-50'
                    }`}
                  >
                    This Quarter
                  </button>
                  <button
                    onClick={() => setRevenueFilter('year')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      revenueFilter === 'year' ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-foreground hover:bg-gray-50'
                    }`}
                  >
                    This Year
                  </button>
                  <button
                    onClick={() => setRevenueFilter('custom')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      revenueFilter === 'custom' ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-foreground hover:bg-gray-50'
                    }`}
                  >
                    Custom Range
                  </button>
                </div>
                
                {/* Breakdown Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Breakdown by Company</h2>
                    <button
                      onClick={exportRevenueToPDF}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Export to PDF
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Company Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Qty Employees</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Revenue</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Cost</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</td>
                          </tr>
                        ) : revenueBreakdown.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground">No data available</td>
                          </tr>
                        ) : (
                          revenueBreakdown.map((company) => (
                            <tr key={company.id} className="border-b border-border hover:bg-gray-50">
                              <td className="py-3 px-4 text-foreground font-medium">{company.company_name}</td>
                              <td className="py-3 px-4 text-foreground">{company.qty_employees}</td>
                              <td className="py-3 px-4 text-foreground">${parseFloat(company.revenue || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-foreground">${parseFloat(company.cost || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-green-600 font-semibold">${parseFloat(company.profit || 0).toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ANALYTICS SECTION */}
            {activeSection === 'analytics' && !showCompanyAnalytics && (
              <div className="space-y-6">
                <h1 className="text-3xl font-heading font-bold text-foreground">Analytics (Usage + Savings + ROI)</h1>
                
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Total Active Employees</p>
                    <p className="text-3xl font-bold text-foreground">{analyticsOverview.activeEmployees}</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Total Cost</p>
                    <p className="text-3xl font-bold text-foreground">${analyticsOverview.totalCost.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Total Savings</p>
                    <p className="text-3xl font-bold text-foreground">${analyticsOverview.totalSavings.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border col-span-1 md:col-span-2 lg:col-span-1">
                    <p className="text-sm text-muted-foreground mb-2">Return Multiple</p>
                    <p className={`text-4xl font-bold ${getReturnMultipleColor(analyticsOverview.returnMultiple)}`}>
                      {analyticsOverview.totalCost > 0 ? `${analyticsOverview.returnMultiple.toFixed(1)}× Return` : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Association Profit</p>
                    <p className="text-3xl font-bold text-green-600">${analyticsOverview.associationProfit.toFixed(2)}</p>
                  </div>
                </div>
                
                {/* Company Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                  <h2 className="text-xl font-bold text-foreground mb-6">Company Analytics</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Company Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Qty</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Cost</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Savings</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Return</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td>
                          </tr>
                        ) : analyticsCompanies.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-muted-foreground">No data available</td>
                          </tr>
                        ) : (
                          analyticsCompanies.map((company) => (
                            <tr key={company.id} className="border-b border-border hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleViewCompanyAnalytics(company)}
                                  className="text-primary hover:underline font-medium"
                                >
                                  {company.company_name}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-foreground">{company.qty_employees}</td>
                              <td className="py-3 px-4 text-foreground">${parseFloat(company.total_cost || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-foreground">${parseFloat(company.total_savings || 0).toFixed(2)}</td>
                              <td className="py-3 px-4">
                                <span className={`font-bold ${getReturnMultipleColor(company.return_multiple)}`}>
                                  {company.return_multiple > 0 ? `${company.return_multiple.toFixed(1)}×` : 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleViewCompanyAnalytics(company)}
                                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* COMPANY ANALYTICS DETAIL */}
            {activeSection === 'analytics' && showCompanyAnalytics && selectedAnalyticsCompany && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowCompanyAnalytics(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Icon name="ArrowLeftIcon" size={24} />
                  </button>
                  <h1 className="text-3xl font-heading font-bold text-foreground">{selectedAnalyticsCompany.company_name} Analytics</h1>
                </div>
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Total Cost</p>
                    <p className="text-3xl font-bold text-foreground">${parseFloat(selectedAnalyticsCompany.total_cost || 0).toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Total Savings</p>
                    <p className="text-3xl font-bold text-foreground">${parseFloat(selectedAnalyticsCompany.total_savings || 0).toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border col-span-1 md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-2">Return Multiple</p>
                    <p className={`text-5xl font-bold ${getReturnMultipleColor(selectedAnalyticsCompany.return_multiple)}`}>
                      {selectedAnalyticsCompany.return_multiple > 0 ? `${selectedAnalyticsCompany.return_multiple.toFixed(1)}× Return` : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {/* Savings Breakdown by Channel */}
                {savingsBreakdown && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <h2 className="text-xl font-bold text-foreground mb-6">Savings Breakdown by Channel</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-2">Travel Savings</p>
                        <p className="text-2xl font-bold text-foreground">${savingsBreakdown.travel.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {((savingsBreakdown.travel / (savingsBreakdown.travel + savingsBreakdown.discount + savingsBreakdown.certificate)) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-2">Discount Savings</p>
                        <p className="text-2xl font-bold text-foreground">${savingsBreakdown.discount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {((savingsBreakdown.discount / (savingsBreakdown.travel + savingsBreakdown.discount + savingsBreakdown.certificate)) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-2">Certificate Redemptions</p>
                        <p className="text-2xl font-bold text-foreground">${savingsBreakdown.certificate.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {((savingsBreakdown.certificate / (savingsBreakdown.travel + savingsBreakdown.discount + savingsBreakdown.certificate)) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Discounts by Category */}
                {discountsByCategory.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <h2 className="text-xl font-bold text-foreground mb-6">Discounts - Savings by Category</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Total Savings</th>
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Redemption Count</th>
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Avg Savings per Redemption</th>
                          </tr>
                        </thead>
                        <tbody>
                          {discountsByCategory.map((cat, index) => (
                            <tr key={index} className="border-b border-border hover:bg-gray-50">
                              <td className="py-3 px-4 text-foreground font-medium">{cat.category}</td>
                              <td className="py-3 px-4 text-foreground">${parseFloat(cat.total_savings || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-foreground">{cat.redemption_count}</td>
                              <td className="py-3 px-4 text-foreground">${parseFloat(cat.avg_savings_per_redemption || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Certificate Redemptions by Category */}
                {certificateRedemptions.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <h2 className="text-xl font-bold text-foreground mb-6">Certificate Redemptions by Category</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Redeemed Value</th>
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Redemption Count</th>
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Avg Value per Redemption</th>
                          </tr>
                        </thead>
                        <tbody>
                          {certificateRedemptions.map((cert, index) => (
                            <tr key={index} className="border-b border-border hover:bg-gray-50">
                              <td className="py-3 px-4 text-foreground font-medium">{cert.category}</td>
                              <td className="py-3 px-4 text-foreground">${parseFloat(cert.redeemed_value || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-foreground">{cert.redemption_count}</td>
                              <td className="py-3 px-4 text-foreground">${parseFloat(cert.avg_value_per_redemption || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RENEWAL TRACKING SECTION */}
            {activeSection === 'renewals' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-heading font-bold text-foreground">Renewal Tracking</h1>
                
                {/* Filters */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setRenewalFilter('30')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      renewalFilter === '30' ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-foreground hover:bg-gray-50'
                    }`}
                  >
                    Expiring in 30 Days
                  </button>
                  <button
                    onClick={() => setRenewalFilter('60')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      renewalFilter === '60' ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-foreground hover:bg-gray-50'
                    }`}
                  >
                    Expiring in 60 Days
                  </button>
                  <button
                    onClick={() => setRenewalFilter('expired')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      renewalFilter === 'expired' ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-foreground hover:bg-gray-50'
                    }`}
                  >
                    Expired
                  </button>
                </div>
                
                {/* Renewal Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Company Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Contact Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Phone</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Qty Employees</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Renewal Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</td>
                          </tr>
                        ) : renewalCompanies.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-muted-foreground">No companies found</td>
                          </tr>
                        ) : (
                          renewalCompanies.map((company) => (
                            <tr key={company.id} className="border-b border-border hover:bg-gray-50">
                              <td className="py-3 px-4 text-foreground font-medium">{company.company_name}</td>
                              <td className="py-3 px-4 text-foreground">{company.contact_name}</td>
                              <td className="py-3 px-4 text-foreground">{company.contact_email}</td>
                              <td className="py-3 px-4 text-foreground">{company.contact_phone}</td>
                              <td className="py-3 px-4 text-foreground">{company.qty_employees}</td>
                              <td className="py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(company.status)}`}>
                                  {getStatusLabel(company.status)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-foreground">
                                {company.renewal_date ? new Date(company.renewal_date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleSendReminder(company)}
                                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                  Send Reminder
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* COMPANY PROFILE SECTION */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-heading font-bold text-foreground">Company Profile</h1>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                  <p className="text-center py-12 text-muted-foreground">Company profile management coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Modal */}
      {showEmployeeModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">{selectedCompany.company_name} - Employees</h2>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icon name="XMarkIcon" size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Employee Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Membership Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">No employees found</td>
                      </tr>
                    ) : (
                      companyEmployees.map((employee) => (
                        <tr key={employee.id} className="border-b border-border hover:bg-gray-50">
                          <td className="py-3 px-4 text-foreground">{employee.employee_name}</td>
                          <td className="py-3 px-4 text-foreground">{employee.email}</td>
                          <td className="py-3 px-4 text-foreground">{employee.phone}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(employee.membership_status)}`}>
                              {getStatusLabel(employee.membership_status)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-foreground">
                            {employee.expiry_date ? new Date(employee.expiry_date).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}