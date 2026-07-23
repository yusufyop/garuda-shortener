'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Link as LinkIcon, Copy, Check, AlertCircle, 
  BarChart3, RefreshCw, Plane, User, LogOut, LogIn
} from 'lucide-react';
import QRCodeDownload from '@/components/QRCodeDownload';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string; clicks: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrLink, setQrLink] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
  originalUrl, 
  customAlias, 
  tags: tags.split(',').map(t => t.trim()).filter(Boolean),
  expiresAt: expiresAt || null // Kirim null jika kosong
}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to shorten URL');
      setResult({ shortUrl: data.shortUrl, shortCode: data.shortCode, clicks: data.clicks });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#051923] via-[#0B2545] to-[#134074]" />
      <div className="absolute top-[-50px] left-[-50px] w-[300px] h-[300px] bg-[#0066b3] rounded-full blur-[100px] opacity-30 animate-float" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#c8102e] rounded-full blur-[120px] opacity-20 animate-float-delayed" />
      <div className="absolute top-[40%] left-[60%] w-[200px] h-[200px] bg-[#8DA9C4] rounded-full blur-[80px] opacity-15 animate-float-slow" />

      <nav className="relative z-10 border-b border-white/10 bg-[#051923]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066b3] to-[#004d8c] flex items-center justify-center shadow-lg border border-white/10">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Garuda Shorten</h1>
                <p className="text-xs text-[#8DA9C4] tracking-wide">Premium Link Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <a href="/dashboard" className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-all">
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </a>
                  <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 bg-[#c8102e]/20 hover:bg-[#c8102e]/30 border border-[#c8102e]/50 rounded-lg text-white text-sm transition-all">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <a href="/login" className="flex items-center space-x-2 px-4 py-2 bg-[#0066b3] hover:bg-[#0077cc] rounded-lg text-white text-sm font-semibold transition-all shadow-lg shadow-[#0066b3]/30">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-[#8DA9C4] font-medium tracking-wide">Production Ready • v3.0</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight tracking-tight">
            Shorten Your Links<br />
            <span className="bg-gradient-to-r from-[#0066b3] to-[#8DA9C4] bg-clip-text text-transparent">with Precision</span>
          </h2>
          <p className="text-[#8DA9C4] text-base sm:text-lg max-w-xl mx-auto font-light">
            Transform lengthy URLs into concise, professional, and trackable links.
          </p>
        </div>

        <div className="bg-[#0f1f3d]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4 flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-white border-b-2 border-[#0066b3] pb-4 -mb-4">
              <LinkIcon className="w-5 h-5" />
              <span className="font-semibold text-sm tracking-wide">Shorten URL</span>
            </div>
            <a href="/dashboard" className="flex items-center space-x-2 text-[#8DA9C4] hover:text-white transition-colors pb-4 -mb-4">
              <BarChart3 className="w-5 h-5" />
              <span className="font-semibold text-sm tracking-wide">My Links</span>
            </a>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#8DA9C4] mb-2 uppercase tracking-wider">Destination URL</label>
              <div className="relative">
                <input 
                  type="url" 
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url..." 
                  required
                  className={`w-full px-4 py-3.5 bg-black/30 border text-white placeholder-white/30 focus:outline-none transition-all rounded-lg ${error ? 'border-[#c8102e] animate-shake' : 'border-white/10 focus:border-[#0066b3] focus:ring-2 focus:ring-[#0066b3]/30'}`}
                />
              </div>
              {error && (
                <div className="mt-2 text-[#ff6b7a] text-xs font-medium flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8DA9C4] mb-2 uppercase tracking-wider">
                Custom Alias <span className="text-white/40 normal-case tracking-normal">(Optional)</span>
              </label>
              <input 
                type="text" 
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                placeholder="e.g., annual-report" 
                className="w-full px-4 py-3.5 bg-black/30 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0066b3] focus:ring-2 focus:ring-[#0066b3]/30 transition-all rounded-lg"
              />
              <p className="text-xs text-white/40 mt-2">Leave blank to generate a random 5-character string.</p>
            </div>


            <div>
  <label className="block text-xs font-medium text-[#8DA9C4] mb-2 uppercase tracking-wider">
    Expiration Date <span className="text-white/40 normal-case tracking-normal">(Optional)</span>
  </label>
  {/* [color-scheme:dark] membuat kalender popup menjadi gelap */}
  <input 
    type="datetime-local" 
    value={expiresAt}
    onChange={(e) => setExpiresAt(e.target.value)}
    className="w-full px-4 py-3.5 bg-black/30 border border-white/10 text-white focus:outline-none focus:border-[#0066b3] focus:ring-2 focus:ring-[#0066b3]/30 transition-all rounded-lg [color-scheme:dark]"
  />
  <p className="text-xs text-white/40 mt-2">Link will automatically deactivate after this time.</p>
</div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#0066b3] to-[#0077cc] hover:from-[#0077cc] hover:to-[#0088dd] text-white font-semibold rounded-lg shadow-lg shadow-[#0066b3]/30 hover:shadow-[#0066b3]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LinkIcon className="w-5 h-5" />
                  <span>Shorten URL</span>
                </>
              )}
            </button>
            <div>
  <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
    Tags <span className="text-gray-400 normal-case tracking-normal">(Optional, pisahkan dengan koma)</span>
  </label>
  <input 
    type="text" 
    value={tags}
    onChange={(e) => setTags(e.target.value)}
    placeholder="marketing, social-media, q3-report" 
    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066b3] focus:ring-2 focus:ring-[#0066b3]/20 transition-all rounded-lg"
  />
</div>
          </form>
        </div>

        {result && (
          <div className="mt-6 bg-[#0f1f3d]/80 backdrop-blur-xl border border-white/10 border-l-4 border-l-[#0066b3] rounded-2xl p-6 sm:p-8 shadow-2xl animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex-1 w-full">
                <p className="text-xs text-[#8DA9C4] uppercase tracking-wider font-semibold mb-2">Shortened Link</p>
                <div className="flex items-center space-x-2 bg-black/30 rounded-lg p-1 border border-white/10">
                  <input 
                    type="text" 
                    readOnly 
                    value={result.shortUrl}
                    className="bg-transparent text-white text-sm sm:text-base px-3 py-2.5 w-full focus:outline-none font-mono"
                  />
                  <button 
                    onClick={handleCopy}
                    className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all flex items-center space-x-1 shrink-0 ${copied ? 'bg-green-600 text-white' : 'bg-[#0066b3] hover:bg-[#0077cc] text-white'}`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setQrLink(result.shortUrl)}
                className="bg-white p-3 rounded-xl shrink-0 shadow-lg hover:scale-105 transition-transform group"
                title="Export QR Code"
              >
                <QRCodeSVG 
                  value={result.shortUrl} 
                  size={80} 
                  fgColor="#051923" 
                  bgColor="transparent" 
                  level="H"
                  includeMargin={false}
                />
              </button>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#0066b3]/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-[#0066b3]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Total Clicks</p>
                    <p className="text-xs text-[#8DA9C4]">Real-time analytics</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{result.clicks}</span>
                  <span className="text-xs text-[#8DA9C4] block">clicks</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="mt-8 bg-gradient-to-r from-[#0066b3]/20 to-[#c8102e]/20 backdrop-blur border border-white/10 rounded-2xl p-6 sm:p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Unlock Full Potential</h3>
            <p className="text-[#8DA9C4] text-sm mb-4 font-light">Manage link history, update destinations, and export high-resolution QR codes.</p>
            <a href="/login" className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0066b3] hover:bg-[#0077cc] text-white rounded-lg font-semibold transition-all shadow-lg">
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </a>
          </div>
        )}
      </div>

      <footer className="relative z-10 mt-12 text-center text-[#8DA9C4] text-xs pb-8 tracking-wide">
        <p>&copy; 2026 Garuda Shorten. Powered by Next.js & Supabase.</p>
      </footer>

      {qrLink && <QRCodeDownload url={qrLink} onClose={() => setQrLink(null)} />}

      <style jsx global>{`
        @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, -20px); } }
        @keyframes float-delayed { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-20px, 20px); } }
        @keyframes float-slow { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(10px, 10px); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        .animate-float { animation: float 10s infinite ease-in-out; }
        .animate-float-delayed { animation: float-delayed 12s infinite ease-in-out; }
        .animate-float-slow { animation: float-slow 15s infinite ease-in-out; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </main>
  );


  
  
}