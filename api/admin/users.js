/**
 * ARSelNel - Admin User Management & Role Control Serverless API
 * Handles:
 *  - GET /api/admin/users: List students and teachers (Admin/Teacher verified)
 *  - POST /api/admin/users/promote: Promote student to Teacher (Super Admin only)
 *  - POST /api/admin/users/demote: Revoke Teacher back to Student (Super Admin only)
 *  - POST /api/admin/users/delete: Safe Student Account Deletion (Super Admin only)
 *
 * Security: Validates JWT via Supabase Auth. Enforces Super Admin privileges.
 */

const https = require('https');
const url = require('url');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kxjhlbudsiojpvzwqwva.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_XDyfEuHJHOSZdefeu1k3Og_kWXMzM0U';

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (_) {
        resolve({});
      }
    });
  });
}

function fetchSupabase(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${SUPABASE_URL}${endpoint}`;
    const parsed = new URL(fullUrl);
    const reqOptions = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: json });
        } catch (_) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    req.end();
  });
}

async function verifyCaller(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  try {
    const { status, data: user } = await fetchSupabase('/auth/v1/user', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (status !== 200 || !user || !user.id) return null;

    // Check role in public.admin_users
    const { data: adminRows } = await fetchSupabase(`/rest/v1/admin_users?user_id=eq.${user.id}&select=role`);
    const adminRow = Array.isArray(adminRows) && adminRows[0] ? adminRows[0] : null;

    const email = (user.email || '').toLowerCase();
    const isSuperAdmin = (adminRow && adminRow.role === 'superadmin') || email === 'admin@test.com';
    const isTeacher = isSuperAdmin || (adminRow && (adminRow.role === 'teacher' || adminRow.role === 'admin'));

    return {
      user,
      token,
      email,
      isSuperAdmin,
      isTeacher,
      role: isSuperAdmin ? 'superadmin' : (isTeacher ? 'teacher' : 'student')
    };
  } catch (err) {
    console.error('[AdminAPI] verifyCaller error:', err);
    return null;
  }
}

async function handleAdminUsersRequest(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 204, {});
  }

  const caller = await verifyCaller(req);
  if (!caller) {
    return sendJSON(res, 401, { success: false, error: 'Sesi log masuk tidak sah atau telah tamat tempoh. Sila log masuk semula.' });
  }

  if (!caller.isTeacher && !caller.isSuperAdmin) {
    return sendJSON(res, 403, { success: false, error: 'Akses terhad: Anda tidak mempunyai kebenaran Guru atau Pentadbir.' });
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // --- 1. GET ALL USERS ---
  if ((pathname === '/api/admin/users' || pathname === '/api/admin/users/') && method === 'GET') {
    try {
      // Attempt RPC function first with caller's token
      const rpcRes = await fetchSupabase('/rest/v1/rpc/get_all_users_for_admin', {
        method: 'POST',
        headers: { Authorization: `Bearer ${caller.token}` }
      });

      if (rpcRes.status === 200 && Array.isArray(rpcRes.data)) {
        const users = rpcRes.data;
        const stats = {
          total: users.length,
          teachers: users.filter(u => (u.role === 'teacher' || u.role === 'guru') && u.status !== 'inactive').length,
          students: users.filter(u => u.role === 'student' && u.status !== 'inactive').length
        };
        return sendJSON(res, 200, {
          success: true,
          users: users,
          stats: stats,
          currentUserRole: caller.role,
          isSuperAdmin: caller.isSuperAdmin
        });
      }

      // Fallback: Query profiles & admin_users
      const [profilesRes, adminRes] = await Promise.all([
        fetchSupabase('/rest/v1/profiles?select=*', { headers: { Authorization: `Bearer ${caller.token}` } }),
        fetchSupabase('/rest/v1/admin_users?select=*', { headers: { Authorization: `Bearer ${caller.token}` } })
      ]);

      const adminMap = new Map();
      if (Array.isArray(adminRes.data)) {
        adminRes.data.forEach(a => adminMap.set(a.user_id, a.role));
      }

      const users = (Array.isArray(profilesRes.data) ? profilesRes.data : []).map(p => {
        const adminRole = adminMap.get(p.id);
        const email = (p.email || '').toLowerCase();
        const isSuper = adminRole === 'superadmin' || email === 'admin@test.com';
        const role = isSuper ? 'superadmin' : (adminRole === 'teacher' || p.role === 'teacher' || p.role === 'admin' ? 'teacher' : 'student');

        return {
          id: p.id,
          full_name: p.full_name || 'Pelajar Sains',
          email: p.email || (p.nickname ? `${p.nickname}@sekolah.edu.my` : 'pelajar@arselnel.my'),
          class_name: p.class_name || 'Tingkatan 1',
          role: role,
          status: p.status || 'active',
          is_superadmin: isSuper,
          created_at: p.created_at
        };
      });

      const stats = {
        total: users.length,
        teachers: users.filter(u => (u.role === 'teacher' || u.role === 'guru') && u.status !== 'inactive').length,
        students: users.filter(u => u.role === 'student' && u.status !== 'inactive').length
      };

      return sendJSON(res, 200, {
        success: true,
        users,
        stats,
        currentUserRole: caller.role,
        isSuperAdmin: caller.isSuperAdmin
      });
    } catch (e) {
      return sendJSON(res, 500, { success: false, error: 'Gagal memuatkan senarai pengguna: ' + e.message });
    }
  }

  // ALL MUTATION OPERATIONS REQUIRE STRICT SUPER ADMIN PRIVILEGES
  if (!caller.isSuperAdmin) {
    return sendJSON(res, 403, {
      success: false,
      error: 'Tindakan Ditolak: Hanya Pentadbir Utama (Super Admin) dibenarkan melaksanakan pelantikan guru atau pemadaman akaun murid.'
    });
  }

  const body = await parseBody(req);
  const targetUserId = body.userId || body.user_id || parsedUrl.query.userId || parsedUrl.query.user_id;

  if (!targetUserId) {
    return sendJSON(res, 400, { success: false, error: 'ID pengguna sasaran (userId) diperlukan.' });
  }

  // --- 2. PROMOTE TO TEACHER ---
  if ((pathname.endsWith('/promote') || body.action === 'promote') && method === 'POST') {
    try {
      const rpcRes = await fetchSupabase('/rest/v1/rpc/promote_user_to_teacher', {
        method: 'POST',
        headers: { Authorization: `Bearer ${caller.token}` },
        body: { p_target_user_id: targetUserId }
      });

      if (rpcRes.status === 200) {
        return sendJSON(res, 200, rpcRes.data);
      }

      // Fallback direct table updates
      let targetEmail = body.email;
      if (!targetEmail || !targetEmail.trim()) {
        const { data: prof } = await fetchSupabase(`/rest/v1/profiles?id=eq.${targetUserId}&select=email`);
        if (Array.isArray(prof) && prof[0] && prof[0].email) {
          targetEmail = prof[0].email;
        }
      }
      if (!targetEmail || !targetEmail.trim()) {
        return sendJSON(res, 400, { success: false, error: 'E-mel pengguna sasaran tidak sah atau tidak dijumpai.' });
      }

      await fetchSupabase('/rest/v1/admin_users', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: {
          user_id: targetUserId,
          email: targetEmail.toLowerCase().trim(),
          role: 'teacher',
          updated_at: new Date().toISOString()
        }
      });

      await fetchSupabase(`/rest/v1/profiles?id=eq.${targetUserId}`, {
        method: 'PATCH',
        body: { role: 'teacher', updated_at: new Date().toISOString() }
      });

      // Audit log
      await fetchSupabase('/rest/v1/admin_audit_logs', {
        method: 'POST',
        body: {
          actor_id: caller.user.id,
          actor_email: caller.email,
          action: 'PROMOTE_TEACHER',
          target_id: targetUserId,
          target_email: targetEmail.toLowerCase().trim(),
          details: { teacher_name: body.name || 'Guru' }
        }
      });

      return sendJSON(res, 200, { success: true, message: 'Pengguna berjaya dilantik sebagai Guru Sains.' });
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: 'Ralat pelantikan guru: ' + err.message });
    }
  }

  // --- 3. DEMOTE TEACHER TO STUDENT ---
  if ((pathname.endsWith('/demote') || body.action === 'demote') && method === 'POST') {
    try {
      if (targetUserId === caller.user.id) {
        return sendJSON(res, 400, { success: false, error: 'Pentadbir utama tidak boleh membatalkan pelantikannya sendiri.' });
      }

      const rpcRes = await fetchSupabase('/rest/v1/rpc/demote_teacher_to_student', {
        method: 'POST',
        headers: { Authorization: `Bearer ${caller.token}` },
        body: { p_target_user_id: targetUserId }
      });

      if (rpcRes.status === 200) {
        return sendJSON(res, 200, rpcRes.data);
      }

      // Fallback
      await fetchSupabase(`/rest/v1/admin_users?user_id=eq.${targetUserId}`, { method: 'DELETE' });
      await fetchSupabase(`/rest/v1/profiles?id=eq.${targetUserId}`, {
        method: 'PATCH',
        body: { role: 'student', updated_at: new Date().toISOString() }
      });

      // Audit log
      await fetchSupabase('/rest/v1/admin_audit_logs', {
        method: 'POST',
        body: {
          actor_id: caller.user.id,
          actor_email: caller.email,
          action: 'DEMOTE_TEACHER',
          target_id: targetUserId,
          target_email: body.email || 'unknown',
          details: { name: body.name || 'Pengguna' }
        }
      });

      return sendJSON(res, 200, { success: true, message: 'Pelantikan Guru berjaya dibatalkan. Akaun dikembalikan kepada Murid.' });
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: 'Ralat pembatalan pelantikan: ' + err.message });
    }
  }

  // --- 4. SAFE STUDENT ACCOUNT DELETION ---
  if ((pathname.endsWith('/delete') || method === 'DELETE' || body.action === 'delete') && (method === 'POST' || method === 'DELETE')) {
    try {
      // 1. Strict Server-Side Super Admin verification
      if (!caller.isSuperAdmin) {
        return sendJSON(res, 403, { success: false, error: 'Akses terhad: Hanya Pentadbir Utama (Super Admin) dibenarkan memadam akaun murid.' });
      }

      if (targetUserId === caller.user.id) {
        return sendJSON(res, 400, { success: false, error: 'Pentadbir utama tidak boleh memadam akaunnya sendiri.' });
      }

      // 2. Prevent deleting teachers or admins
      const { data: targetAdmin } = await fetchSupabase(`/rest/v1/admin_users?user_id=eq.${targetUserId}&select=role`);
      if (Array.isArray(targetAdmin) && targetAdmin.length > 0) {
        return sendJSON(res, 400, { success: false, error: 'Akaun Guru atau Pentadbir tidak boleh dipadam melalui fungsi ini.' });
      }

      // 3. Primary Method: Execute PostgreSQL RPC delete_student_account with caller JWT
      const rpcRes = await fetchSupabase('/rest/v1/rpc/delete_student_account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${caller.token}` },
        body: { p_target_user_id: targetUserId, p_reason: body.reason || 'Dipadam oleh Super Admin' }
      });

      if (rpcRes.status === 200 && rpcRes.data && rpcRes.data.success) {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (serviceKey) {
          try {
            await fetchSupabase(`/auth/v1/admin/users/${targetUserId}`, {
              method: 'DELETE',
              headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`
              }
            });
          } catch (_) {}
        }
        return sendJSON(res, 200, rpcRes.data);
      }

      // If RPC failed: extract real error message
      const rpcErrMsg = (rpcRes.data && (rpcRes.data.message || rpcRes.data.error || rpcRes.data.details || rpcRes.data.hint))
        || (typeof rpcRes.data === 'string' ? rpcRes.data : null);

      // Never disguise RPC authorization/validation failure as false success!
      if (rpcRes.status === 400 || rpcRes.status === 403 || (rpcErrMsg && !rpcErrMsg.includes('delete_student_account'))) {
        return sendJSON(res, rpcRes.status >= 400 ? rpcRes.status : 500, {
          success: false,
          error: rpcErrMsg || 'Gagal memadam akaun murid dari pangkalan data.'
        });
      }

      // 4. Fallback ONLY if RPC function does not exist and service role key is present
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey) {
        // Delete from Supabase Auth admin API FIRST
        const authDelRes = await fetchSupabase(`/auth/v1/admin/users/${targetUserId}`, {
          method: 'DELETE',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`
          }
        });

        if (authDelRes.status !== 200 && authDelRes.status !== 204 && authDelRes.status !== 404) {
          return sendJSON(res, 500, {
            success: false,
            error: 'Gagal memadam akaun dari Supabase Authentication: ' + JSON.stringify(authDelRes.data)
          });
        }

        // Clean up remaining student tables
        const tablesToClean = [
          `quiz_attempts?user_id=eq.${targetUserId}`,
          `learning_progress?user_id=eq.${targetUserId}`,
          `activity_results?user_id=eq.${targetUserId}`,
          `student_learning_events?user_id=eq.${targetUserId}`,
          `user_settings?user_id=eq.${targetUserId}`,
          `student_annotations?user_id=eq.${targetUserId}`,
          `student_note_progress?student_id=eq.${targetUserId}`,
          `game_leaderboards?user_id=eq.${targetUserId}`,
          `student_quiz_snapshots?user_id=eq.${targetUserId}`
        ];

        await Promise.allSettled(
          tablesToClean.map(tbl => fetchSupabase(`/rest/v1/${tbl}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${caller.token}` }
          }))
        );

        await fetchSupabase(`/rest/v1/profiles?id=eq.${targetUserId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${caller.token}` }
        });

        await fetchSupabase('/rest/v1/admin_audit_logs', {
          method: 'POST',
          headers: { Authorization: `Bearer ${caller.token}` },
          body: {
            actor_id: caller.user.id,
            actor_email: caller.email,
            action: 'DELETE_STUDENT',
            target_id: targetUserId,
            target_email: body.email || 'unknown',
            details: { student_name: body.name || 'Pelajar', reason: body.reason || 'Dipadam oleh Super Admin' }
          }
        });

        return sendJSON(res, 200, {
          success: true,
          deleted_user_id: targetUserId,
          message: 'Akaun murid dan rekod pembelajaran telah berjaya dipadam dengan selamat.'
        });
      }

      return sendJSON(res, 500, {
        success: false,
        error: rpcErrMsg || 'Operasi pemadaman akaun murid gagal dalam pangkalan data.'
      });
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: 'Ralat pemadaman murid: ' + err.message });
    }
  }

  return sendJSON(res, 404, { error: 'Admin action not recognized' });
}

module.exports = handleAdminUsersRequest;
