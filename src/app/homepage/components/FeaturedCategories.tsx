'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function FeaturedCategories() {
  const categories = [
    {
      id: 'cat_food',
      name: 'Food & Dining',
      icon: 'BuildingStorefrontIcon',
      count: 42,
      color: 'bg-orange-100 text-orange-700',
      href: '/browse-discounts?category=food',
    },
    {
      id: 'cat_groceries',
      name: 'Groceries',
      icon: 'ShoppingCartIcon',
      count: 18,
      color: 'bg-green-100 text-green-700',
      href: '/browse-discounts?category=groceries',
    },
    {
      id: 'cat_health',
      name: 'Health & Wellness',
      icon: 'HeartIcon',
      count: 24,
      color: 'bg-pink-100 text-pink-700',
      href: '/browse-discounts?category=health',
    },
    {
      id: 'cat_auto',
      name: 'Auto & Transport',
      icon: 'TruckIcon',
      count: 16,
      color: 'bg-blue-100 text-blue-700',
      href: '/browse-discounts?category=auto',
    },
    {
      id: 'cat_home',
      name: 'Home & Garden',
      icon: 'HomeIcon',
      count: 22,
      color: 'bg-purple-100 text-purple-700',
      href: '/browse-discounts?category=home',
    },
    {
      id: 'cat_services',
      name: 'Professional Services',
      icon: 'BriefcaseIcon',
      count: 28,
      color: 'bg-indigo-100 text-indigo-700',
      href: '/browse-discounts?category=services',
    },
    {
      id: 'cat_family',
      name: 'Family & Kids',
      icon: 'UserGroupIcon',
      count: 14,
      color: 'bg-yellow-100 text-yellow-700',
      href: '/browse-discounts?category=family',
    },
    {
      id: 'cat_travel',
      name: 'Travel & Leisure',
      icon: 'GlobeAmericasIcon',
      count: 20,
      color: 'bg-teal-100 text-teal-700',
      href: '/browse-discounts?category=travel',
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everyday Savings That Add Up Fast
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From groceries to dining, auto care to wellness—save on what matters most and keep more money in your pocket.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-fade-up animation-delay-100">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative bg-muted rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${category.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon name={category.icon as any} size={28} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.count} businesses
              </p>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="ArrowRightIcon" size={20} className="text-primary" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/browse-discounts"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            View All Discounts
            <Icon name="ArrowRightIcon" size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}