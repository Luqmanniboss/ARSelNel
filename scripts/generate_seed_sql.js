/**
 * ARSelNel - Generate Seed SQL from data/cms_backup.json
 * Generates supabase/seed_cms_data.sql for populating live Supabase tables
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const backupPath = path.join(ROOT_DIR, 'data', 'cms_backup.json');
const outputPath = path.join(ROOT_DIR, 'supabase', 'seed_cms_data.sql');

const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const col = data.collections || data;

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let sql = `-- ============================================================================
-- ARSelNel - Seed Data for Supabase CMS Tables
-- Generated automatically from data/cms_backup.json
-- Preserves all existing educational content without duplicates (ON CONFLICT DO NOTHING)
-- ============================================================================

`;

// 1. CMS Videos
if (Array.isArray(col.videos) && col.videos.length > 0) {
  sql += `-- 1. Seed CMS Videos (${col.videos.length} videos)\n`;
  for (const v of col.videos) {
    sql += `INSERT INTO public.cms_videos (id, title, category, url, thumbnail, duration, instructor, description, views, publication_status, display_order)
VALUES (${escapeSql(v.id)}, ${escapeSql(v.title)}, ${escapeSql(v.category)}, ${escapeSql(v.url)}, ${escapeSql(v.thumbnail)}, ${escapeSql(v.duration)}, ${escapeSql(v.instructor)}, ${escapeSql(v.description)}, ${v.views || 0}, ${escapeSql(v.publication_status || 'published')}, ${v.display_order || 0})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 2. CMS Quizzes
if (Array.isArray(col.quizzes) && col.quizzes.length > 0) {
  sql += `-- 2. Seed CMS Quizzes (${col.quizzes.length} quizzes)\n`;
  for (const q of col.quizzes) {
    const optsJson = JSON.stringify(q.options || []);
    sql += `INSERT INTO public.cms_quizzes (id, title, topic, type, question, options, correct_answer, points, difficulty, explanation, image, publication_status, display_order)
VALUES (${escapeSql(q.id)}, ${escapeSql(q.title)}, ${escapeSql(q.topic)}, ${escapeSql(q.type || 'mcq')}, ${escapeSql(q.question)}, ${escapeSql(optsJson)}::jsonb, ${escapeSql(q.correct_answer || 'B')}, ${q.points || 10}, ${escapeSql(q.difficulty || 'Sederhana')}, ${escapeSql(q.explanation)}, ${escapeSql(q.image || '')}, ${escapeSql(q.publication_status || 'published')}, ${q.display_order || 0})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 3. CMS Game Questions (Maze Chase)
if (Array.isArray(col.maze_questions) && col.maze_questions.length > 0) {
  sql += `-- 3. Seed CMS Game Questions (${col.maze_questions.length} questions)\n`;
  for (const mq of col.maze_questions) {
    const optsJson = JSON.stringify(mq.options || {});
    sql += `INSERT INTO public.cms_game_questions (id, game_type, question, options, correct_answer, explanation, difficulty, points, image, publication_status, display_order)
VALUES (${escapeSql('maze_' + mq.id)}, 'maze_chase', ${escapeSql(mq.question)}, ${escapeSql(optsJson)}::jsonb, ${escapeSql(String(mq.correct))}, ${escapeSql(mq.explanation)}, ${escapeSql(mq.difficulty || 'easy')}, ${mq.points || 100}, ${escapeSql(mq.illustration || '')}, 'published', ${mq.id || 0})
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 4. CMS CellQuest Models
if (Array.isArray(col.ar_models) && col.ar_models.length > 0) {
  sql += `-- 4. Seed CellQuest 3D Models (${col.ar_models.length} models)\n`;
  for (const m of col.ar_models) {
    sql += `INSERT INTO public.cms_cellquest_models (id, cell_type, name, model_url, format, mesh_mappings, is_active, publication_status)
VALUES (${escapeSql(m.id)}, ${escapeSql(m.cell_type)}, ${escapeSql(m.name)}, ${escapeSql(m.model_url)}, ${escapeSql(m.format || 'glb')}, '{}'::jsonb, true, 'published')
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 5. CMS CellQuest Organelles
if (Array.isArray(col.cellquest_organelles) && col.cellquest_organelles.length > 0) {
  sql += `-- 5. Seed CellQuest Organelles (${col.cellquest_organelles.length} organelles)\n`;
  for (const o of col.cellquest_organelles) {
    sql += `INSERT INTO public.cms_cellquest_organelles (id, cell_type, key, name, icon, description, fact, color_hex, display_order, publication_status)
VALUES (${escapeSql(o.id)}, ${escapeSql(o.cell_type || 'both')}, ${escapeSql(o.key)}, ${escapeSql(o.name)}, ${escapeSql(o.icon || '🧬')}, ${escapeSql(o.description)}, ${escapeSql(o.fact || '')}, ${escapeSql(o.color_hex || '#006565')}, ${o.display_order || 0}, 'published')
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

// 6. CMS Dashboard Config
if (col.dashboard_config) {
  const d = col.dashboard_config;
  sql += `-- 6. Seed Dashboard Config\n`;
  sql += `INSERT INTO public.cms_dashboard_config (id, hero_title, hero_description, hero_button_primary, hero_button_secondary, rec_title, rec_description, rec_badge, modules_config)
VALUES ('default', ${escapeSql(d.heroTitle)}, ${escapeSql(d.heroDescription)}, ${escapeSql(d.heroButtonPrimaryText)}, ${escapeSql(d.heroButtonSecondaryText)}, ${escapeSql(d.featuredRecommendation ? d.featuredRecommendation.title : '')}, ${escapeSql(d.featuredRecommendation ? d.featuredRecommendation.description : '')}, ${escapeSql(d.featuredRecommendation ? d.featuredRecommendation.badge : 'Popular')}, ${escapeSql(JSON.stringify(d.moduleDescriptions || {}))}::jsonb)
ON CONFLICT (id) DO NOTHING;\n\n`;
}

// 7. CMS Manual Steps
if (Array.isArray(col.manual_steps) && col.manual_steps.length > 0) {
  sql += `-- 7. Seed Manual Steps (${col.manual_steps.length} steps)\n`;
  for (const ms of col.manual_steps) {
    sql += `INSERT INTO public.cms_manual_steps (id, icon, color, title, lead, body, visual_html, display_order, publication_status)
VALUES (${escapeSql(ms.id)}, ${escapeSql(ms.icon)}, ${escapeSql(ms.color)}, ${escapeSql(ms.title)}, ${escapeSql(ms.lead)}, ${escapeSql(ms.body)}, ${escapeSql(ms.visual || '')}, ${ms.display_order || 0}, 'published')
ON CONFLICT (id) DO NOTHING;\n`;
  }
  sql += '\n';
}

fs.writeFileSync(outputPath, sql, 'utf8');
console.log('Seed SQL file successfully created at:', outputPath);
console.log('Size:', sql.length, 'bytes');
