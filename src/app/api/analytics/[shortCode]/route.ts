import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;
  const supabase = await createServerSupabaseClient();

  // 1. Ambil ID link berdasarkan shortCode
  const { data: link, error: linkError } = await supabase
    .from('links')
    .select('id, short_code, original_url, created_at')
    .eq('short_code', shortCode)
    .single();

  if (linkError || !link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  // 2. Ambil total clicks dari tabel link_clicks
  const { count: totalClicks } = await supabase
    .from('link_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('link_id', link.id);

  // 3. Ambil data klik per hari (30 hari terakhir)
  const { data: dailyClicks } = await supabase
    .from('link_clicks')
    .select('clicked_at')
    .eq('link_id', link.id)
    .gte('clicked_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('clicked_at', { ascending: true });

  // Group by date
  const clicksByDate: { [key: string]: number } = {};
  dailyClicks?.forEach((click: any) => {
    const date = new Date(click.clicked_at).toISOString().split('T')[0];
    clicksByDate[date] = (clicksByDate[date] || 0) + 1;
  });

  const dailyChartData = Object.entries(clicksByDate).map(([date, clicks]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    clicks
  }));

  // 4. Ambil breakdown Device
  const { data: deviceData } = await supabase
    .from('link_clicks')
    .select('device')
    .eq('link_id', link.id);

  const deviceCount: { [key: string]: number } = {};
  deviceData?.forEach((click: any) => {
    const device = click.device || 'unknown';
    deviceCount[device] = (deviceCount[device] || 0) + 1;
  });

  const deviceChartData = Object.entries(deviceCount).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // 5. Ambil breakdown Country
  const { data: countryData } = await supabase
    .from('link_clicks')
    .select('country')
    .eq('link_id', link.id);

  const countryCount: { [key: string]: number } = {};
  countryData?.forEach((click: any) => {
    const country = click.country || 'Unknown';
    countryCount[country] = (countryCount[country] || 0) + 1;
  });

  const countryChartData = Object.entries(countryCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 countries

  // 6. Ambil breakdown Browser
  const { data: browserData } = await supabase
    .from('link_clicks')
    .select('browser')
    .eq('link_id', link.id);

  const browserCount: { [key: string]: number } = {};
  browserData?.forEach((click: any) => {
    const browser = click.browser || 'unknown';
    browserCount[browser] = (browserCount[browser] || 0) + 1;
  });

  const browserChartData = Object.entries(browserCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 browsers

  // 7. Ambil breakdown Referer
  const { data: refererData } = await supabase
    .from('link_clicks')
    .select('referer')
    .eq('link_id', link.id);

  const refererCount: { [key: string]: number } = {};
  refererData?.forEach((click: any) => {
    const referer = click.referer || 'direct';
    refererCount[referer] = (refererCount[referer] || 0) + 1;
  });

  const refererChartData = Object.entries(refererCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 referers

  return NextResponse.json({
    link: {
      shortCode: link.short_code,
      originalUrl: link.original_url,
      createdAt: link.created_at
    },
    totalClicks: totalClicks || 0,
    dailyClicks: dailyChartData,
    devices: deviceChartData,
    countries: countryChartData,
    browsers: browserChartData,
    referers: refererChartData
  });
}