import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { UAParser } from 'ua-parser-js';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  // 1. Validasi format shortCode
  if (!shortCode || !/^[a-zA-Z0-9-]+$/.test(shortCode)) {
    return NextResponse.json({ error: 'Invalid short code' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // 2. Ambil data link
  const { data: link, error } = await supabase
    .from('links')
    .select('*')
    .eq('short_code', shortCode)
    .single();

  if (error || !link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  // 3. Cek status aktif & expired
  // Kita cast ke 'any' agar TypeScript tidak error saat mengakses kolom dinamis
  const linkData = link as any;

  if (linkData.is_active === false) {
    return NextResponse.json({ error: 'Link is inactive' }, { status: 410 });
  }
  
  if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Link has expired' }, { status: 410 });
  }

  // 4. Jalankan Tracking (Fire & Forget)
  // Kita kirim linkData.id dan linkData.clicks sebagai parameter agar aman dari error TS
  trackClickAsync(linkData.id, linkData.clicks, request);

  // 5. Redirect ke URL tujuan
  return NextResponse.redirect(linkData.original_url, 301);
}

// Fungsi Tracking Async
// Tambahkan parameter 'currentClicks' di sini
async function trackClickAsync(linkId: string, currentClicks: number, request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const headers = request.headers;

    // Parsing User Agent
    const uaString = headers.get('user-agent') || '';
    const parser = new UAParser(uaString);
    const device = parser.getDevice().type || 'desktop';
    const browser = parser.getBrowser().name || 'unknown';

    // Ambil info Country & Referer
    const country = headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry') || 'unknown';
    const referer = headers.get('referer') || 'direct';

    // A. Insert data detail ke tabel 'link_clicks'
    await supabase.from('link_clicks').insert({
      link_id: linkId,
      country,
      device,
      browser,
      referer
    });

    // B. Update total counter di tabel 'links'
    // Sekarang kita pakai variabel 'currentClicks' yang sudah aman dari error TypeScript
    await supabase
      .from('links')
      .update({ clicks: (currentClicks || 0) + 1 })
      .eq('id', linkId);

  } catch (error) {
    // Jika tracking gagal, kita diamkan saja agar tidak mengganggu redirect
    console.error('Analytics tracking failed:', error);
  }
}