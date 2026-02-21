import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import LoginContent from './components/LoginContent';

export const metadata: Metadata = {
  title: 'Login | Discount Club Cayman',
  description: 'Log in to your Discount Club Cayman account to access exclusive discounts and your digital membership card.',
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <LoginContent />
      </main>
      <Footer />
    </>
  );
}