const SUPABASE_URL = 'https://kxjhlbudsiojpvzwqwva.supabase.co';
const KEY = 'sb_publishable_XDyfEuHJHOSZdefeu1k3Og_kWXMzM0U';

// Let's test login with known test credentials or check if admin@test.com exists
async function checkAuthUsers() {
  // Test login for admin@test.com
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
  });
  const data = await res.json();
  console.log('Login admin@test.com status:', res.status);
  console.log('User id:', data.user ? data.user.id : null);
  console.log('User email:', data.user ? data.user.email : null);
  if (data.error_description || data.msg) {
    console.log('Error:', data.error_description || data.msg);
  }
}
checkAuthUsers();
