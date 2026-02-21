import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BrowseDiscountsContent from './components/BrowseDiscountsContent';

export const metadata: Metadata = {
  title: 'Browse Discounts | Discount Club Cayman',
  description: 'Explore 150+ exclusive discounts across Cayman. Filter by category, location, and deal type to find the best savings.',
};

export default function BrowseDiscountsPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <BrowseDiscountsContent />
      </main>
      <Footer />
    </>
  );
}