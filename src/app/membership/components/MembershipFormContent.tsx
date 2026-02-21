'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import Link from 'next/link';

interface IndividualFormData {
  firstName: string;
  lastName: string;
  middleInitial: string;
  phone: string;
  email: string;
  district: string;
}

interface OrganizationFormData {
  contactName: string;
  organizationType: 'business' | 'association';
  organizationName: string;
  email: string;
  phone: string;
  estimatedMembers: string;
  meetingRequested: boolean;
}

export default function MembershipFormContent() {
  const [membershipType, setMembershipType] = useState<'individual' | 'business' | 'association'>('individual');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [individualForm, setIndividualForm] = useState<IndividualFormData>({
    firstName: '',
    lastName: '',
    middleInitial: '',
    phone: '',
    email: '',
    district: ''
  });

  const [organizationForm, setOrganizationForm] = useState<OrganizationFormData>({
    contactName: '',
    organizationType: 'business',
    organizationName: '',
    email: '',
    phone: '',
    estimatedMembers: '',
    meetingRequested: false
  });

  const [currentMembershipId, setCurrentMembershipId] = useState<string | null>(null);

  const districts = [
    { value: 'george_town', label: 'George Town' },
    { value: 'west_bay', label: 'West Bay' },
    { value: 'bodden_town', label: 'Bodden Town' },
    { value: 'north_side', label: 'North Side' },
    { value: 'east_end', label: 'East End' },
    { value: 'cayman_brac', label: 'Cayman Brac' },
    { value: 'little_cayman', label: 'Little Cayman' }
  ];

  const validateIndividualForm = () => {
    if (!individualForm.firstName || !individualForm.lastName || !individualForm.phone || 
        !individualForm.email || !individualForm.district) {
      setError('All fields are required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(individualForm.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateOrganizationForm = () => {
    if (!organizationForm.contactName || !organizationForm.organizationName || 
        !organizationForm.email || !organizationForm.phone || !organizationForm.estimatedMembers) {
      setError('All fields are required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizationForm.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (parseInt(organizationForm.estimatedMembers) < 1) {
      setError('Please enter a valid number of members');
      return false;
    }
    return true;
  };

  const handleIndividualNext = () => {
    setError('');
    if (validateIndividualForm()) {
      setStep(2);
    }
  };

  const handleOrganizationSubmit = async () => {
    setError('');
    setSuccess('');
    
    if (!validateOrganizationForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/memberships/submit-organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: organizationForm.contactName,
          organizationType: organizationForm.organizationType,
          organizationName: organizationForm.organizationName,
          email: organizationForm.email,
          phone: organizationForm.phone,
          estimatedMembers: parseInt(organizationForm.estimatedMembers),
          meetingRequested: organizationForm.meetingRequested
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess(data.message);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const createIndividualOrder = async () => {
    try {
      const response = await fetch('/api/paypal/create-membership-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: individualForm.firstName,
          lastName: individualForm.lastName,
          middleInitial: individualForm.middleInitial,
          phone: individualForm.phone,
          email: individualForm.email,
          district: individualForm.district
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order');
      
      setCurrentMembershipId(data.membershipId);
      return data.orderId;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const onIndividualApprove = async (data: any) => {
    try {
      const response = await fetch('/api/paypal/capture-membership-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to capture payment');

      setSuccess(result.message);
      setStep(3);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16 md:py-24">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-100"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-[#1C4D8D] font-semibold text-sm mb-6 shadow-sm">
            <Icon name="SparklesIcon" size={16} />
            Join the Club
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Join Discount Club Cayman
          </h1>
          <p className="text-xl text-slate-600">Choose your membership type and start saving today</p>
        </div>

        {/* Membership Type Selection */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl animate-fade-up animation-delay-100">
            <h2 className="font-heading text-2xl font-bold text-slate-900 mb-8 text-center md:text-left">
              Select Membership Type
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <button
                onClick={() => setMembershipType('individual')}
                className={`group relative p-6 border-2 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 ${
                  membershipType === 'individual' ?'border-[#1C4D8D] bg-[#1C4D8D]/5 shadow-md ring-1 ring-[#1C4D8D]/20' :'border-slate-100 hover:border-[#1C4D8D]/30 hover:shadow-lg bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">Individual</h3>
                    <p className="text-sm text-slate-500 mt-1">Personal membership</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${membershipType === 'individual' ? 'border-[#1C4D8D] bg-[#1C4D8D] text-white' : 'border-slate-300'}`}>
                    {membershipType === 'individual' && <Icon name="CheckIcon" size={14} />}
                  </div>
                </div>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  $119.99
                  <span className="text-lg text-slate-500 font-normal">/year</span>
                </p>
              </button>

              <button
                onClick={() => {
                  setMembershipType('business');
                  setOrganizationForm({ ...organizationForm, organizationType: 'business' });
                }}
                className={`group relative p-6 border-2 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 ${
                  membershipType === 'business' ?'border-[#1C4D8D] bg-[#1C4D8D]/5 shadow-md ring-1 ring-[#1C4D8D]/20' :'border-slate-100 hover:border-[#1C4D8D]/30 hover:shadow-lg bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">Business</h3>
                    <p className="text-sm text-slate-500 mt-1">For companies</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${membershipType === 'business' ? 'border-[#1C4D8D] bg-[#1C4D8D] text-white' : 'border-slate-300'}`}>
                    {membershipType === 'business' && <Icon name="CheckIcon" size={14} />}
                  </div>
                </div>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  $119.99
                  <span className="text-lg text-slate-500 font-normal">/member/year</span>
                </p>
              </button>

              <button
                onClick={() => {
                  setMembershipType('association');
                  setOrganizationForm({ ...organizationForm, organizationType: 'association' });
                }}
                className={`group relative p-6 border-2 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 ${
                  membershipType === 'association' ?'border-[#1C4D8D] bg-[#1C4D8D]/5 shadow-md ring-1 ring-[#1C4D8D]/20' :'border-slate-100 hover:border-[#1C4D8D]/30 hover:shadow-lg bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">Association</h3>
                    <p className="text-sm text-slate-500 mt-1">For organizations</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${membershipType === 'association' ? 'border-[#1C4D8D] bg-[#1C4D8D] text-white' : 'border-slate-300'}`}>
                    {membershipType === 'association' && <Icon name="CheckIcon" size={14} />}
                  </div>
                </div>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  $119.99
                  <span className="text-lg text-slate-500 font-normal">/member/year</span>
                </p>
              </button>
            </div>

            {/* Individual Form */}
            {membershipType === 'individual' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5 mb-8 flex gap-4 items-start">
                  <Icon name="InformationCircleIcon" className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-sm text-blue-800 leading-relaxed">
                    <strong>Important:</strong> This must be a valid and active email address. We periodically validate our members and use this email to provide important updates such as new business additions and special member-only deals.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={individualForm.firstName}
                      onChange={(e) => setIndividualForm({ ...individualForm, firstName: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={individualForm.lastName}
                      onChange={(e) => setIndividualForm({ ...individualForm, lastName: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                    Middle Initial
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    value={individualForm.middleInitial}
                    onChange={(e) => setIndividualForm({ ...individualForm, middleInitial: e.target.value.toUpperCase() })}
                    className="w-20 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all text-center"
                    placeholder="M"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={individualForm.phone}
                    onChange={(e) => setIndividualForm({ ...individualForm, phone: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                    placeholder="345-916-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={individualForm.email}
                    onChange={(e) => setIndividualForm({ ...individualForm, email: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                    placeholder="john.smith@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                    District of Residence *
                  </label>
                  <select
                    required
                    value={individualForm.district}
                    onChange={(e) => setIndividualForm({ ...individualForm, district: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all appearance-none"
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.value} value={district.value}>
                        {district.label}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-900">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleIndividualNext}
                  className="w-full px-8 py-4 bg-[#1C4D8D] text-white rounded-xl font-bold text-lg hover:bg-[#1C4D8D]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Continue to Payment
                  <Icon name="ArrowRightIcon" size={20} />
                </button>
              </div>
            )}

            {/* Business/Association Form */}
            {(membershipType === 'business' || membershipType === 'association') && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={organizationForm.contactName}
                    onChange={(e) => setOrganizationForm({ ...organizationForm, contactName: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                    {membershipType === 'business' ? 'Business' : 'Association'} Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={organizationForm.organizationName}
                    onChange={(e) => setOrganizationForm({ ...organizationForm, organizationName: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                    placeholder={membershipType === 'business' ? 'Acme Corporation' : 'Cayman Islands Chamber'}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={organizationForm.email}
                      onChange={(e) => setOrganizationForm({ ...organizationForm, email: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                      placeholder="contact@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={organizationForm.phone}
                      onChange={(e) => setOrganizationForm({ ...organizationForm, phone: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                      placeholder="345-949-5555"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                    Estimated / Required Number of Memberships *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={organizationForm.estimatedMembers}
                    onChange={(e) => setOrganizationForm({ ...organizationForm, estimatedMembers: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                    placeholder="50"
                  />
                  {parseInt(organizationForm.estimatedMembers) > 100 && (
                    <p className="text-sm text-orange-600 mt-2">
                      Organizations with over 100 members qualify for special pricing. Your application will be reviewed by our team.
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="meetingRequested"
                    checked={organizationForm.meetingRequested}
                    onChange={(e) => setOrganizationForm({ ...organizationForm, meetingRequested: e.target.checked })}
                    className="mt-1 w-4 h-4 text-[#1C4D8D] border-slate-300 rounded focus:ring-[#1C4D8D]"
                  />
                  <label htmlFor="meetingRequested" className="text-sm text-slate-700">
                    I would like to request a meeting before payment
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-900">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleOrganizationSubmit}
                  disabled={loading}
                  className="w-full px-8 py-4 bg-[#1C4D8D] text-white rounded-xl font-bold text-lg hover:bg-[#1C4D8D]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                  {!loading && <Icon name="ArrowRightIcon" size={20} />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Individual Payment Step */}
        {step === 2 && membershipType === 'individual' && (
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl animate-fade-up">
            <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6">
              Complete Your Payment
            </h2>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-900 font-semibold">Individual Annual Membership</span>
                <span className="text-slate-900 font-bold text-xl">$119.99</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {individualForm.firstName} {individualForm.lastName} - {individualForm.email}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            {clientId ? (
              <PayPalScriptProvider
                options={{
                  clientId,
                  currency: 'USD',
                  intent: 'capture'
                }}
              >
                <PayPalButtons
                  createOrder={createIndividualOrder}
                  onApprove={onIndividualApprove}
                  onError={(err) => setError('Payment failed. Please try again.')}
                  style={{
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal'
                  }}
                />
              </PayPalScriptProvider>
            ) : (
              <div className="text-center py-4 text-red-600">
                PayPal configuration missing. Please contact support.
              </div>
            )}

            <button
              onClick={() => setStep(1)}
              className="w-full mt-6 px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all"
            >
              Back to Form
            </button>
          </div>
        )}

        {/* Success Step */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-xl text-center animate-fade-up">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Icon name="CheckCircleIcon" size={32} className="text-green-600" variant="solid" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">
              {membershipType === 'individual' ? 'Payment Successful!' : 'Application Submitted!'}
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">{success}</p>
            <Link
              href="/homepage"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#1C4D8D] text-white rounded-xl font-bold text-lg hover:bg-[#1C4D8D]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Return to Homepage
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
