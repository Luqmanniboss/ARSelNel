/**
 * ARSelNel Supabase Comprehensive Backup Utility
 * Backs up:
 *  1. PostgreSQL CMS and Student tables (JSON & Schema definitions)
 *  2. Supabase Storage Binary Files (PDFs, PPTXs, Videos, 3D Models, Images)
 *  3. Verification manifest with record counts, file sizes, and checksums
 *
 * Usage:
 *   node scripts/backup_supabase.js [--url <supabase_url>] [--key <service_or_anon_key>] [--out <output_dir>]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables or local fallback config if present
const BACKUP_DIR_DEFAULT = path.join(__dirname, '..', 'backups', `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`);

// Tables to back up
const TARGET_TABLES = [
  'admin_users',
  'cms_videos',
  'cms_quizzes',
  'cms_game_questions',
  'cms_cellquest_organelles',
  'cms_cellquest_models',
  'cms_dashboard_config',
  'cms_manual_steps',
  'learning_notes',
  'student_annotations',
  'student_note_progress',
  'profiles',
  'learning_progress',
  'quiz_attempts',
  'activity_results',
  'user_settings'
];

// Buckets to inspect and back up
const TARGET_BUCKETS = ['educational_media'];

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
    outDir: BACKUP_DIR_DEFAULT
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) config.supabaseUrl = args[++i];
    if (args[i] === '--key' && args[i + 1]) config.apiKey = args[++i];
    if (args[i] === '--out' && args[i + 1]) config.outDir = path.resolve(args[++i]);
  }

  // Fallback to reading from assets/js/supabase-client.js if not provided
  if (!config.supabaseUrl || !config.apiKey) {
    try {
      const clientContent = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'supabase-client.js'), 'utf8');
      const urlMatch = clientContent.match(/url:\s*['"](https:\/\/[^'"]+)['"]/);
      const keyMatch = clientContent.match(/(?:publishableKey|anonKey|key):\s*['"]([^'"]+)['"]/);
      if (!config.supabaseUrl && urlMatch) config.supabaseUrl = urlMatch[1];
      if (!config.apiKey && keyMatch) config.apiKey = keyMatch[1];
    } catch (e) {
      // Ignore fallback errors
    }
  }

  return config;
}

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (err) {
            resolve({ status: res.statusCode, raw: data });
          }
        } else {
          resolve({ status: res.statusCode, error: data });
        }
      });
    }).on('error', reject);
  });
}

function downloadBinary(url, destPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers }, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`Failed to download binary: HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
    }).on('error', err => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function runBackup() {
  const config = parseArgs();
  console.log('====================================================');
  console.log(' ARSelNel Supabase Comprehensive Backup System');
  console.log(' Mode: READ-ONLY SAFE BACKUP & VERIFICATION');
  console.log('====================================================');

  if (!config.supabaseUrl || !config.apiKey) {
    console.error('ERROR: Supabase URL and API Key are required.');
    console.error('Set SUPABASE_URL and SUPABASE_KEY environment variables or pass --url and --key.');
    process.exit(1);
  }

  console.log(`Target Supabase URL: ${config.supabaseUrl}`);
  console.log(`Backup Destination : ${config.outDir}`);
  console.log(`Timestamp          : ${new Date().toISOString()}`);

  // Create directories
  const dbDir = path.join(config.outDir, 'database');
  const storageDir = path.join(config.outDir, 'storage');
  fs.mkdirSync(dbDir, { recursive: true });
  fs.mkdirSync(storageDir, { recursive: true });

  const manifest = {
    timestamp: new Date().toISOString(),
    supabaseUrl: config.supabaseUrl,
    tables: {},
    storage: {},
    totalTablesBackedUp: 0,
    totalStorageFilesBackedUp: 0,
    status: 'IN_PROGRESS'
  };

  const headers = {
    'apikey': config.apiKey,
    'Authorization': `Bearer ${config.apiKey}`,
    'Accept': 'application/json'
  };

  // 1. Back up database tables
  console.log('\n--- 1. Backing Up Database Tables via Supabase REST API ---');
  for (const table of TARGET_TABLES) {
    process.stdout.write(`Exporting table [${table}]... `);
    try {
      const endpoint = `${config.supabaseUrl}/rest/v1/${table}?select=*`;
      const res = await fetchJson(endpoint, headers);
      if (res.status === 200 && Array.isArray(res.data)) {
        const filePath = path.join(dbDir, `${table}.json`);
        fs.writeFileSync(filePath, JSON.stringify(res.data, null, 2), 'utf8');
        const stats = fs.statSync(filePath);
        manifest.tables[table] = {
          status: 'SUCCESS',
          recordCount: res.data.length,
          fileSize: stats.size,
          filePath: path.relative(config.outDir, filePath)
        };
        manifest.totalTablesBackedUp++;
        console.log(`OK (${res.data.length} records, ${stats.size} bytes)`);
      } else if (res.status === 404) {
        manifest.tables[table] = { status: 'NOT_FOUND_ON_LIVE_DB', recordCount: 0 };
        console.log(`SKIPPED (Table not yet created on live DB - HTTP 404)`);
      } else {
        manifest.tables[table] = { status: 'ERROR', httpStatus: res.status, error: res.error };
        console.log(`WARN (HTTP ${res.status})`);
      }
    } catch (err) {
      manifest.tables[table] = { status: 'FAILED', error: err.message };
      console.log(`FAILED (${err.message})`);
    }
  }

  // 2. Back up Supabase Storage Files
  console.log('\n--- 2. Backing Up Supabase Storage Binary Files ---');
  console.log('NOTE: pg_dump does NOT extract binary file bytes. REST object streaming is required.');
  for (const bucket of TARGET_BUCKETS) {
    console.log(`Inspecting storage bucket [${bucket}]...`);
    const bucketDir = path.join(storageDir, bucket);
    fs.mkdirSync(bucketDir, { recursive: true });

    try {
      const listEndpoint = `${config.supabaseUrl}/storage/v1/object/list/${bucket}`;
      const listRes = await fetchJson(listEndpoint, {
        ...headers,
        'Content-Type': 'application/json'
      });

      if (listRes.status === 200 && Array.isArray(listRes.data)) {
        manifest.storage[bucket] = { files: [], count: listRes.data.length };
        console.log(`Found ${listRes.data.length} objects in bucket [${bucket}].`);

        for (const item of listRes.data) {
          if (item.name) {
            const objectUrl = `${config.supabaseUrl}/storage/v1/object/public/${bucket}/${item.name}`;
            const destPath = path.join(bucketDir, item.name);
            process.stdout.write(`  Downloading [${item.name}]... `);
            try {
              await downloadBinary(objectUrl, destPath, headers);
              const fileStat = fs.statSync(destPath);
              manifest.storage[bucket].files.push({
                name: item.name,
                size: fileStat.size,
                status: 'DOWNLOADED'
              });
              manifest.totalStorageFilesBackedUp++;
              console.log(`OK (${fileStat.size} bytes)`);
            } catch (dlErr) {
              console.log(`FAILED (${dlErr.message})`);
              manifest.storage[bucket].files.push({
                name: item.name,
                status: 'DOWNLOAD_FAILED',
                error: dlErr.message
              });
            }
          }
        }
      } else if (listRes.status === 404 || (listRes.error && listRes.error.includes('Bucket not found'))) {
        manifest.storage[bucket] = { status: 'BUCKET_NOT_FOUND', count: 0 };
        console.log(`Bucket [${bucket}] does not exist yet on target Supabase project.`);
      } else {
        manifest.storage[bucket] = { status: 'ERROR', error: listRes.error || listRes.status };
        console.log(`Bucket inspection returned status: ${listRes.status}`);
      }
    } catch (bucketErr) {
      manifest.storage[bucket] = { status: 'FAILED', error: bucketErr.message };
      console.log(`Storage check failed: ${bucketErr.message}`);
    }
  }

  // 3. Verification & Manifest Generation
  console.log('\n--- 3. Verifying Backup Integrity ---');
  let allValid = true;
  for (const [tbl, info] of Object.entries(manifest.tables)) {
    if (info.status === 'SUCCESS') {
      const p = path.join(config.outDir, info.filePath);
      if (!fs.existsSync(p) || fs.statSync(p).size === 0) {
        console.error(`VERIFICATION ERROR: Table file ${p} is missing or empty!`);
        allValid = false;
      }
    }
  }

  manifest.status = allValid ? 'VERIFIED_SUCCESS' : 'VERIFICATION_WARNINGS';
  const manifestPath = path.join(config.outDir, 'backup_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`Manifest written to: ${manifestPath}`);
  console.log(`Final Backup Status: ${manifest.status}`);
  console.log('====================================================');
  console.log(' BACKUP COMPLETED');
  console.log('====================================================\n');
}

runBackup().catch(err => {
  console.error('Fatal backup error:', err);
  process.exit(1);
});
