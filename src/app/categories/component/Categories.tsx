'use client'

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function Categories() {
  const categories = [
    {
      id: 'automotive-marine',
      title: 'Automotive & Marine',
      description: 'Find the best deals on vehicle maintenance, parts, detailing, and marine services.',
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop',
      icon: 'TruckIcon',
      count: 12,
      href: '/categories/automotive-marine'
    },
    {
      id: 'b2b',
      title: 'B2B Members',
      description: 'Exclusive business-to-business services, wholesale opportunities, and corporate solutions.',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
      icon: 'BriefcaseIcon',
      count: 8,
      href:'/categories/b2b'
    },
    {
      id: 'beauty',
      title: 'Beauty Salon & Barber Shop',
      description: 'Pamper yourself with discounts on haircuts, styling, spa treatments, and grooming.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop',
      icon: 'SparklesIcon',
      count: 15,
      href:'/categories/beauty'
    },
    {
      id: 'construction',
      title: 'Construction',
      description: 'Save on building materials, contractors, renovation services, and heavy equipment.',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2031&auto=format&fit=crop',
      icon: 'WrenchScrewdriverIcon',
      count: 10,
      href:'/categories/construction'
    },
    {
      id: 'electronics',
      title: 'Electronics & Office Supplies',
      description: 'Upgrade your tech and stock up on essential office supplies and furniture for less.',
      image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
      icon: 'ComputerDesktopIcon',
      count: 20,
      href:'/categories/electronics'
    },
    {
      id: 'fashion',
      title: 'Fashion and Clothing',
      description: 'Stay stylish with offers on apparel, accessories, footwear, and jewelry.',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
      icon: 'ShoppingBagIcon',
      count: 25,
      href:'/categories/fashion'
    },
    {
      id: 'financial',
      title: 'Financial Institutes',
      description: 'Banking, insurance, and financial planning services at special member rates.',
      image: 'https://images.unsplash.com/photo-1565514020176-dbf227747046?q=80&w=2070&auto=format&fit=crop',
      icon: 'BanknotesIcon',
      count: 6,
      href:'/categories/financial'
    },
    {
      id: 'food',
      title: 'Food & Beverage',
      description: 'Delicious dining experiences, cafes, and beverage deals across the island.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop',
      icon: 'CakeIcon',
      count: 40,
      href:'/categories/food'
    },
    {
      id: 'health',
      title: 'Health & Fitness',
      description: 'Gym memberships, wellness centers, healthcare savings, and pharmacy deals.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
      icon: 'HeartIcon',
      count: 18,
      href:'/categories/health'
    },
    {
      id: 'home',
      title: 'Home & Garden',
      description: 'Furniture, decor, gardening supplies, and home improvement services.',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2070&auto=format&fit=crop',
      icon: 'HomeIcon',
      count: 22,
      href:'/categories/home'
    },
    {
      id: 'kids',
      title: 'Kids & Recreational',
      description: 'Fun activities, toys, educational resources, and entertainment for children.',
      image: 'https://images.unsplash.com/photo-1502086223501-60051f87b84a?q=80&w=2070&auto=format&fit=crop',
      icon: 'FaceSmileIcon',
      count: 14,
      href:'/categories/kids'
    },
    {
      id: 'marketing',
      title: 'Marketing & Media',
      description: 'Professional marketing, printing, media production, and advertising services.',
      image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=2031&auto=format&fit=crop',
      icon: 'MegaphoneIcon',
      count: 9,
      href:'/categories/marketing'
    },
    {
      id: 'retail',
      title: 'Retail',
      description: 'General retail shopping for gifts, hobbies, pets, and everyday items.',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
      icon: 'TagIcon',
      count: 30,
      href:'/categories/retail'
    }
  ];

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
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
                <AppImage
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                  {category.count} Deals
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                    <Icon name={category.icon as any} size={20} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                    {category.title}
                  </h3>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                  {category.description}
                </p>

                <div className="flex items-center text-[#1C4D8D] font-semibold text-sm group/link">
                  Explore Category
                  <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}