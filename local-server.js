/**
 * ARSelNel - Interactive Science Learning Web App
 * Local Development Server & RESTful API Endpoints (server.js)
 * 
 * Built with native Node.js (Zero-dependency) for instant execution.
 * Serves static assets and provides JSON API endpoints for Authentication & CMS.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// Load the small set of local development variables without adding a runtime
// dependency. Production environments should inject these variables directly.
function loadLocalEnv() {
  const envFile = path.join(ROOT_DIR, '.env');
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || Object.prototype.hasOwnProperty.call(process.env, match[1])) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
loadLocalEnv();

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // --- RESTful API Routes ---
  if (pathname.startsWith('/api/')) {
    // Health Check
    if (pathname === '/api/health') {
      return sendJSON(res, 200, { status: 'ok', time: new Date().toISOString() });
    }

    // Publishable credentials are designed for browser clients. Never add a
    // secret/service-role key to this response.
    if (pathname === '/api/public-config' && req.method === 'GET') {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
      const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
      const validUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl);
      const validKey = /^(sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.test(publishableKey);
      return sendJSON(res, 200, validUrl && validKey
        ? { configured: true, url: supabaseUrl, publishableKey }
        : { configured: false });
    }

    if (pathname === '/api/slides/upload' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 50 * 1024 * 1024) { // 50MB limit
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Saiz fail melebihi had maksimum 50MB.' }));
          req.destroy();
        }
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const { filename, dataUrl } = parsed;
          if (!filename || !dataUrl) {
            return sendJSON(res, 400, { success: false, error: 'Nama fail dan dataUrl diperlukan.' });
          }
          const cleanName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
          const ext = path.extname(cleanName).toLowerCase();
          if (!['.pdf', '.pptx', '.ppt'].includes(ext)) {
            return sendJSON(res, 400, { success: false, error: 'Hanya fail format PDF atau PowerPoint (.pptx) dibenarkan.' });
          }
          const uploadDir = path.join(ROOT_DIR, 'uploads', 'slides');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const matches = dataUrl.match(/^data:([A-Za-z-+/0-9]+);base64,(.+)$/);
          const base64Data = matches ? matches[2] : dataUrl;
          const buffer = Buffer.from(base64Data, 'base64');
          const finalFilename = `${Date.now()}_${cleanName}`;
          const targetPath = path.join(uploadDir, finalFilename);
          fs.writeFileSync(targetPath, buffer);

          return sendJSON(res, 200, {
            success: true,
            url: `/uploads/slides/${finalFilename}`,
            filename: cleanName,
            size: buffer.length,
            message: 'Fail slaid berjaya dimuat naik!'
          });
        } catch (e) {
          return sendJSON(res, 500, { success: false, error: 'Ralat semasa memproses fail muat naik: ' + e.message });
        }
      });
      return;
    }

    if (pathname.startsWith('/api/admin/users')) {
      try {
        const adminUsersHandler = require('./api/admin/users.js');
        return adminUsersHandler(req, res);
      } catch (err) {
        return sendJSON(res, 500, { success: false, error: 'Admin API handler error: ' + err.message });
      }
    }

    if ((pathname === '/api/auth/login' || pathname === '/api/auth/register' || pathname === '/api/stats') && req.method !== 'OPTIONS') {
      return sendJSON(res, 501, { success: false, message: 'API pengesahan dan analitik sekolah belum dikonfigurasi. Gunakan mod demo setempat.' });
    }

    return sendJSON(res, 404, { error: 'API endpoint not found' });
  }

  // --- Static Files Serving ---
  if (pathname.split('/').some(part => /^\.env(?:\.|$)/i.test(part))) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not found');
  }
  // Route rewrites mapping (mirroring vercel.json)
  const ROUTE_ALIASES = {
    '/': 'auth/login.html',
    '/login': 'auth/login.html',
    '/register': 'auth/register.html',
    '/auth/callback': 'auth/callback.html',
    '/callback': 'auth/callback.html',
    '/admin': 'admin_dashboard/code.html',
    '/dashboard': 'admin_dashboard/code.html',
    '/utama': 'halaman_utama/code.html',
    '/halaman_utama': 'halaman_utama/code.html',
    '/cellquest': 'cellquest/code.html',
    '/hab_permainan': 'hab_permainan/code.html',
    '/kuiz_interaktif': 'kuiz_interaktif/code.html',
    '/nota_pembelajaran': 'nota_pembelajaran/code.html',
    '/perpustakaan_video': 'perpustakaan_video/code.html',
    '/selbot_ai': 'selbot_ai/code.html',
    '/manual_penggunaan': 'manual_penggunaan/code.html',
    '/bantuan_maklumat': 'bantuan_maklumat/code.html',
    '/profil': 'profil/code.html',
    '/tetapan': 'tetapan/code.html',
    '/pengimbas_ar': 'pengimbas_ar/code.html',
    '/paparan_model_ar': 'paparan_model_ar/code.html',
    '/modul_pembelajaran': 'modul_pembelajaran/code.html',
    '/keputusan_permainan': 'keputusan_permainan/code.html'
  };

  let targetRelative = ROUTE_ALIASES[pathname] || (pathname.startsWith('/') ? pathname.slice(1) : pathname);
  let filePath = path.join(ROOT_DIR, targetRelative);

  // Fallback to .html extension if file does not exist directly
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  // Check if directory was requested, serve index or code.html
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      if (fs.existsSync(path.join(filePath, 'code.html'))) {
        filePath = path.join(filePath, 'code.html');
      } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      }
    }
  } catch (e) {}

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`
        <div style="font-family:sans-serif; text-align:center; padding:50px;">
          <h2>404 - Halaman Tidak Ditemui</h2>
          <p>Laluan <code>${pathname}</code> tidak wujud.</p>
          <a href="/halaman_utama/code.html" style="color:#006565; font-weight:bold;">Kembali ke Laman Utama ARSelNel &rarr;</a>
        </div>
      `);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 ARSelNel Pelayan Sains Interaktif sedang berjalan!`);
    console.log(`📡 URL Pelayan : http://localhost:${PORT}`);
    console.log(`🔐 Log Masuk   : http://localhost:${PORT}/auth/login.html`);
    console.log(`🧪 Papan Pemuka: http://localhost:${PORT}/admin/dashboard.html`);
    console.log(`🏠 Laman Utama : http://localhost:${PORT}/halaman_utama/code.html`);
    console.log(`======================================================\n`);
  });
}

module.exports = server;
