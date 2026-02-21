import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import SignUpContent from './components/SignUpContent';

export const metadata: Metadata = {
  title: 'Sign Up | Discount Club Cayman',
  description: 'Join Discount Club Cayman and start saving money today. Choose your plan and get instant access.',
};

export default function SignUpPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <SignUpContent />
      </main>
      <Footer />
    </>
  );
}