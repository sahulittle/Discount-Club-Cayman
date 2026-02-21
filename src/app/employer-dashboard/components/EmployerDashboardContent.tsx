'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function EmployerDashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'directory' | 'employees' | 'seats' | 'analytics'>('directory');
  
  // B2B Directory state
  const [directory, setDirectory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  
  // Employee roster state
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  // Seat management state
  const [companyMemberships, setCompanyMemberships] = useState<any[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    if (user) {
      if (activeTab === 'directory') {
        fetchDirectory();
      } else if (activeTab === 'employees') {
        fetchEmployees();
      } else if (activeTab === 'seats') {
        fetchSeats();
      } else if (activeTab === 'analytics') {
        fetchAnalytics();
      }
    }
  }, [user, activeTab]);

  const fetchDirectory = async () => {
    setLoadingDirectory(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('b2b_directory')
        .select('*')
        .eq('is_active', true)
        .order('company_name', { ascending: true });
      
      if (error) throw error;
      setDirectory(data || []);
    } catch (error) {
      console.error('Error fetching directory:', error);
      toast.error('Failed to load B2B directory');
    } finally {
      setLoadingDirectory(false);
    }
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employer_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchSeats = async () => {
    setLoadingSeats(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('company_memberships')
        .select('*')
        .eq('employer_id', user?.id)
        .order('membership_year', { ascending: false });
      
      if (error) throw error;
      setCompanyMemberships(data || []);
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Failed to load seat management data');
    } finally {
      setLoadingSeats(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const supabase = createClient();
      
      // Fetch analytics tracking data for this employer's employees
      const { data: employeeIds } = await supabase
        .from('employees')
        .select('id')
        .eq('employer_id', user?.id);
      
      if (!employeeIds || employeeIds.length === 0) {
        setAnalyticsData({
          totalSavings: 0,
          savingsByCategory: [],
          usageByType: [],
          monthlyTrend: []
        });
        setLoadingAnalytics(false);
        return;
      }
      
      const employeeIdList = employeeIds.map(e => e.id);
      
      const { data: analyticsRecords, error } = await supabase
        .from('analytics_tracking')
        .select('*')
        .in('user_id', employeeIdList);
      
      if (error) throw error;
      
      // Calculate total savings
      const totalSavings = analyticsRecords?.reduce((sum, record) => sum + (record.savings_amount || 0), 0) || 0;
      
      // Group by category
      const categoryMap: any = {};
      analyticsRecords?.forEach(record => {
        const category = record.category || 'Other';
        categoryMap[category] = (categoryMap[category] || 0) + (record.savings_amount || 0);
      });
      const savingsByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
      
      // Group by event type (usage type)
      const typeMap: any = {};
      analyticsRecords?.forEach(record => {
        const type = record.event_type || 'Other';
        typeMap[type] = (typeMap[type] || 0) + 1;
      });
      const usageByType = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
      
      // Group by month for trend
      const monthMap: any = {};
      analyticsRecords?.forEach(record => {
        const month = new Date(record.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthMap[month] = (monthMap[month] || 0) + (record.savings_amount || 0);
      });
      const monthlyTrend = Object.entries(monthMap).map(([month, savings]) => ({ month, savings }));
      
      setAnalyticsData({
        totalSavings,
        savingsByCategory,
        usageByType,
        monthlyTrend
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleToggleTravelLock = async (employeeId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('employees')
        .update({ 
          is_travel_locked: !currentStatus,
          status: !currentStatus ? 'travel_locked' : 'active'
        })
        .eq('id', employeeId);
      
      if (error) throw error;
      toast.success(`Travel lock ${!currentStatus ? 'enabled' : 'disabled'}`);
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle travel lock');
    }
  };

  const handleDeactivateEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to deactivate this employee?')) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('employees')
        .update({ status: 'inactive' })
        .eq('id', employeeId);
      
      if (error) throw error;
      toast.success('Employee deactivated');
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate employee');
    }
  };

  const filteredDirectory = directory.filter(item => {
    const matchesSearch = item.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(directory.map(item => item.category).filter(Boolean)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-24 pb-12">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Employer Dashboard</h1>
          <p className="text-muted-foreground">Manage your company memberships and employee benefits</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'directory' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            B2B Directory
            {activeTab === 'directory' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'employees' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Employees
            {activeTab === 'employees' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('seats')}
            className={`px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'seats' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Seat Management
            {activeTab === 'seats' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'analytics' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Analytics
            {activeTab === 'analytics' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* B2B Directory Tab */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                  <div className="relative">
                    <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search companies..."
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Directory Grid */}
            {loadingDirectory ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredDirectory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDirectory.map((item) => (
                  <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 mb-4 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {item.logo_url ? (
                          <AppImage src={item.logo_url} alt={item.company_name} width={96} height={96} className="object-contain" />
                        ) : (
                          <Icon name="BuildingOfficeIcon" size={48} className="text-gray-400" />
                        )}
                      </div>
                      <h3 className="font-bold text-foreground mb-2">{item.company_name}</h3>
                      {item.category && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-2">
                          {item.category}
                        </span>
                      )}
                      {item.partner_type && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full mb-2">
                          {item.partner_type}
                        </span>
                      )}
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-border text-center">
                <Icon name="BuildingOfficeIcon" size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground">No companies found</p>
              </div>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Employee Roster</h2>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <Icon name="PlusIcon" size={20} />
                  Upload Employees
                </button>
              </div>

              {loadingEmployees ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : employees.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Travel Lock</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.id} className="border-b border-border hover:bg-gray-50">
                          <td className="py-4 px-4 text-foreground">{employee.full_name}</td>
                          <td className="py-4 px-4 text-muted-foreground">{employee.email}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              employee.status === 'active' ? 'bg-green-100 text-green-700' :
                              employee.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              employee.status === 'travel_locked'? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {employee.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {employee.is_travel_locked ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                <Icon name="LockClosedIcon" size={14} />
                                Locked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <Icon name="LockOpenIcon" size={14} />
                                Unlocked
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleTravelLock(employee.id, employee.is_travel_locked)}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                {employee.is_travel_locked ? 'Unlock' : 'Lock'}
                              </button>
                              <button
                                onClick={() => handleDeactivateEmployee(employee.id)}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                Deactivate
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="UsersIcon" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">No employees found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Seat Management Tab */}
        {activeTab === 'seats' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Seat Management</h2>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Icon name="ShoppingCartIcon" size={20} />
                    Buy Memberships
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <Icon name="ArrowUpTrayIcon" size={20} />
                    Upload Employees
                  </button>
                </div>
              </div>

              {loadingSeats ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : companyMemberships.length > 0 ? (
                <div className="space-y-4">
                  {companyMemberships.map((membership) => (
                    <div key={membership.id} className="p-6 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">Membership Year {membership.membership_year}</h3>
                          <p className="text-sm text-muted-foreground">Expires: {new Date(membership.expiry_date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          membership.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {membership.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Seats Purchased</p>
                          <p className="text-3xl font-bold text-foreground">{membership.seats_purchased}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Seats Assigned</p>
                          <p className="text-3xl font-bold text-primary">{membership.seats_assigned}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Available Seats</p>
                          <p className="text-3xl font-bold text-green-600">{membership.seats_purchased - membership.seats_assigned}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="TicketIcon" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground mb-4">No memberships found</p>
                  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Purchase Your First Membership
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="text-xl font-bold text-foreground mb-6">Employee Savings Analytics</h2>

              {loadingAnalytics ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : analyticsData ? (
                <div className="space-y-6">
                  {/* Total Savings Card */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
                    <p className="text-sm opacity-90 mb-2">Total Employee Savings</p>
                    <p className="text-5xl font-bold">${analyticsData.totalSavings.toFixed(2)}</p>
                    <p className="text-sm opacity-75 mt-2">Across all employees and categories</p>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Savings by Category */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                      <h3 className="text-lg font-bold text-foreground mb-4">Savings by Category</h3>
                      {analyticsData.savingsByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analyticsData.savingsByCategory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                            <Bar dataKey="value" fill="#3b82f6" name="Savings" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center py-12 text-muted-foreground">No category data available</p>
                      )}
                    </div>

                    {/* Usage Type Pie Chart */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                      <h3 className="text-lg font-bold text-foreground mb-4">Usage Type Distribution</h3>
                      {analyticsData.usageByType.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie 
                              data={analyticsData.usageByType} 
                              dataKey="value" 
                              nameKey="name" 
                              cx="50%" 
                              cy="50%" 
                              outerRadius={100} 
                              label
                            >
                              {analyticsData.usageByType.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center py-12 text-muted-foreground">No usage data available</p>
                      )}
                    </div>
                  </div>

                  {/* Monthly Savings Trend */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-border">
                    <h3 className="text-lg font-bold text-foreground mb-4">Monthly Savings Trend</h3>
                    {analyticsData.monthlyTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData.monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                          <Legend />
                          <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} name="Savings" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center py-12 text-muted-foreground">No trend data available</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="ChartBarIcon" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">No analytics data available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}