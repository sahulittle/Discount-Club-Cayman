import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function PricingPreview() {
  const plan = {
    id: 'plan_individual',
    name: 'Individual Membership',
    price: '$119.99',
    period: '/year',
    description: 'Annual membership for individuals',
    features: [
      'Access to all discounts',
      'Digital membership card',
      'Mobile app access',
      'Unlimited savings',
      'Certificate purchases',
    ],
    cta: 'Start Saving',
    href: '/sign-up?plan=individual',
  };

  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Membership That Pays for Itself
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            One hotel stay covers your entire annual membership. Everything after that is pure savings.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12 animate-fade-up animation-delay-100">
          <div className="relative bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-primary shadow-2xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-pink-500 text-white rounded-full text-sm font-semibold shadow-lg">
              Annual Membership
            </div>

            <div className="text-center mb-6">
              <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                {plan?.name}
              </h3>
              <p className="text-muted-foreground">{plan?.description}</p>
            </div>

            <div className="text-center mb-6">
              <span className="text-5xl font-heading font-bold text-foreground">
                {plan?.price}
              </span>
              <span className="text-xl text-muted-foreground">{plan?.period}</span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan?.features?.map((feature, index) => (
                <li key={`${plan?.id}_feature_${index}`} className="flex items-start gap-3">
                  <Icon name="CheckCircleIcon" size={20} className="text-primary flex-shrink-0 mt-0.5" variant="solid" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan?.href}
              className="block w-full px-6 py-3 rounded-full text-center font-semibold transition-all bg-gradient-to-r from-primary to-pink-500 text-white hover:shadow-2xl hover:scale-105 shadow-lg"
            >
              {plan?.cta}
            </Link>
          </div>
        </div>

        <div className="text-center animate-fade-up animation-delay-200">
          <p className="text-muted-foreground mb-2 font-semibold">
            Employers & Associations: Offer Real Value to Your People
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Custom plans available—help your employees or members save money while building loyalty
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/for-employers"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-border rounded-full font-semibold text-foreground hover:border-primary hover:text-primary transition-all"
            >
              For Employers
              <Icon name="BuildingOfficeIcon" size={18} />
            </Link>
            <Link
              href="/for-associations"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-border rounded-full font-semibold text-foreground hover:border-primary hover:text-primary transition-all"
            >
              For Associations
              <Icon name="UserGroupIcon" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}