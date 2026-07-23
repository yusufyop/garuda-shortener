'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  Link as LinkIcon, Copy, Check, Edit2, Trash2, 
  BarChart3, LogOut, User, Plane, Search, ExternalLink,
  AlertCircle, CheckCircle2, Clock, Tag
} from 'lucide-react';
import QRCodeDownload from '@/components/QRCodeDownload';
import EditLinkModal from '@/components/EditLinkModal';
import AnalyticsModal from '@/components/AnalyticsModal';



interface LinkItem {
  id: string;
  short_code: string;
  original_url: string;
  clicks: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  expires_at: string | null; // <-- PASTIKAN BARIS INI ADA
  is_active: boolean;
  health_status: number;
  last_health_check: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [qrLink, setQrLink] = useState<LinkItem | null>(null);
  const [analyticsShortCode, setAnalyticsShortCode] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
    fetchLinks();
  };

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (shortCode: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    const res = await fetch(`/api/links?shortCode=${shortCode}`, { method: 'DELETE' });
    if (res.ok) fetchLinks();
  };

  // Ambil semua unique tags
  const allTags = Array.from(new Set(links.flatMap(link => link.tags || [])));

  // Filter links
  const filteredLinks = links.filter(link => {
    const matchSearch = 
      link.short_code.toLowerCase().includes(search.toLowerCase()) ||
      link.original_url.toLowerCase().includes(search.toLowerCase()) ||
      (link.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchTag = !selectedTag || (link.tags || []).includes(selectedTag);
    
    return matchSearch && matchTag;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  const getHealthStatusInfo = (status: number | null, isActive: boolean) => {
    if (!isActive) return { label: 'Inactive', color: 'text-gray-500', icon: AlertCircle };
    if (!status || status === 0) return { label: 'Unchecked', color: 'text-gray-400', icon: Clock };
    if (status >= 200 && status < 300) return { label: 'Healthy', color: 'text-green-400', icon: CheckCircle2 };
    if (status === 404) return { label: 'Broken (404)', color: 'text-red-400', icon: AlertCircle };
    return { label: `Status ${status}`, color: 'text-yellow-400', icon: AlertCircle };
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2444] to-[#1a3a6c] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#0066b3] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2444] to-[#1a3a6c] relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0066b3] rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#c8102e] rounded-full blur-[120px] opacity-10" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-[#0a1628]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066b3] to-[#004d8c] flex items-center justify-center border border-white/10">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Garuda Shorten</h1>
                <p className="text-xs text-[#8DA9C4]">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-[#8DA9C4]">
                <User className="w-4 h-4" />
                <span className="truncate max-w-[150px]">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-[#c8102e]/20 border border-white/10 hover:border-[#c8102e]/50 rounded-lg text-white text-sm transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header dengan Tombol Buat Baru */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">My Links</h2>
            <p className="text-[#8DA9C4] font-light">Manage and track all your shortened URLs.</p>
          </div>
          <a 
            href="/" 
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-[#0066b3] to-[#0077cc] hover:from-[#0077cc] hover:to-[#0088dd] text-white font-semibold rounded-xl shadow-lg shadow-[#0066b3]/30 transition-all transform hover:-translate-y-0.5"
          >
            <LinkIcon className="w-5 h-5" />
            <span>Create New Link</span>
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0f1f3d]/60 backdrop-blur border border-white/10 rounded-xl p-5">
            <p className="text-xs text-[#8DA9C4] uppercase tracking-wider mb-1">Total Links</p>
            <p className="text-3xl font-bold text-white">{links.length}</p>
          </div>
          <div className="bg-[#0f1f3d]/60 backdrop-blur border border-white/10 rounded-xl p-5">
            <p className="text-xs text-[#8DA9C4] uppercase tracking-wider mb-1">Total Clicks</p>
            <p className="text-3xl font-bold text-[#0066b3]">{links.reduce((sum, l) => sum + l.clicks, 0)}</p>
          </div>
          <div className="bg-[#0f1f3d]/60 backdrop-blur border border-white/10 rounded-xl p-5">
            <p className="text-xs text-[#8DA9C4] uppercase tracking-wider mb-1">Active Links</p>
            <p className="text-3xl font-bold text-green-400">{links.filter(l => l.is_active && !isExpired(l.expires_at)).length}</p>
          </div>
          <div className="bg-[#0f1f3d]/60 backdrop-blur border border-white/10 rounded-xl p-5">
            <p className="text-xs text-[#8DA9C4] uppercase tracking-wider mb-1">Broken Links</p>
            <p className="text-3xl font-bold text-red-400">{links.filter(l => l.health_status === 404).length}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8DA9C4]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search links, destinations, or tags..."
              className="w-full pl-12 pr-4 py-3 bg-[#0f1f3d]/60 backdrop-blur border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#0066b3] focus:ring-2 focus:ring-[#0066b3]/30 transition-all"
            />
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <Tag className="w-4 h-4 text-[#8DA9C4] shrink-0" />
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  !selectedTag 
                    ? 'bg-[#0066b3] text-white' 
                    : 'bg-white/5 text-[#8DA9C4] hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    selectedTag === tag
                      ? 'bg-[#0066b3] text-white'
                      : 'bg-white/5 text-[#8DA9C4] hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Links List */}
        {filteredLinks.length === 0 ? (
          <div className="bg-[#0f1f3d]/60 backdrop-blur border border-white/10 rounded-2xl p-12 text-center">
            <LinkIcon className="w-16 h-16 text-[#8DA9C4]/30 mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-2">No links found</p>
            <p className="text-[#8DA9C4] text-sm mb-6 font-light">Create your first short link from the homepage.</p>
            <a href="/" className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0066b3] hover:bg-[#0077cc] text-white rounded-lg transition-all">
              <span>Create New Link</span>
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLinks.map((link) => {
              const shortUrl = `${window.location.origin}/${link.short_code}`;
              const healthInfo = getHealthStatusInfo(link.health_status, link.is_active);
              const expired = isExpired(link.expires_at);
              const HealthIcon = healthInfo.icon;

              return (
                <div 
                  key={link.id} 
                  className={`bg-[#0f1f3d]/60 backdrop-blur border rounded-xl p-5 hover:border-[#0066b3]/30 transition-all group ${
                    !link.is_active || expired ? 'opacity-60 border-red-500/30' : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-bold text-[#0066b3] font-mono">/{link.short_code}</span>
                        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-[#8DA9C4] hover:text-white transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        {/* Health Status Badge */}
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium ${healthInfo.color} bg-white/5`}>
                          <HealthIcon className="w-3 h-3" />
                          <span>{healthInfo.label}</span>
                        </span>
                        {/* Expired Badge */}
                        {expired && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium text-red-400 bg-red-500/10">
                            <Clock className="w-3 h-3" />
                            <span>Expired</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/70 truncate mb-2">{link.original_url}</p>
                      
                      {/* Tags */}
                      {link.tags && link.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {link.tags.map((tag, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 bg-[#0066b3]/20 text-[#8DA9C4] text-[10px] font-medium rounded border border-[#0066b3]/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-[#8DA9C4]">
                        <span>Created: {formatDate(link.created_at)}</span>
                        {link.updated_at !== link.created_at && (
                          <span>Updated: {formatDate(link.updated_at)}</span>
                        )}
                        {link.expires_at && (
                          <span className={expired ? 'text-red-400' : ''}>
                            Expires: {formatDate(link.expires_at)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center space-x-6 lg:space-x-8">
                      <div className="text-center">
                        <div className="flex items-center space-x-1 justify-center text-[#8DA9C4] mb-1">
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span className="text-xs">Clicks</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{link.clicks}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setAnalyticsShortCode(link.short_code)}
                          className="p-2.5 bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-500/50 rounded-lg text-white transition-all" 
                          title="View Analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setQrLink(link)}
                          className="p-2.5 bg-white/5 hover:bg-[#0066b3]/20 border border-white/10 hover:border-[#0066b3]/50 rounded-lg text-white transition-all" 
                          title="Export QR"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleCopy(shortUrl, link.id)}
                          className="p-2.5 bg-white/5 hover:bg-[#0066b3]/20 border border-white/10 hover:border-[#0066b3]/50 rounded-lg text-white transition-all" 
                          title="Copy"
                        >
                          {copiedId === link.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => setEditingLink(link)}
                          className="p-2.5 bg-white/5 hover:bg-[#0066b3]/20 border border-white/10 hover:border-[#0066b3]/50 rounded-lg text-white transition-all" 
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(link.short_code)}
                          className="p-2.5 bg-white/5 hover:bg-[#c8102e]/20 border border-white/10 hover:border-[#c8102e]/50 rounded-lg text-white transition-all" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {editingLink && (
        <EditLinkModal
          link={editingLink}
          onClose={() => setEditingLink(null)}
          onSave={() => { fetchLinks(); setEditingLink(null); }}
        />
      )}
      {qrLink && (
        <QRCodeDownload
          url={`${window.location.origin}/${qrLink.short_code}`}
          onClose={() => setQrLink(null)}
        />
      )}
      {analyticsShortCode && (
        <AnalyticsModal
          shortCode={analyticsShortCode}
          onClose={() => setAnalyticsShortCode(null)}
        />
      )}
    </main>
  );
}