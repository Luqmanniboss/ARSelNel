const SUPABASE_URL = 'https://kxjhlbudsiojpvzwqwva.supabase.co';
const KEY = 'sb_publishable_XDyfEuHJHOSZdefeu1k3Og_kWXMzM0U';
const headers = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY };

async function checkAll() {
  const candidates = [
    'profiles', 'admin_users', 'admin_audit_logs',
    'quiz_attempts', 'learning_progress', 'activity_results',
    'student_learning_events', 'user_settings', 'student_annotations',
    'student_note_progress', 'game_leaderboards', 'student_quiz_snapshots'
  ];
  for (const t of candidates) {
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + t + '?select=*&limit=1', { headers });
    const isOk = res.status === 200;
    console.log(t.padEnd(26), res.status, isOk ? 'EXISTS' : 'NOT FOUND');
  }
}
checkAll();
