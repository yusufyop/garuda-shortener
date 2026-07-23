import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';



function generateRandomAlias(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { originalUrl, customAlias, tags, expiresAt } = await request.json();
    

    // Validasi URL
    let parsedUrl;
    try {
      parsedUrl = new URL(originalUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({ error: 'Format URL tidak valid. Gunakan http:// atau https://' }, { status: 400 });
    }

    // Ambil user jika login
    const { data: { user } } = await supabase.auth.getUser();

    let shortCode = customAlias?.trim() || generateRandomAlias();

    // Cek duplikasi
    let attempts = 0;
    while (attempts < 3) {
      const { data: existing } = await supabase
        .from('links')
        .select('short_code')
        .eq('short_code', shortCode)
        .single();
      if (!existing) break;
      if (customAlias) {
        return NextResponse.json({ error: 'Alias sudah digunakan, silakan pilih yang lain.' }, { status: 409 });
      }
      shortCode = generateRandomAlias();
      attempts++;
    }

    // Simpan dengan user_id jika login
    // Di dalam fungsi POST
const { data, error } = await supabase
  .from('links')
  .insert({ 
    short_code: shortCode, 
    original_url: originalUrl, 
    clicks: 0,
    user_id: user?.id || null,
    tags: tags || [],
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    is_active: true // Pastikan di-set eksplisit
  })
  .select()
  .single();

    if (error) throw error;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
    
    return NextResponse.json({ 
      shortCode: data.short_code, 
      shortUrl: `${baseUrl}/${data.short_code}`,
      originalUrl: data.original_url,
      clicks: data.clicks
    });

    

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan server' }, { status: 500 });
  }
}