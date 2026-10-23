/**
 * ARSelNel Staging Simulation & Policy Test Suite
 * Simulates PostgreSQL RLS execution for 202610230003_safe_production_migration.sql
 * Validates permissions across Anonymous, Student, and Admin personas.
 */

const assert = require('assert');

console.log('====================================================');
console.log(' ARSelNel Isolated Staging Simulation Test Suite');
console.log(' Mode: READ-ONLY ISOLATED SECURITY EVALUATION');
console.log('====================================================');

// Mock Database State
const db = {
  admin_users: [
    { user_id: 'admin-uuid-1', email: 'admin@arselnel.edu.my' }
  ],
  learning_notes: [
    {
      id: 'slide_topic1',
      title: '1. Sel Sebagai Unit Asas Kehidupan (Original)',
      publication_status: 'published',
      created_by: 'admin-uuid-1'
    },
    {
      id: 'slide_topic_draft',
      title: 'Draft Bab 3: Sistem Respirasi',
      publication_status: 'draft',
      created_by: 'admin-uuid-1'
    }
  ],
  student_annotations: [
    { id: 'ann-1', note_id: 'slide_topic1', student_id: 'student-uuid-alice', page_number: 1, annotation_data: { draw: true } },
    { id: 'ann-2', note_id: 'slide_topic1', student_id: 'student-uuid-bob', page_number: 1, annotation_data: { draw: false } }
  ],
  storage_objects: [
    { name: 'video1.mp4', bucket_id: 'educational_media', owner: 'admin-uuid-1' }
  ]
};

// Simulation of public.is_admin() hardened logic
function simulateIsAdmin(session) {
  if (!session || !session.uid) return false;
  // 1. Check admin_users table
  if (db.admin_users.some(a => a.user_id === session.uid)) return true;
  // 2. Check app_metadata
  if (session.jwt && session.jwt.app_metadata && ['admin', 'guru', 'teacher'].includes(session.jwt.app_metadata.role)) {
    return true;
  }
  // user_metadata is ignored intentionally!
  return false;
}

// Simulated RLS Evaluate function
const rls = {
  learning_notes: {
    select: (session, row) => row.publication_status === 'published' || simulateIsAdmin(session),
    insert: (session, newRow) => simulateIsAdmin(session),
    update: (session, oldRow, newRow) => simulateIsAdmin(session),
    delete: (session, oldRow) => simulateIsAdmin(session)
  },
  student_annotations: {
    select: (session, row) => session && session.uid === row.student_id,
    insert: (session, newRow) => session && session.uid === newRow.student_id,
    update: (session, oldRow, newRow) => session && session.uid === oldRow.student_id && session.uid === newRow.student_id,
    delete: (session, oldRow) => session && session.uid === oldRow.student_id
  },
  storage_objects: {
    select: (session, row) => row.bucket_id === 'educational_media',
    insert: (session, newObj) => newObj.bucket_id === 'educational_media' && simulateIsAdmin(session),
    update: (session, oldObj, newObj) => newObj.bucket_id === 'educational_media' && simulateIsAdmin(session),
    delete: (session, oldObj) => oldObj.bucket_id === 'educational_media' && simulateIsAdmin(session)
  }
};

// Persona sessions
const anonSession = null;
const studentAliceSession = {
  uid: 'student-uuid-alice',
  jwt: {
    user_metadata: { role: 'admin' }, // Tampered metadata trying privilege escalation
    app_metadata: { role: 'student' }
  }
};
const verifiedAdminSession = {
  uid: 'admin-uuid-1',
  jwt: {
    app_metadata: { role: 'admin' }
  }
};

const results = [];

function runTest(testName, fn) {
  try {
    fn();
    results.push({ name: testName, status: 'PASS' });
    console.log(`[PASS] ${testName}`);
  } catch (err) {
    results.push({ name: testName, status: 'FAIL', error: err.message });
    console.error(`[FAIL] ${testName}: ${err.message}`);
  }
}

// 1. Student tests
runTest('Student CAN read published learning notes', () => {
  const published = db.learning_notes.find(n => n.id === 'slide_topic1');
  assert.strictEqual(rls.learning_notes.select(studentAliceSession, published), true);
});

runTest('Student CANNOT read draft learning notes', () => {
  const draft = db.learning_notes.find(n => n.id === 'slide_topic_draft');
  assert.strictEqual(rls.learning_notes.select(studentAliceSession, draft), false);
});

runTest('Student CANNOT insert CMS learning notes even with tampered user_metadata', () => {
  const canInsert = rls.learning_notes.insert(studentAliceSession, { id: 'hacked_note' });
  assert.strictEqual(canInsert, false);
});

runTest('Student CANNOT update CMS learning notes', () => {
  const note = db.learning_notes[0];
  const canUpdate = rls.learning_notes.update(studentAliceSession, note, { ...note, title: 'Defaced' });
  assert.strictEqual(canUpdate, false);
});

runTest('Student CANNOT delete CMS learning notes', () => {
  const note = db.learning_notes[0];
  const canDelete = rls.learning_notes.delete(studentAliceSession, note);
  assert.strictEqual(canDelete, false);
});

runTest('Student CANNOT upload to educational_media storage', () => {
  const canUpload = rls.storage_objects.insert(studentAliceSession, { bucket_id: 'educational_media', name: 'student.pdf' });
  assert.strictEqual(canUpload, false);
});

runTest('Student CANNOT delete or overwrite educational_media storage objects', () => {
  const obj = db.storage_objects[0];
  assert.strictEqual(rls.storage_objects.update(studentAliceSession, obj, { ...obj, name: 'replaced.mp4' }), false);
  assert.strictEqual(rls.storage_objects.delete(studentAliceSession, obj), false);
});

runTest('Student can read and manage own annotations only', () => {
  const aliceAnn = db.student_annotations.find(a => a.student_id === 'student-uuid-alice');
  const bobAnn = db.student_annotations.find(a => a.student_id === 'student-uuid-bob');
  assert.strictEqual(rls.student_annotations.select(studentAliceSession, aliceAnn), true);
  assert.strictEqual(rls.student_annotations.select(studentAliceSession, bobAnn), false);
});

// 2. Admin tests
runTest('Admin CAN read both published and draft notes', () => {
  const published = db.learning_notes.find(n => n.id === 'slide_topic1');
  const draft = db.learning_notes.find(n => n.id === 'slide_topic_draft');
  assert.strictEqual(rls.learning_notes.select(verifiedAdminSession, published), true);
  assert.strictEqual(rls.learning_notes.select(verifiedAdminSession, draft), true);
});

runTest('Admin CAN insert, update, and delete learning notes', () => {
  const note = db.learning_notes[0];
  assert.strictEqual(rls.learning_notes.insert(verifiedAdminSession, { id: 'new_note' }), true);
  assert.strictEqual(rls.learning_notes.update(verifiedAdminSession, note, { ...note, title: 'Updated' }), true);
  assert.strictEqual(rls.learning_notes.delete(verifiedAdminSession, note), true);
});

runTest('Admin CAN upload, update, and delete educational media in storage', () => {
  const obj = db.storage_objects[0];
  assert.strictEqual(rls.storage_objects.insert(verifiedAdminSession, { bucket_id: 'educational_media', name: 'new.pdf' }), true);
  assert.strictEqual(rls.storage_objects.update(verifiedAdminSession, obj, obj), true);
  assert.strictEqual(rls.storage_objects.delete(verifiedAdminSession, obj), true);
});

// 3. Seed idempotency simulation
runTest('Seed ON CONFLICT DO NOTHING preserves existing notes and admin edits', () => {
  const originalNotes = [
    { id: 'slide_topic1', title: 'Admin Custom Title', publication_status: 'published' }
  ];
  const incomingSeed = [
    { id: 'slide_topic1', title: 'Default Seed Title', publication_status: 'published' },
    { id: 'slide_topic2', title: 'Topic 2 Default Seed', publication_status: 'published' }
  ];

  // Simulate INSERT ... ON CONFLICT (id) DO NOTHING
  for (const item of incomingSeed) {
    if (!originalNotes.some(n => n.id === item.id)) {
      originalNotes.push(item);
    }
  }

  // Verify slide_topic1 was not modified
  assert.strictEqual(originalNotes.find(n => n.id === 'slide_topic1').title, 'Admin Custom Title');
  assert.strictEqual(originalNotes.length, 2);
});

console.log('====================================================');
const failed = results.filter(r => r.status === 'FAIL').length;
console.log(`Simulation complete: ${results.length - failed} / ${results.length} tests passed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('STAGING SIMULATION PASSED WITHOUT ERRORS.');
}
