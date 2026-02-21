import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import Image from 'next/image';

export default function HowItWorks() {
  const benefits = [
    {
      id: 'benefit_travel',
      title: 'Travel Savings Up to 70%',
      description: 'Access member-only hotel rates worldwide. Not coupons—real discounted prices that save you hundreds per stay.',
      example: 'Example: Lake Buena Vista, Orlando, Florida - $177/night (regular $280)',
      savings: 'Save $103 per night • $1,418 total for 7 nights',
      icon: 'GlobeAmericasIcon',
      color: 'bg-blue-100 text-blue-700',
      image: '/assets/images/image-1770147603974.png',
    },
    {
      id: 'benefit_local',
      title: 'Local Cayman Discounts Up to 25%',
      description: 'Everyday savings at restaurants, retail stores, and services. Health, wellness, automotive, home, lifestyle—savings that add up fast.',
      example: 'Dining, groceries, auto care, spa treatments, home services',
      savings: 'Save on everyday expenses across Cayman',
      icon: 'BuildingStorefrontIcon',
      color: 'bg-orange-100 text-orange-700',
    },
    {
      id: 'benefit_certificates',
      title: 'Up to $2,000 in Redeemable Certificates',
      description: 'Real spending power with participating businesses. Redeem certificates for goods and services—not gimmicks, actual value.',
      example: 'Use at partner restaurants, stores, and service providers',
      savings: 'Up to $2,000 in additional value',
      icon: 'TicketIcon',
      color: 'bg-green-100 text-green-700',
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Join Discount Club Cayman?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            This membership pays for itself. You'd be crazy not to join.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-16 animate-fade-up animation-delay-100">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="relative">
              <div className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-secondary/30">
                <div className={`w-16 h-16 ${benefit.color} rounded-full flex items-center justify-center mb-6 shadow-xl`}>
                  <Icon name={benefit.icon as any} size={32} />
                </div>

                <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {benefit.description}
                </p>
                
                {benefit.image && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-border">
                    <Image
                      src={benefit.image}
                      alt="Orlando hotel booking example showing $103/night savings at Lake Buena Vista hotel"
                      width={400}
                      height={300}
                      className="w-full h-auto"
                    />
                  </div>
                )}
                
                <div className="bg-white rounded-lg p-4 border border-border mb-3">
                  <p className="text-sm text-muted-foreground mb-1">{benefit.example}</p>
                  <p className="text-primary font-semibold">{benefit.savings}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-2xl p-12 animate-fade-up animation-delay-200 shadow-lg border-2 border-primary/20">
          <h3 className="font-heading text-3xl font-bold text-foreground mb-4">
            Perfect for Individuals, Employers & Associations
          </h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
            Whether you're saving for your family, offering employee benefits, or providing member perks—Discount Club Cayman delivers real value that keeps money in your pocket.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Join Now
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-foreground border-2 border-border rounded-full text-lg font-semibold hover:border-primary hover:text-primary transition-all"
            >
              View Pricing
              <Icon name="CurrencyDollarIcon" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}