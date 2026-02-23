'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

export default function SignUpContent() {
  const [step, setStep] = useState(1);
  const [planType, setPlanType] = useState<'individual' | 'family'>('individual');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [familyMembers, setFamilyMembers] = useState([
    { id: 'member_1', name: '', email: '' },
  ]);

  const plans = {
    individual: {
      monthly: 15,
      annual: 150,
    },
    family: {
      monthly: 25,
      annual: 250,
    },
  };

  const currentPrice = plans[planType][billingCycle];
  const annualSavings = planType === 'individual' ? 30 : 50;

  const addFamilyMember = () => {
    if (familyMembers.length < 3) {
      setFamilyMembers([
        ...familyMembers,
        { id: `member_${familyMembers.length + 1}`, name: '', email: '' },
      ]);
    }
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter((member) => member.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Payment processing would happen here
    console.log('Form submitted', { planType, billingCycle, formData, familyMembers });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16 md:py-24 ">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-100"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-[#1C4D8D] font-semibold text-sm mb-6 shadow-sm">
            <Icon name="SparklesIcon" size={16} />
            Start Saving Today
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Join Discount Club Cayman
          </h1>
          <p className="text-xl text-slate-600">Start saving in less than 2 minutes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-16 animate-fade-up animation-delay-100">
          <div className="flex items-center gap-2 md:gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={`step_${num}`} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    step >= num
                      ? 'bg-[#4988C4] text-white shadow-lg shadow-[#4988C4]/30 scale-110'
                      : 'bg-white text-slate-300 border-2 border-slate-200'
                  }`}
                >
                  {num}
                </div>
                {num < 4 && (
                  <div
                    className={`w-8 md:w-16 h-1 mx-2 rounded-full transition-all duration-500 ${
                      step > num ? 'bg-[#4988C4]' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 animate-fade-up animation-delay-200">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl">
              {/* Step 1: Plan Selection */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="text-center md:text-left">
                    <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                      Choose Your Plan
                    </h2>
                    <p className="text-slate-500">Select the membership that fits your needs</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <label
                      className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                        planType === 'individual' ?'border-[#1C4D8D] bg-[#1C4D8D]/10 shadow-md' :'border-slate-100 hover:border-[#1C4D8D]/30 hover:shadow-lg'
                      }`}
                    >
                      <input
                        type="radio"
                        name="planType"
                        value="individual"
                        checked={planType === 'individual'}
                        onChange={(e) => setPlanType(e.target.value as 'individual')}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-heading text-xl font-bold text-foreground">
                            Individual
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Perfect for singles
                          </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${planType === 'individual' ? 'border-[#1C4D8D] bg-[#1C4D8D] text-white' : 'border-slate-300'}`}>
                            {planType === 'individual' && <Icon name="CheckIcon" size={14} />}
                        </div>
                      </div>
                      <p className="text-3xl font-heading font-bold text-foreground">
                        ${plans.individual.monthly}
                        <span className="text-lg text-muted-foreground font-normal">/mo</span>
                      </p>
                    </label>

                    <label
                      className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                        planType === 'family' ?'border-[#1C4D8D] bg-[#1C4D8D]/10 shadow-md' :'border-slate-100 hover:border-[#1C4D8D]/30 hover:shadow-lg'
                      }`}
                    >
                      <input
                        type="radio"
                        name="planType"
                        value="family"
                        checked={planType === 'family'}
                        onChange={(e) => setPlanType(e.target.value as 'family')}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-heading text-xl font-bold text-foreground">
                            Family
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Up to 4 members
                          </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${planType === 'family' ? 'border-[#1C4D8D] bg-[#1C4D8D] text-white' : 'border-slate-300'}`}>
                            {planType === 'family' && <Icon name="CheckIcon" size={14} />}
                        </div>
                      </div>
                      <p className="text-3xl font-heading font-bold text-foreground">
                        ${plans.family.monthly}
                        <span className="text-lg text-muted-foreground font-normal">/mo</span>
                      </p>
                      <div className="absolute -top-3 -right-3 px-4 py-1 bg-gradient-to-r from-[#1C4D8D] to-[#4988C4] text-white rounded-full text-xs font-bold shadow-lg">
                        Most Popular
                      </div>
                    </label>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-2 flex items-center justify-center gap-2 max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        billingCycle === 'monthly' ?'bg-white text-slate-900 shadow-md' :'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative ${
                        billingCycle === 'annual' ?'bg-white text-slate-900 shadow-md' :'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Annual
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                        Save ${annualSavings}
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full px-8 py-4 bg-[#1C4D8D] text-white rounded-xl font-bold text-lg hover:bg-[#4988C4] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    Continue
                    <Icon name="ArrowRightIcon" size={20} />
                  </button>
                </div>
              )}

              {/* Step 2: Account Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                    Account Information
                  </h2>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#0F2854] transition-all"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#0F2854] transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#0F2854] transition-all"
                      placeholder="+1 (345) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#0F2854] transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#0F2854] transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(planType === 'family' ? 3 : 4)}
                      className="flex-1 px-6 py-3 bg-[#1C4D8D] text-primary-foreground rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Continue
                      <Icon name="ArrowRightIcon" size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Family Members (conditional) */}
              {step === 3 && planType === 'family' && (
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                    Add Family Members
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Add up to 3 additional family members (optional)
                  </p>

                  {familyMembers.map((member, index) => (
                    <div key={member.id} className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">
                          Family Member {index + 1}
                        </h3>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeFamilyMember(member.id)}
                            className="text-error hover:text-error/80 transition-colors"
                          >
                            <Icon name="XMarkIcon" size={20} />
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => {
                              const updated = [...familyMembers];
                              updated[index].name = e.target.value;
                              setFamilyMembers(updated);
                            }}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#0F2854] transition-all"
                            placeholder="Jane Smith"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={member.email}
                            onChange={(e) => {
                              const updated = [...familyMembers];
                              updated[index].email = e.target.value;
                              setFamilyMembers(updated);
                            }}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#0F2854] transition-all"
                            placeholder="jane@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {familyMembers.length < 3 && (
                    <button
                      type="button"
                      onClick={addFamilyMember}
                      className="w-full px-6 py-4 border-2 border-dashed border-slate-300 rounded-xl font-semibold text-slate-500 hover:border-primary hover:text-[#1C4D8D] hover:bg-[#1C4D8D]/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Icon name="PlusIcon" size={20} />
                      Add Family Member
                    </button>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="flex-1 px-6 py-3 bg-[#1C4D8D] text-primary-foreground rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Continue
                      <Icon name="ArrowRightIcon" size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                    Payment Information
                  </h2>

                  <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="LockClosedIcon" size={16} className="text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Secured by Stripe. Your payment information is encrypted.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2854]/20 focus:border-[#0F2854] transition-all"
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2854]/20 focus:border-[#0F2854] transition-all"
                        placeholder="MM/YY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                        CVC *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2854]/20 focus:border-[#0F2854] transition-all"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-4">
                    <input
                      type="checkbox"
                      required
                      id="terms"
                      className="mt-1 w-4 h-4 text-[#1C4D8D] border-border rounded focus:ring-[#1C4D8D]"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      I agree to the{' '}
                      <Link href="/terms" className="text-[#0F2854] hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy-policy" className="text-[#0F2854] hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(planType === 'family' ? 3 : 2)}
                      className="flex-1 px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-[#1C4D8D] text-primary-foreground rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Complete Purchase
                      <Icon name="LockClosedIcon" size={18} />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg sticky top-24">
              <h3 className="font-heading text-xl font-bold text-foreground mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold text-foreground capitalize">
                    {planType}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing</span>
                  <span className="font-semibold text-foreground capitalize">
                    {billingCycle}
                  </span>
                </div>

                {planType === 'family' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Family Members</span>
                    <span className="font-semibold text-foreground">
                      {familyMembers.filter((m) => m.name || m.email).length + 1}
                    </span>
                  </div>
                )}

                {billingCycle === 'annual' && (
                  <div className="flex justify-between text-success">
                    <span>Annual Savings</span>
                    <span className="font-semibold">-${annualSavings}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-lg font-semibold text-foreground">
                    Total Due Today
                  </span>
                  <span className="text-3xl font-heading font-bold text-[#1C4D8D]">
                    ${currentPrice}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Next billing: {billingCycle === 'monthly' ? 'March 2, 2026' : 'February 2, 2027'}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircleIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" variant="solid" />
                  <span className="text-sm text-muted-foreground">
                    Instant access to all discounts
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircleIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" variant="solid" />
                  <span className="text-sm text-muted-foreground">
                    Digital membership card
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircleIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" variant="solid" />
                  <span className="text-sm text-muted-foreground">
                    30-day money-back guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}