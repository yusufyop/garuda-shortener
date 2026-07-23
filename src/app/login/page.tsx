'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, Plane } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) throw error;
        setMessage('Account created successfully. Please check your email to verify.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2444] to-[#1a3a6c]" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0066b3] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#c8102e] rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066b3] to-[#004d8c] shadow-2xl mb-4 border border-white/10">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Garuda Shorten</h1>
          <p className="text-[#8DA9C4] text-sm font-light">Access your link management dashboard</p>
        </div>

        <div className="bg-[#0f1f3d]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex bg-black/30 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}
              className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${isLogin ? 'bg-[#0066b3] text-white shadow-lg' : 'text-[#8DA9C4] hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}
              className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${!isLogin ? 'bg-[#0066b3] text-white shadow-lg' : 'text-[#8DA9C4] hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8DA9C4] mb-2 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8DA9C4]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0066b3] focus:ring-2 focus:ring-[#0066b3]/30 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8DA9C4] mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8DA9C4]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-11 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0066b3] focus:ring-2 focus:ring-[#0066b3]/30 transition-all"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8DA9C4] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[#c8102e]/20 border border-[#c8102e]/50 text-[#ff6b7a] text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-300 text-sm px-4 py-3 rounded-lg">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#0066b3] to-[#0077cc] hover:from-[#0077cc] hover:to-[#0088dd] text-white font-semibold rounded-lg shadow-lg shadow-[#0066b3]/30 hover:shadow-[#0066b3]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-[#8DA9C4] hover:text-white transition-colors">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}