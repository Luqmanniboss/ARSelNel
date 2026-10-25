const SUPABASE_URL = 'https://kxjhlbudsiojpvzwqwva.supabase.co';
const KEY = 'sb_publishable_XDyfEuHJHOSZdefeu1k3Og_kWXMzM0U';
const headers = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY };

async function findStudent() {
  const res = await fetch(SUPABASE_URL + '/rest/v1/profiles?email=eq.arselnel.student.xam9ftzn@gmail.com&select=*', { headers });
  const data = await res.json();
  console.log('Result for arselnel.student.xam9ftzn@gmail.com:');
  console.log(JSON.stringify(data, null, 2));

  // Also check all profiles
  const resAll = await fetch(SUPABASE_URL + '/rest/v1/profiles?select=id,full_name,email,role,created_at&limit=20', { headers });
  const allProfiles = await resAll.json();
  console.log('\nTotal profiles found:', Array.isArray(allProfiles) ? allProfiles.length : allProfiles);
  if (Array.isArray(allProfiles)) {
    console.table(allProfiles);
  }
}
findStudent();
