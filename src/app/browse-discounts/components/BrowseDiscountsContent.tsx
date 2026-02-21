'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

export default function BrowseDiscountsContent() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDealType, setSelectedDealType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'auto', label: 'Auto & Transport' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'services', label: 'Professional Services' },
  { value: 'family', label: 'Family & Kids' },
  { value: 'travel', label: 'Travel & Leisure' }];


  const locations = [
  { value: 'all', label: 'All Locations' },
  { value: 'george-town', label: 'George Town' },
  { value: 'west-bay', label: 'West Bay' },
  { value: 'bodden-town', label: 'Bodden Town' },
  { value: 'east-end', label: 'East End' },
  { value: 'north-side', label: 'North Side' }];


  const dealTypes = [
  { value: 'all', label: 'All Deals' },
  { value: 'percentage', label: 'Percentage Off' },
  { value: 'fixed', label: 'Fixed Discount' },
  { value: 'certificate', label: 'Certificate' }];


  const discounts = [
  {
    id: 'discount_1',
    business: "Foster\'s Food Fair",
    category: 'Groceries',
    location: 'George Town',
    image: "https://images.unsplash.com/photo-1589658857538-1bc64f2bc2b8",
    imageAlt: 'Modern supermarket interior with fresh produce displays',
    offer: '32% off weekly shopping',
    dealType: 'percentage',
    memberOnly: false,
    terms: 'Valid on purchases over $100'
  },
  {
    id: 'discount_2',
    business: 'Cayman Auto Care',
    category: 'Auto & Transport',
    location: 'West Bay',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_10c13adbd-1768071636679.png",
    imageAlt: 'Professional auto repair shop with mechanics working on vehicles',
    offer: '$50 off full service',
    dealType: 'fixed',
    memberOnly: false,
    terms: 'Cannot be combined with other offers'
  },
  {
    id: 'discount_3',
    business: 'Island Wellness Spa',
    category: 'Health & Wellness',
    location: 'Seven Mile Beach',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1467ec090-1765062310515.png",
    imageAlt: 'Tranquil spa treatment room with massage table and candles',
    offer: '25% off all treatments',
    dealType: 'percentage',
    memberOnly: true,
    terms: 'Advance booking required'
  },
  {
    id: 'discount_4',
    business: 'Coral Reef Restaurant',
    category: 'Food & Dining',
    location: 'George Town',
    image: "https://images.unsplash.com/photo-1560130934-590b85fc08e7",
    imageAlt: 'Elegant restaurant interior with fine dining table settings',
    offer: '20% off dinner menu',
    dealType: 'percentage',
    memberOnly: false,
    terms: 'Valid Tuesday-Thursday'
  },
  {
    id: 'discount_5',
    business: 'Island Home Services',
    category: 'Home & Garden',
    location: 'Bodden Town',
    image: "https://images.unsplash.com/photo-1673469110171-dbf5d19a8336",
    imageAlt: 'Beautiful modern home exterior with landscaped garden',
    offer: '$100 off projects over $500',
    dealType: 'fixed',
    memberOnly: true,
    terms: 'New customers only'
  },
  {
    id: 'discount_6',
    business: 'Cayman Kids Club',
    category: 'Family & Kids',
    location: 'East End',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e7d7bdf1-1768089217406.png",
    imageAlt: 'Colorful children activity center with play equipment and toys',
    offer: '30% off monthly membership',
    dealType: 'percentage',
    memberOnly: false,
    terms: 'First 3 months'
  },
  {
    id: 'discount_7',
    business: 'Sunset Yoga Studio',
    category: 'Health & Wellness',
    location: 'West Bay',
    image: "https://images.unsplash.com/photo-1729881218683-f837e862ef9d",
    imageAlt: 'Peaceful yoga studio with people practicing on mats at sunset',
    offer: '15% off class packages',
    dealType: 'percentage',
    memberOnly: true,
    terms: '10-class package or more'
  },
  {
    id: 'discount_8',
    business: 'Island Fresh Market',
    category: 'Groceries',
    location: 'George Town',
    image: "https://images.unsplash.com/photo-1574305562613-426c65502144",
    imageAlt: 'Fresh organic produce market with colorful fruits and vegetables',
    offer: '20% off organic produce',
    dealType: 'percentage',
    memberOnly: false,
    terms: 'Every Wednesday'
  }];


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Browse Exclusive Discounts
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
            Explore 150+ discounts from trusted local businesses across Cayman Islands.
          </p>
        </div>
      </div>
      {/* Filters */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative group">
              <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1C4D8D] transition-colors" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all placeholder:text-slate-400 text-slate-700"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e?.target?.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] appearance-none text-slate-700 cursor-pointer transition-all"
              >
                {categories?.map((cat) => (
                  <option key={cat?.value} value={cat?.value}>
                    {cat?.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon name="ChevronDownIcon" size={16} />
              </div>
            </div>

            {/* Location Filter */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e?.target?.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] appearance-none text-slate-700 cursor-pointer transition-all"
              >
                {locations?.map((loc) => (
                  <option key={loc?.value} value={loc?.value}>
                    {loc?.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon name="ChevronDownIcon" size={16} />
              </div>
            </div>

            {/* Deal Type Filter */}
            <div className="relative">
              <select
                value={selectedDealType}
                onChange={(e) => setSelectedDealType(e?.target?.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] appearance-none text-slate-700 cursor-pointer transition-all"
              >
                {dealTypes?.map((type) => (
                  <option key={type?.value} value={type?.value}>
                    {type?.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon name="ChevronDownIcon" size={16} />
              </div>
            </div>
          </div>

          <button className="mt-4 flex items-center gap-2 text-[#1C4D8D] font-bold text-sm hover:gap-3 transition-all px-2">
            <Icon name="MapPinIcon" size={18} />
            Find Near Me
          </button>
        </div>
      </div>
      {/* Discount Listings */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {discounts?.map((discount) => (
            <div
              key={discount?.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full"
            >
              <div className="relative h-56 bg-slate-200 overflow-hidden">
                {discount?.memberOnly && (
                  <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] flex items-center justify-center z-10 transition-opacity duration-300">
                    <div className="text-center transform scale-100">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/20">
                        <Icon name="LockClosedIcon" size={24} className="text-white" />
                      </div>
                      <p className="text-white font-bold text-lg tracking-wide">Member Only</p>
                      <p className="text-slate-300 text-sm mt-1">Join to unlock</p>
                    </div>
                  </div>
                )}
                <AppImage
                  src={discount?.image}
                  alt={discount?.imageAlt}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    discount?.memberOnly ? 'blur-sm scale-105' : 'group-hover:scale-110'
                  }`}
                />

                <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-slate-700 shadow-sm border border-slate-100">
                  {discount?.category}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-[#1C4D8D] transition-colors">
                    {discount?.business}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Icon name="MapPinIcon" size={16} className="text-slate-400" />
                    {discount?.location}
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6 mt-auto group-hover:bg-blue-50 transition-colors">
                  <p className="text-[#1C4D8D] font-bold text-lg leading-tight">
                    {discount?.offer}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    {discount?.terms}
                  </p>
                </div>

                <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-[#1C4D8D] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn">
                  View Details
                  <Icon name="ArrowRightIcon" size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* CTA Banner */}
      <div className="bg-gradient-to-br from-[#1C4D8D] to-[#153e75] py-24 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-blue-400 blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Unlock All Member-Only Deals
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join now and get instant access to exclusive discounts worth thousands.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#1C4D8D] rounded-xl text-lg font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Join Now
            <Icon name="ArrowRightIcon" size={20} />
          </Link>
        </div>
      </div>
    </div>

    );
}