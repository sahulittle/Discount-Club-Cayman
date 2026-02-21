import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import MemberDashboardContent from './components/MemberDashboardContent';

export const metadata: Metadata = {
  title: 'Member Dashboard | Discount Club Cayman',
  description: 'Access your digital membership card, saved discounts, and account settings.',
};

export default function MemberDashboardPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <MemberDashboardContent />
      </main>
      <Footer />
    </>
  );
}