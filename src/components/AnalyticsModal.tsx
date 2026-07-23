'use client';

import { useEffect, useState } from 'react';
import { X, BarChart3, Globe, Monitor, Search, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface AnalyticsData {
  link: {
    shortCode: string;
    originalUrl: string;
    createdAt: string;
  };
  totalClicks: number;
  dailyClicks: { date: string; clicks: number }[];
  devices: { name: string; value: number }[];
  countries: { name: string; value: number }[];
  browsers: { name: string; value: number }[];
  referers: { name: string; value: number }[];
}

interface Props {
  shortCode: string;
  onClose: () => void;
}

const COLORS = ['#0066b3', '#c8102e', '#8DA9C4', '#134074', '#0B2545'];

export default function AnalyticsModal({ shortCode, onClose }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [shortCode]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/${shortCode}`);
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-4xl w-full shadow-2xl">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin w-6 h-6 border-4 border-[#0066b3] border-t-transparent rounded-full" />
            <span className="text-gray-600">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-4xl w-full shadow-2xl text-center">
          <p className="text-gray-600">Failed to load analytics</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-900">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-5xl w-full shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Link Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-mono text-[#0066b3]">/{data.link.shortCode}</span>
              <span className="mx-2">•</span>
              <span className="truncate max-w-md inline-block">{data.link.originalUrl}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#0066b3]" />
              <span className="text-xs text-gray-600 font-medium">Total Clicks</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.totalClicks}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span className="text-xs text-gray-600 font-medium">Avg/Day</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data.dailyClicks.length ? Math.round(data.totalClicks / data.dailyClicks.length) : 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <span className="text-xs text-gray-600 font-medium">Countries</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.countries.length}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Monitor className="w-5 h-5 text-orange-600" />
              <span className="text-xs text-gray-600 font-medium">Devices</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.devices.length}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Clicks Bar Chart */}
          <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-[#0066b3]" />
              Clicks Over Time (Last 30 Days)
            </h4>
            {data.dailyClicks.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.dailyClicks}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="clicks" fill="#0066b3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No clicks data available
              </div>
            )}
          </div>

          {/* Device Pie Chart */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <Monitor className="w-4 h-4 mr-2 text-[#0066b3]" />
              Device Breakdown
            </h4>
            {data.devices.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.devices}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {data.devices.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                No device data
              </div>
            )}
          </div>

          {/* Top Countries */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-[#0066b3]" />
              Top Countries
            </h4>
            {data.countries.length > 0 ? (
              <div className="space-y-3">
                {data.countries.map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getCountryFlag(country.name)}</span>
                      <span className="text-sm text-gray-700">{country.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#0066b3] h-2 rounded-full"
                          style={{ width: `${(country.value / data.totalClicks) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-12 text-right">{country.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                No country data
              </div>
            )}
          </div>

          {/* Top Browsers */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <Search className="w-4 h-4 mr-2 text-[#0066b3]" />
              Top Browsers
            </h4>
            {data.browsers.length > 0 ? (
              <div className="space-y-3">
                {data.browsers.map((browser, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{browser.name}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#c8102e] h-2 rounded-full"
                          style={{ width: `${(browser.value / data.totalClicks) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-12 text-right">{browser.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                No browser data
              </div>
            )}
          </div>

          {/* Top Referers */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <Search className="w-4 h-4 mr-2 text-[#0066b3]" />
              Top Traffic Sources
            </h4>
            {data.referers.length > 0 ? (
              <div className="space-y-3">
                {data.referers.map((referer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate max-w-[200px]">{referer.name}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#134074] h-2 rounded-full"
                          style={{ width: `${(referer.value / data.totalClicks) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-12 text-right">{referer.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                No referer data
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function untuk country flags (simplified)
function getCountryFlag(countryCode: string): string {
  const flags: { [key: string]: string } = {
    'US': '🇺🇸', 'ID': '🇮🇩', 'GB': '🇬🇧', 'SG': '🇸🇬', 'MY': '🇲🇾',
    'AU': '🇦', 'JP': '🇯🇵', 'KR': '🇰', 'CN': '🇨🇳', 'IN': '🇮🇳',
    'DE': '🇩', 'FR': '🇫🇷', 'NL': '🇳', 'CA': '🇨🇦', 'BR': '🇧🇷',
    'unknown': '🌍'
  };
  return flags[countryCode] || '🌍';
}