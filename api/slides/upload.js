/**
 * ARSelNel - Serverless Slide & Media Upload Endpoint (api/slides/upload.js)
 * Vercel Serverless Function & Local Endpoint handler
 * Always returns application/json with meaningful Malay messages.
 */

const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
  // CORS & Content-Type Headers
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Kaedah HTTP tidak dibenarkan. Hanya permintaan POST disokong.'
    });
  }

  try {
    let body = req.body;

    // Parse body if received as string or stream (for compatibility with different runtimes)
    if (!body || typeof body !== 'object') {
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (_) {
          return res.status(400).json({
            success: false,
            error: 'Format data JSON tidak sah.'
          });
        }
      } else {
        // Stream reading fallback
        body = await new Promise((resolve, reject) => {
          let raw = '';
          req.on('data', chunk => {
            raw += chunk;
            if (raw.length > 50 * 1024 * 1024) {
              reject(new Error('PAYLOAD_TOO_LARGE'));
            }
          });
          req.on('end', () => {
            try {
              resolve(JSON.parse(raw));
            } catch (err) {
              reject(err);
            }
          });
          req.on('error', reject);
        });
      }
    }

    const { filename, dataUrl } = body || {};

    if (!filename || !dataUrl) {
      return res.status(400).json({
        success: false,
        error: 'Nama fail dan dataUrl diperlukan untuk muat naik.'
      });
    }

    const cleanName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(cleanName).toLowerCase();
    const allowedExts = ['.pdf', '.pptx', '.ppt', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.mp4', '.webm'];

    if (!allowedExts.includes(ext)) {
      return res.status(400).json({
        success: false,
        error: `Format fail '${ext}' tidak dibenarkan. Format disokong: PDF, PPTX, imej, atau video.`
      });
    }

    // Extract base64
    const matches = dataUrl.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
    const base64Data = matches ? matches[2] : dataUrl;
    const mimeType = matches ? matches[1] : 'application/octet-stream';
    const buffer = Buffer.from(base64Data, 'base64');

    // Check size against Vercel payload limit (4.5MB)
    if (buffer.length > 4.5 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: 'Saiz fail melebihi had Vercel Function (4.5MB). Sila gunakan muat naik terus ke Supabase Storage untuk fail bersaiz besar.'
      });
    }

    // Try Supabase Storage direct upload if credentials available
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://kxjhlbudsiojpvzwqwva.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_XDyfEuHJHOSZdefeu1k3Og_kWXMzM0U';

    const timestampName = `${Date.now()}_${cleanName}`;
    const storagePath = `slides/${timestampName}`;

    // Attempt upload to Supabase Storage bucket 'educational_media'
    try {
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/educational_media/${storagePath}`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': mimeType,
          'x-upsert': 'true'
        },
        body: buffer
      });

      if (uploadRes.ok) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/educational_media/${storagePath}`;
        return res.status(200).json({
          success: true,
          url: publicUrl,
          storagePath: storagePath,
          filename: cleanName,
          size: buffer.length,
          message: 'Fail slaid berjaya dimuat naik ke Supabase Storage!'
        });
      }
    } catch (storageErr) {
      // Continue to local/dataUrl fallback
      console.warn('[upload] Supabase storage upload attempt:', storageErr.message);
    }

    // Local filesystem storage fallback (when running on Node local-server.js)
    try {
      const uploadDir = path.join(process.cwd(), 'uploads', 'slides');
      if (fs.existsSync(uploadDir) || !process.env.VERCEL) {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const targetPath = path.join(uploadDir, timestampName);
        fs.writeFileSync(targetPath, buffer);

        return res.status(200).json({
          success: true,
          url: `/uploads/slides/${timestampName}`,
          filename: cleanName,
          size: buffer.length,
          message: 'Fail slaid berjaya disimpan secara setempat!'
        });
      }
    } catch (_) {}

    // Serverless fallback: return dataUrl for preview/storage if under reasonable size
    return res.status(200).json({
      success: true,
      url: dataUrl,
      filename: cleanName,
      size: buffer.length,
      message: 'Fail berjaya diproses sebagai Data URL.'
    });

  } catch (err) {
    if (err.message === 'PAYLOAD_TOO_LARGE') {
      return res.status(413).json({
        success: false,
        error: 'Saiz fail melebihi had maksimum 50MB.'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Ralat pelayan semasa memproses muat naik: ' + (err.message || 'Ralat tidak diketahui.')
    });
  }
};
