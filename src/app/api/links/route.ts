import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: Ambil semua link milik user yang login
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ links: data || [] });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch links' }, { status: 500 });
  }
}

// PATCH: Update link existing (URL, Short Code, Expiration Date)
export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, originalUrl, newShortCode, newExpiresAt } = await request.json();

    if (!id || !originalUrl) {
      return NextResponse.json({ error: 'Incomplete data provided.' }, { status: 400 });
    }

    // Validasi format URL
    try {
      new URL(originalUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid destination URL format.' }, { status: 400 });
    }

    const updateData: any = { 
      original_url: originalUrl,
      updated_at: new Date().toISOString()
    };

    // 1. Handle Expiration Date
    if (newExpiresAt !== undefined) {
      // Jika user mengosongkan input, set jadi null (link aktif selamanya)
      updateData.expires_at = newExpiresAt ? new Date(newExpiresAt).toISOString() : null;
    }

    // 2. Handle Short Code Change
    if (newShortCode) {
      const isValidFormat = /^[a-zA-Z0-9-]{3,20}$/.test(newShortCode);
      if (!isValidFormat) {
        return NextResponse.json({ 
          error: 'Short code must be 3-20 characters, containing only letters, numbers, and hyphens (-).' 
        }, { status: 400 });
      }

      // Cek apakah short code baru sudah dipakai oleh link LAIN
      const { data: existing } = await supabase
        .from('links')
        .select('id')
        .eq('short_code', newShortCode)
        .neq('id', id) // Pastikan bukan link yang sedang diedit
        .single();

      if (existing) {
        return NextResponse.json({ error: 'This short code is already in use by another link.' }, { status: 409 });
      }

      updateData.short_code = newShortCode;
    }

    // 3. Eksekusi Update ke Database
    const { data, error } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Keamanan: pastikan user hanya bisa edit link miliknya
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ link: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update link' }, { status: 500 });
  }
}

// DELETE: Hapus link
export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shortCode = searchParams.get('shortCode');

    if (!shortCode) {
      return NextResponse.json({ error: 'Short code is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('short_code', shortCode)
      .eq('user_id', user.id); // Keamanan: pastikan user hanya bisa hapus link miliknya

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete link' }, { status: 500 });
  }
}