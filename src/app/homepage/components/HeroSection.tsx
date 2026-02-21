'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function HeroSection() {
  const valueBullets = [
    {
      icon: 'GlobeAmericasIcon',
      text: 'Save up to 70% on travel',
      color: 'from-teal-400 to-cyan-500'
    },
    {
      icon: 'BuildingStorefrontIcon',
      text: 'Save 10–25% locally, all year',
      color: 'from-orange-400 to-pink-500'
    },
    {
      icon: 'TicketIcon',
      text: 'Redeem real dollar-value certificates',
      color: 'from-purple-400 to-indigo-500'
    }
  ];

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 -mt-24">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
        <div className="space-y-10 animate-fade-up">
          {/* Main Headline */}
          <h1 className="font-heading text-5xl md:text-7xl lg:text-6xl font-bold text-foreground leading-tight tracking-tighter animate-fade-up">
            Save on Travel. Save Locally. Save <br />Every Day.
          </h1>

          {/* Subhead */}
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-fade-up animation-delay-100">
            One membership that unlocks real savings on travel, everyday essentials, and redeemable certificates.
          </p>

          {/* Value Bullets */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-x-10 gap-y-6 py-4 animate-fade-up animation-delay-200">
            {valueBullets.map((bullet, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${bullet.color} text-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <Icon name={bullet.icon as any} size={24} />
                </div>
                <span className="text-lg font-semibold text-foreground">{bullet.text}</span>
              </div>
            ))}
          </div>

          {/* Digital Convenience Highlight */}
          <div className="relative py-6 animate-fade-up animation-delay-300">
            <div className="max-w-3xl mx-auto bg-slate-900 rounded-3xl shadow-2xl overflow-hidden p-1">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-[1.4rem] px-8 py-10">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-white">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon name="DevicePhoneMobileIcon" size={40} />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-2xl md:text-3xl font-bold text-white leading-tight">
                      No more cards to lose or forget.
                    </p>
                    <p className="text-xl md:text-2xl text-slate-300 mt-1">
                      Just open the app and <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1C4D8D] to-[#4988C4]">SWIPE</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-6 pt-4 animate-fade-up animation-delay-400">
            <Link
              href="/sign-up"
              className="px-8 py-4 bg-[#4988C4] text-primary-foreground rounded-full text-lg font-bold hover:bg-[#1C4D8D] transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center gap-2"
            >
              Join Now
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-slate-200 text-[#1C4D8D] border border-white rounded-full text-lg font-semibold hover:bg-white hover:border-[#1C4D8D] transition-all inline-flex items-center gap-2 backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>

          {/* Microcopy */}
          <p className="text-sm text-muted-foreground pt-4 animate-fade-up animation-delay-500">
            All savings are member-only. Full details visible after sign-in.
          </p>
        </div>
      </div>
    </section>
  );
}