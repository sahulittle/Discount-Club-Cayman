'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useAuth } from '@/contexts/AuthContext';
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  // Public menu (not logged in)
  const publicNavLinks = [
    { href: '/homepage', label: 'Home' },
    { href: '/for-individuals', label: 'For Individuals' },
    { href: '/for-employers', label: 'For Employers' },
    { href: '/for-businesses', label: 'For Businesses' },
    { href: '/for-associations', label: 'For Associations' },
    { href: '/categories', label: 'Categories' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
  ];

  // Member menu (logged in)
  const memberNavLinks = [
    { href: '/member-dashboard', label: 'Home' },
    { href: '/travel', label: 'Travel' },
    { href: '/discounts', label: 'Discounts' },
    { href: '/certificates', label: 'Certificates' },
    { href: '/categories', label: 'Categories' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
  ];

  const navLinks = user ? memberNavLinks : publicNavLinks;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/homepage');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200' : 'bg-white/80 backdrop-blur-sm'
        }`}
    >
      <div className="max-w-7xl h-[89px] mx-auto px-4">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href={user ? '/member-dashboard' : '/homepage'} className="flex items-center gap-3 -ml-4">
            <AppImage
              src="/assets/images/logo_resent.png"
              alt="Discount Club Cayman Logo"
              className="w-52 h-52 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors relative group py-2 ${isActive(link.href)
                    ? 'text-[#1C4D8D]' : 'text-slate-600 hover:text-[#1C4D8D]'
                  }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1C4D8D] rounded-full" />
                )}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1C4D8D] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {loading ? (
              <div className="w-6 h-6 border-2 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <>
                <Link
                  href="/member-dashboard"
                  className="text-sm font-semibold text-slate-700 hover:text-[#1C4D8D] transition-colors flex items-center gap-2"
                >
                  <Icon name="UserCircleIcon" size={20} />
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-5 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold hover:bg-slate-200 hover:text-slate-900 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-[#1C4D8D] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/membership"
                  className="px-5 py-2.5 bg-[#1C4D8D] text-white rounded-full text-sm font-bold hover:bg-[#1C4D8D]/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-800"
            aria-label="Toggle menu"
          >
            <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-slate-200">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-base font-semibold transition-colors ${isActive(link.href)
                      ? 'text-white bg-[#1C4D8D]' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-4 pt-6 mt-4 border-t border-slate-200">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-[#1C4D8D] border-t-transparent rounded-full animate-spin mx-auto" />
                ) : user ? (
                  <>
                    <Link
                      href="/member-dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-3"
                    >
                      <Icon name="UserCircleIcon" size={20} />
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-lg text-base font-semibold hover:bg-slate-200 transition-all text-center"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full px-6 py-3 border-2 border-slate-200 rounded-lg text-base font-semibold hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all text-center"
                    >
                      Login
                    </Link>
                    <Link
                      href="/membership"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full px-6 py-3 bg-[#1C4D8D] text-white rounded-lg text-base font-semibold hover:bg-[#1C4D8D]/90 transition-all shadow-md text-center"
                    >
                      Join Now
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}