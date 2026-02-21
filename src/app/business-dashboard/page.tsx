import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BusinessDashboardContent from './components/BusinessDashboardContent';

export const metadata: Metadata = {
  title: 'Business Dashboard | Discount Club Cayman',
  description: 'Manage your business offers, certificates, and view analytics.',
};

export default function BusinessDashboardPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <BusinessDashboardContent />
      </main>
      <Footer />
    </>
  );
}