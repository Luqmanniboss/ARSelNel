const SUPABASE_URL = 'https://kxjhlbudsiojpvzwqwva.supabase.co';
const KEY = 'sb_publishable_XDyfEuHJHOSZdefeu1k3Og_kWXMzM0U';
const headers = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY };

async function inspect() {
  const tables = ['profiles', 'cms_videos', 'learning_notes', 'quiz_attempts', 'student_learning_events', 'learning_progress', 'cms_quizzes', 'admin_users'];
  for (const table of tables) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, { headers });
      const json = await res.json();
      console.log(`\n=== Table: ${table} (Status ${res.status}) Count: ${Array.isArray(json) ? json.length : 0} ===`);
      if (Array.isArray(json)) {
        console.log(JSON.stringify(json.slice(0, 5), null, 2));
      } else {
        console.log(json);
      }
    } catch(e) {
      console.log(`Error on ${table}:`, e.message);
    }
  }
}
inspect();
