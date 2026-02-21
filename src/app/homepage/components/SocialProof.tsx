import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function SocialProof() {
  const stats = [
  { id: 'stat_travel', value: 'Up to 70%', label: 'Travel Savings' },
  { id: 'stat_local', value: 'Up to 25%', label: 'Local Discounts' },
  { id: 'stat_certificates', value: '$2,000', label: 'Redeemable Certificates' }];


  const testimonials = [
  {
    id: 'testimonial_1',
    name: 'Sarah Thompson',
    role: 'Family of 4',
    image: "https://images.unsplash.com/photo-1730222168387-051038de25be",
    alt: 'Woman with blonde hair smiling at camera in bright daylight',
    quote: "We saved $630 on one hotel stay alone. Between travel and local discounts, this membership has already paid for itself 10 times over.",
    savings: 'Saved $4,200 this year'
  },
  {
    id: 'testimonial_2',
    name: 'Marcus Johnson',
    role: 'Young Professional',
    image: "https://images.unsplash.com/photo-1673606040964-cb3f12ccd9b3",
    alt: 'Man in blue shirt smiling outdoors with natural background',
    quote: 'The local discounts on dining and services add up incredibly fast. With the cost of living in Cayman, this membership is a no-brainer.',
    savings: 'Saved $2,800 this year'
  },
  {
    id: 'testimonial_3',
    name: 'Linda Martinez',
    role: 'Small Business Owner',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f225624a-1763293838525.png",
    alt: 'Woman with dark hair in professional attire smiling warmly',
    quote: 'The redeemable certificates are real spending power. I use them for business expenses and personal purchases. Genuine value.',
    savings: 'Saved $3,400 this year'
  }];


  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 animate-fade-up">
          {stats?.map((stat) =>
          <div key={stat?.id} className="text-center">
              <p className="text-5xl md:text-6xl font-heading font-bold text-primary mb-2">
                {stat?.value}
              </p>
              <p className="text-lg text-muted-foreground">{stat?.label}</p>
            </div>
          )}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12 animate-fade-up animation-delay-100">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real Members, Real Savings
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of Cayman residents who are saving money every day.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 animate-fade-up animation-delay-200">
          {testimonials?.map((testimonial) =>
          <div
            key={testimonial?.id}
            className="bg-muted rounded-2xl p-8 hover:shadow-lg transition-all duration-300">

              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <AppImage
                  src={testimonial?.image}
                  alt={testimonial?.alt}
                  className="w-full h-full object-cover" />

                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial?.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial?.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)]?.map((_, i) =>
              <Icon key={`star_${testimonial?.id}_${i}`} name="StarIcon" size={16} className="text-yellow-500" variant="solid" />
              )}
              </div>

              <p className="text-muted-foreground italic mb-4 leading-relaxed">
                "{testimonial?.quote}"
              </p>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Annual Savings</p>
                <p className="text-2xl font-heading font-bold text-primary">
                  {testimonial?.savings}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}