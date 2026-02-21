'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock credential validation
    const validCredentials = {
      member: { email: 'member@example.com', password: 'member123' },
      business: { email: 'business@example.com', password: 'business123' },
      employer: { email: 'employer@example.com', password: 'employer123' },
      association: { email: 'association@example.com', password: 'association123' },
      admin: { email: 'admin@example.com', password: 'admin123' },
    };

    const isValid = Object.values(validCredentials).some(
      (cred) => cred.email === email && cred.password === password
    );

    if (isValid) {
      // Redirect based on user type
      if (email === validCredentials.member.email) window.location.href = '/member-dashboard';
      else if (email === validCredentials.business.email) window.location.href = '/business-dashboard';
      else if (email === validCredentials.employer.email) window.location.href = '/employer-dashboard';
      else if (email === validCredentials.association.email) window.location.href = '/association-dashboard';
      else if (email === validCredentials.admin.email) window.location.href = '/admin-dashboard';
    } else {
      setError('Invalid email or password. Try: member@example.com / member123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-6">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-100"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 animate-fade-up">
          <div className="w-16 h-16 bg-[#1C4D8D] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-white font-bold text-3xl">D</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-500">Log in to access your account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl animate-fade-up animation-delay-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <Icon name="ExclamationCircleIcon" size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#1C4D8D] border-slate-300 rounded focus:ring-[#1C4D8D]"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Remember me</span>
              </label>

              <Link
                href="#"
                className="text-sm text-[#1C4D8D] hover:text-blue-700 hover:underline font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold text-lg hover:bg-[#1C4D8D]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Log In
              <Icon name="ArrowRightIcon" size={20} />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <button className="mt-6 w-full px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-[#1C4D8D] hover:text-[#1C4D8D] hover:bg-blue-50/50 transition-all flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link href="/sign-up" className="text-[#1C4D8D] hover:underline font-bold">
              Join now
            </Link>
          </p>
        </div>

        {/* Mock Credentials Info */}
        <div className="mt-8 p-6 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl shadow-sm animate-fade-up animation-delay-200">
          <p className="text-xs text-slate-500 text-center mb-3 font-bold uppercase tracking-wider">
            Demo Credentials
          </p>
          <div className="space-y-2 text-xs text-slate-600 font-mono bg-slate-100/50 p-4 rounded-xl border border-slate-200/50">
            <div className="flex justify-between"><span>Member:</span> <span className="text-slate-800">member@example.com / member123</span></div>
            <div className="flex justify-between"><span>Business:</span> <span className="text-slate-800">business@example.com / business123</span></div>
            <div className="flex justify-between"><span>Employer:</span> <span className="text-slate-800">employer@example.com / employer123</span></div>
            <div className="flex justify-between"><span>Association:</span> <span className="text-slate-800">association@example.com / association123</span></div>
            <div className="flex justify-between"><span>Admin:</span> <span className="text-slate-800">admin@example.com / admin123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}