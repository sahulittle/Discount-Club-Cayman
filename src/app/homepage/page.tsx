import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import HeroSection from './components/HeroSection';
import TravelSavings from './components/TravelSavings';
import LocalSavings from './components/LocalSavings';
import RedeemableCertificates from './components/RedeemableCertificates';
import RollUpSection from './components/RollUpSection';
import FinalCTA from './components/FinalCTA';

export const metadata: Metadata = {
  title: 'Discount Club Cayman | Save Up to 70% on Travel + 25% Locally',
  description: 'Beat the rising cost of living. Access member-only hotel rates up to 70% off, local discounts up to 25%, plus $2,000 in redeemable certificates. Join now.',
};

export default function Homepage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <HeroSection />
        <TravelSavings />
        <LocalSavings />
        <RedeemableCertificates />
        <RollUpSection />
        <FinalCTA />
      </main>
    </>
  );
}