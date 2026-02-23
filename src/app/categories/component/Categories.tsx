'use client'

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function Categories() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Browse Categories
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
            Find exactly what you're looking for. Explore our diverse range of discount categories.
          </p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Automotive & Marine */}
          <Link
            href="/category/automotive-marine"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop"
                alt="Automotive & Marine"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                12 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="TruckIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  Automotive & Marine
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                Find the best deals on vehicle maintenance, parts, detailing, and marine services.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* B2B Members */}
          <Link
            href="/category/b2b"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                alt="B2B Members"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                8 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="BriefcaseIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  B2B Members
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                Exclusive business-to-business services, wholesale opportunities, and corporate solutions.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Beauty Salon & Barber Shop */}
          <Link
            href="/category/beauty"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop"
                alt="Beauty Salon & Barber Shop"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                15 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="SparklesIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  Beauty Salon & Barber Shop
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                Pamper yourself with discounts on haircuts, styling, spa treatments, and grooming.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Construction */}
          <Link
            href="/category/construction"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2031&auto=format&fit=crop"
                alt="Construction"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                10 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="WrenchScrewdriverIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  Construction
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                Save on building materials, contractors, renovation services, and heavy equipment.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Electronics & Office Supplies */}
          <Link
            href="/category/electronics"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
                alt="Electronics & Office Supplies"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                20 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="ComputerDesktopIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  Electronics & Office Supplies
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                Upgrade your tech and stock up on essential office supplies and furniture for less.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Fashion and Clothing */}
          <Link
            href="/category/fashion"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                alt="Fashion and Clothing"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                25 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="ShoppingBagIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  Fashion and Clothing
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                Stay stylish with offers on apparel, accessories, footwear, and jewelry.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Financial Institutes */}
          <Link
            href="/category/financial"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1565514020176-dbf227747046?q=80&w=2070&auto=format&fit=crop"
                alt="Financial Institutes"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                6 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="BanknotesIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  Financial Institutes
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                Banking, insurance, and financial planning services at special member rates.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Food & Beverage */}
          <Link
            href="/category/food"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
                alt="Food & Beverage"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                40 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="CakeIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  Food & Beverage
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                Delicious dining experiences, cafes, and beverage deals across the island.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Health & Fitness */}
          <Link
            href="/category/health"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
                alt="Health & Fitness"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                18 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="HeartIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  Health & Fitness
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                Gym memberships, wellness centers, healthcare savings, and pharmacy deals.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Home & Garden */}
          <Link
            href="/category/home"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2070&auto=format&fit=crop"
                alt="Home & Garden"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                22 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="HomeIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  Home & Garden
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                Furniture, decor, gardening supplies, and home improvement services.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Kids & Recreational */}
          <Link
            href="/category/kids"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1502086223501-60051f87b84a?q=80&w=2070&auto=format&fit=crop"
                alt="Kids & Recreational"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                14 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="FaceSmileIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  Kids & Recreational
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                Fun activities, toys, educational resources, and entertainment for children.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Marketing & Media */}
          <Link
            href="/category/marketing"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=2031&auto=format&fit=crop"
                alt="Marketing & Media"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                9 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="MegaphoneIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  Marketing & Media
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                Professional marketing, printing, media production, and advertising services.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Retail */}
          <Link
            href="/category/retail"
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
              <AppImage
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                alt="Retail"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                30 Deals
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                  <Icon name="TagIcon" size={20} />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                  Retail
                </h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                General retail shopping for gifts, hobbies, pets, and everyday items.
              </p>

              <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                Explore Category
                <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}