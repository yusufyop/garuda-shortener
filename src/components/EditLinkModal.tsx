'use client';

import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface LinkItem {
  id: string;
  short_code: string;
  original_url: string;
  clicks: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  link: LinkItem;
  onClose: () => void;
  onSave: () => void;
}

export default function EditLinkModal({ link, onClose, onSave }: Props) {
  const formatForInput = (isoString: string | null) => {
  if (!isoString) return '';
  return isoString.slice(0, 16); // Ambil YYYY-MM-DDTHH:mm
};
  const [originalUrl, setOriginalUrl] = useState(link.original_url);
const [newShortCode, setNewShortCode] = useState(link.short_code);
const [expiresAt, setExpiresAt] = useState(formatForInput(link.expires_at)); // Tambahkan ini
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
  

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: link.id, 
          originalUrl, 
          newShortCode: newShortCode !== link.short_code ? newShortCode : undefined,
          newExpiresAt: expiresAt || null // Kirim null jika user menghapus tanggal
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      onSave();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#0f1f3d] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white tracking-tight">Edit Link</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-[#8DA9C4] hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8DA9C4] mb-2 uppercase tracking-wider">Short Code</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8DA9C4] font-mono text-sm">/</span>
              <input
                type="text"
                value={newShortCode}
                onChange={(e) => setNewShortCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                className="w-full pl-8 pr-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-[#0066b3] focus:ring-2 focus:ring-[#0066b3]/30 transition-all"
                placeholder="custom-link"
              />
            </div>
            <p className="text-xs text-white/40 mt-1.5">3-20 characters. Alphanumeric and hyphens (-) only.</p>
          </div>

          <div>
  <label className="block text-xs font-medium text-[#8DA9C4] mb-2 uppercase tracking-wider">
    Expiration Date <span className="text-white/40 normal-case tracking-normal">(Optional)</span>
  </label>
  <input
    type="datetime-local"
    value={expiresAt}
    onChange={(e) => setExpiresAt(e.target.value)}
    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0066b3] focus:ring-2 focus:ring-[#0066b3]/30 transition-all [color-scheme:dark]"
  />
  <p className="text-xs text-white/40 mt-1.5">Leave blank for no expiration.</p>
</div>

          <div>
            <label className="block text-xs font-medium text-[#8DA9C4] mb-2 uppercase tracking-wider">Destination URL</label>
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0066b3] focus:ring-2 focus:ring-[#0066b3]/30 transition-all"
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-[#8DA9C4] space-y-1">
            <p>• Current clicks: <span className="text-white font-semibold">{link.clicks}</span> (will not be reset)</p>
            <p>• Created on: {new Date(link.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>

          {error && (
            <div className="bg-[#c8102e]/20 border border-[#c8102e]/50 text-[#ff6b7a] text-sm px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3 bg-[#0066b3] hover:bg-[#0077cc] disabled:opacity-50 text-white rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}