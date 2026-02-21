import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import PricingContent from './components/PricingContent';

export const metadata: Metadata = {
  title: 'Pricing | Discount Club Cayman',
  description: 'Choose the membership plan that fits your needs. Individual and Family plans available with unlimited savings.',
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <PricingContent />
      </main>
      <Footer />
    </>
  );
}