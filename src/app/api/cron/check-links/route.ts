import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  // Validasi Cron Secret (Keamanan)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = await createServerSupabaseClient();

  // 1. Handle Expiration
  await supabase
    .from('links')
    .update({ is_active: false })
    .lt('expires_at', new Date().toISOString())
    .eq('is_active', true);

  // 2. Health Check (Cek link yang belum dicek dalam 24 jam, max 50 link per run)
  const { data: linksToCheck } = await supabase
    .from('links')
    .select('id, original_url')
    .eq('is_active', true)
    .or(`last_health_check.is.null, last_health_check.lt.${new Date(Date.now() - 86400000).toISOString()}`)
    .limit(50);

  if (linksToCheck) {
    for (const link of linksToCheck) {
      try {
        const res = await fetch(link.original_url, { method: 'HEAD', redirect: 'follow' });
        await supabase
          .from('links')
          .update({ 
            health_status: res.status, 
            last_health_check: new Date().toISOString() 
          })
          .eq('id', link.id);
      } catch {
        await supabase.from('links').update({ health_status: 0, last_health_check: new Date().toISOString() }).eq('id', link.id);
      }
    }
  }

  return NextResponse.json({ success: true });
}