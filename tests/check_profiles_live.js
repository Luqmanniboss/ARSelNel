const SUPABASE_URL = 'https://kxjhlbudsiojpvzwqwva.supabase.co';
const KEY = 'sb_publishable_XDyfEuHJHOSZdefeu1k3Og_kWXMzM0U';
const headers = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY };

async function inspectProfiles() {
  // Query profiles for any admin or muhd
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, { headers });
  const data = await res.json();
  console.log('Profiles status:', res.status, 'Count:', Array.isArray(data) ? data.length : data);
  if (Array.isArray(data)) {
    console.table(data.map(p => ({ id: p.id, email: p.email, full_name: p.full_name, role: p.role })));
  }
}
inspectProfiles();
