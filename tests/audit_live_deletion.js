const SUPABASE_URL = 'https://kxjhlbudsiojpvzwqwva.supabase.co';
const KEY = 'sb_publishable_XDyfEuHJHOSZdefeu1k3Og_kWXMzM0U';
const headers = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' };

async function checkLiveState() {
  console.log('--- 1. Check RPC delete_student_account ---');
  const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/delete_student_account`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ p_target_user_id: '00000000-0000-0000-0000-000000000000' })
  });
  console.log('delete_student_account status:', rpcRes.status);
  const rpcJson = await rpcRes.json().catch(() => null);
  console.log('delete_student_account response:', rpcJson);

  console.log('\n--- 2. Check RPC is_super_admin ---');
  const adminRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_super_admin`, {
    method: 'POST',
    headers
  });
  console.log('is_super_admin status:', adminRes.status);
  const adminJson = await adminRes.json().catch(() => null);
  console.log('is_super_admin response:', adminJson);

  console.log('\n--- 3. Check RPC get_all_users_for_admin ---');
  const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_all_users_for_admin`, {
    method: 'POST',
    headers
  });
  console.log('get_all_users_for_admin status:', usersRes.status);
  const usersJson = await usersRes.json().catch(() => null);
  console.log('get_all_users_for_admin count:', Array.isArray(usersJson) ? usersJson.length : usersJson);
  if (Array.isArray(usersJson)) {
    console.table(usersJson.map(u => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role })));
  }

  console.log('\n--- 4. Check admin_users table ---');
  const auRes = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?select=*`, { headers });
  const auJson = await auRes.json().catch(() => null);
  console.log('admin_users table:', auJson);
}

checkLiveState();
