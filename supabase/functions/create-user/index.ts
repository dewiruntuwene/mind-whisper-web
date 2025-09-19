console.info('create-user function starting');
Deno.serve(async (req)=>{
  try {
    const url = new URL(req.url);
    // Enforce route prefix so the function can host multiple routes later
    if (!url.pathname.startsWith('/create-user')) {
      return new Response(JSON.stringify({
        error: 'Not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    const body = await req.json().catch(()=>null);
    if (!body) {
      return new Response(JSON.stringify({
        error: 'Invalid JSON body'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    const payload = body;
    if (!payload.user_id) {
      return new Response(JSON.stringify({
        error: 'user_id is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    // Basic validation/sanitization
    const user_id = String(payload.user_id).trim();
    const email = payload.email ? String(payload.email).trim() : null;
    const full_name = payload.full_name ? String(payload.full_name).trim() : null;
    const avatar_url = payload.avatar_url ? String(payload.avatar_url).trim() : null;
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
      return new Response(JSON.stringify({
        error: 'Server misconfiguration'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    // Prepare insert payload for public.profiles
    const insertBody = {
      user_id
    };
    if (email) insertBody.email = email;
    if (full_name) insertBody.full_name = full_name;
    if (avatar_url) insertBody.avatar_url = avatar_url;
    const resp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY ?? '',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        // Ask the API to return the created row
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(insertBody)
    });
    const result = await resp.json().catch(()=>null);
    if (!resp.ok) {
      console.error('Supabase insert failed', {
        status: resp.status,
        result
      });
      return new Response(JSON.stringify({
        error: 'Failed to create profile',
        details: result
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    // Success: return created profile
    return new Response(JSON.stringify({
      data: result
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Unhandled error in create-user', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
