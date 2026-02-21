import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function FeaturedBusinesses() {
  const businesses = [
  {
    id: 'business_1',
    name: "Foster\'s Food Fair",
    category: 'Groceries',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_15f3fb668-1766745186343.png",
    logoAlt: 'Modern grocery store logo with green leaf icon',
    offer: '32% off weekly shopping',
    location: 'George Town'
  },
  {
    id: 'business_2',
    name: 'Cayman Auto Care',
    category: 'Auto Service',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1856381b0-1767215868610.png",
    logoAlt: 'Auto repair shop logo with wrench and gear design',
    offer: '$50 off full service',
    location: 'West Bay'
  },
  {
    id: 'business_3',
    name: 'Island Wellness Spa',
    category: 'Health & Wellness',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_18544c739-1767273455476.png",
    logoAlt: 'Spa logo with lotus flower in serene setting',
    offer: '25% off all treatments',
    location: 'Seven Mile Beach'
  },
  {
    id: 'business_4',
    name: 'Coral Reef Restaurant',
    category: 'Dining',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_11b4ed1be-1769351081256.png",
    logoAlt: 'Restaurant logo with elegant table setting and warm lighting',
    offer: '20% off dinner menu',
    location: 'George Town'
  },
  {
    id: 'business_5',
    name: 'Island Home Services',
    category: 'Home & Garden',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1544ba5d7-1768207645788.png",
    logoAlt: 'Home services logo with modern house icon',
    offer: '$100 off projects over $500',
    location: 'Bodden Town'
  },
  {
    id: 'business_6',
    name: 'Cayman Kids Club',
    category: 'Family & Kids',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1836f3b79-1770048882883.png",
    logoAlt: 'Colorful kids activity center logo with playful design',
    offer: '30% off monthly membership',
    location: 'East End'
  }];


  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-secondary/5 to-primary/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12 animate-fade-up">
          <div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Trusted Partners, Exclusive Rates
            </h2>
            <p className="text-xl text-muted-foreground">
              Member-only discounts at local businesses you already know and trust.
            </p>
          </div>
          <Link
            href="/browse-discounts"
            className="hidden md:inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">

            View All
            <Icon name="ArrowRightIcon" size={20} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 animate-fade-up animation-delay-100">
          {businesses?.map((business) =>
          <div
            key={business?.id}
            className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">

              <div className="relative h-48 bg-muted overflow-hidden">
                <AppImage
                src={business?.logo}
                alt={business?.logoAlt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />

                <div className="absolute top-4 right-4 px-3 py-1 bg-white rounded-full text-xs font-semibold text-foreground shadow-sm">
                  {business?.category}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  {business?.name}
                </h3>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Icon name="MapPinIcon" size={16} />
                  {business?.location}
                </div>

                <div className="bg-primary/10 rounded-lg p-4 mb-4">
                  <p className="text-primary font-semibold text-lg">
                    {business?.offer}
                  </p>
                </div>

                <button className="w-full px-4 py-2 bg-foreground text-white rounded-lg font-semibold hover:bg-primary transition-colors flex items-center justify-center gap-2">
                  View Details
                  <Icon name="ArrowRightIcon" size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-12 md:hidden">
          <Link
            href="/browse-discounts"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">

            View All Businesses
            <Icon name="ArrowRightIcon" size={20} />
          </Link>
        </div>
      </div>
    </section>);

}