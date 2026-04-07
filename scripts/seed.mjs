import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load YOUTUBE_API_KEY from .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
let YOUTUBE_API_KEY = null;
try {
  const envPath = resolve(__dirname, '../.env.local');
  const envContent = readFileSync(envPath, 'utf8');
  const match = envContent.match(/^YOUTUBE_API_KEY=(.+)$/m);
  if (match) YOUTUBE_API_KEY = match[1].trim();
} catch {
  // .env.local not found — durations will be null
}

const SUPABASE_URL = 'https://jkmljlyqjjxlsddswrps.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprbWxqbHlxamp4bHNkZHN3cnBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI2MjU3NCwiZXhwIjoyMDg5ODM4NTc0fQ.VboNRhUF1audjI8kNKaJKBD9ATtTYtrmGej6TF3_JUU';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) { console.log(msg); }

function die(context, error) {
  console.error(`ERROR [${context}]:`, error?.message ?? error);
  process.exit(1);
}

/** Extract YouTube video ID from URL or bare ID */
function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
}

/** Parse ISO 8601 duration string → total seconds (e.g. "PT2M42S" → 162) */
function parsePTDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  return (parseInt(m[1] ?? '0') * 3600) +
         (parseInt(m[2] ?? '0') * 60) +
         (parseInt(m[3] ?? '0'));
}

/** Fetch real duration in seconds from YouTube Data API v3.
 *  Returns null if API key missing or call fails. */
async function fetchYouTubeDuration(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId || !YOUTUBE_API_KEY) return null;
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const iso = data.items?.[0]?.contentDetails?.duration;
    if (!iso) return null;
    return parsePTDuration(iso);
  } catch {
    return null;
  }
}

/** Cascade-delete a course and all its related rows */
async function deleteCourse(courseId, title) {
  log(`  Deleting: "${title}" (${courseId})`);
  await Promise.all([
    sb.from('enrollments').delete().eq('course_id', courseId),
    sb.from('progress').delete().eq('course_id', courseId),
    sb.from('reviews').delete().eq('course_id', courseId),
    sb.from('lesson_unlocks').delete().eq('course_id', courseId),
    sb.from('course_prerequisites').delete().eq('course_id', courseId),
  ]);
  const { data: lessons } = await sb.from('lessons').select('id').eq('course_id', courseId);
  if (lessons?.length) {
    const ids = lessons.map((l) => l.id);
    await Promise.all([
      sb.from('lesson_files').delete().in('lesson_id', ids),
      sb.from('progress').delete().in('lesson_id', ids),
    ]);
  }
  await sb.from('lessons').delete().eq('course_id', courseId);
  await sb.from('course_sections').delete().eq('course_id', courseId);
  await sb.from('courses').delete().eq('id', courseId);
  log(`    Done.`);
}

// ─── Users ───────────────────────────────────────────────────────────────────

const USERS = [
  { name: 'Marcus Reid',  email: 'marcus.reid@techops.dev',  password: 'Instructor@123', role: 'instructor' },
  { name: 'Zara Ahmed',   email: 'zara.ahmed@techops.dev',   password: 'Student@123',    role: 'student'    },
  { name: 'Tyler Brooks', email: 'tyler.brooks@techops.dev', password: 'Student@123',    role: 'student'    },
];

// ─── Course definitions (duration_seconds resolved at runtime via API) ────────

function buildCourses(instructorId) {
  return [
    {
      course: {
        title: 'Linux Command Line Fundamentals',
        slug: 'linux-cli-fundamentals',
        description: 'Master the Linux terminal from scratch. Learn navigation, file management, permissions, scripting, and process management used by real sysadmins and DevOps engineers.',
        category: 'Linux',
        price: 0,
        progression_mode: 'self_paced',
        thumbnail_url: 'https://img.youtube.com/vi/rrB13utjYV4/maxresdefault.jpg',
        instructor_id: instructorId,
        is_published: true,
      },
      sections: [
        {
          section: { title: 'Getting Started', position: 1 },
          lessons: [
            { title: 'Linux in 100 Seconds',      external_url: 'https://www.youtube.com/watch?v=rrB13utjYV4', is_free_preview: true,  position: 1 },
            { title: 'The Shell & Bash',           external_url: 'https://www.youtube.com/watch?v=I_LjXdRCB6A', is_free_preview: true,  position: 2 },
            { title: 'Linux File System Layout',   external_url: 'https://www.youtube.com/watch?v=42iQKuQodW4', is_free_preview: false, position: 3 },
          ],
        },
        {
          section: { title: 'Core Commands', position: 2 },
          lessons: [
            { title: 'Text Editing with Vim',      external_url: 'https://www.youtube.com/watch?v=c4refvas1Zk', is_free_preview: false, position: 1 },
            { title: 'Version Control with Git',   external_url: 'https://www.youtube.com/watch?v=hwP7WQkmECE', is_free_preview: false, position: 2 },
            { title: 'Users, Groups & Permissions',external_url: null,                                           is_free_preview: false, position: 3 },
          ],
        },
        {
          section: { title: 'Shell Scripting', position: 3 },
          lessons: [
            { title: 'Bash Scripting Basics',      external_url: null, is_free_preview: false, position: 1 },
            { title: 'Variables & Control Flow',   external_url: null, is_free_preview: false, position: 2 },
            { title: 'Writing Your First Script',  external_url: null, is_free_preview: false, position: 3 },
          ],
        },
      ],
    },
    {
      course: {
        title: 'Docker & Containers',
        slug: 'docker-containers',
        description: 'Go from zero to containerizing real applications. Learn Docker fundamentals, image building, Docker Compose, and how containers fit into modern DevOps workflows.',
        category: 'DevOps',
        price: 0,
        progression_mode: 'self_paced',
        thumbnail_url: 'https://img.youtube.com/vi/Gjnup-PuquQ/maxresdefault.jpg',
        instructor_id: instructorId,
        is_published: true,
      },
      sections: [
        {
          section: { title: 'Container Fundamentals', position: 1 },
          lessons: [
            { title: 'Docker in 100 Seconds',          external_url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ', is_free_preview: true,  position: 1 },
            { title: 'Containers vs Virtual Machines', external_url: 'https://www.youtube.com/watch?v=PziYflu8cB8', is_free_preview: true,  position: 2 },
            { title: 'Installing Docker',              external_url: null,                                            is_free_preview: false, position: 3 },
          ],
        },
        {
          section: { title: 'Working with Images', position: 2 },
          lessons: [
            { title: 'Pulling & Running Containers', external_url: null, is_free_preview: false, position: 1 },
            { title: 'Writing a Dockerfile',         external_url: null, is_free_preview: false, position: 2 },
            { title: 'Volumes & Networking',         external_url: null, is_free_preview: false, position: 3 },
          ],
        },
        {
          section: { title: 'Docker Compose', position: 3 },
          lessons: [
            { title: 'Compose Basics',             external_url: null, is_free_preview: false, position: 1 },
            { title: 'Multi-Container Apps',       external_url: null, is_free_preview: false, position: 2 },
            { title: 'Production Best Practices',  external_url: null, is_free_preview: false, position: 3 },
          ],
        },
      ],
    },
    {
      course: {
        title: 'Python for Network & System Engineers',
        slug: 'python-for-sysadmins-v2',
        description: 'Learn Python specifically for IT professionals. Automate repetitive tasks, write network scripts, parse configs, and build tools that make your job easier.',
        category: 'Python',
        price: 49,
        progression_mode: 'self_paced',
        thumbnail_url: 'https://img.youtube.com/vi/x7X9w_GIm1s/maxresdefault.jpg',
        instructor_id: instructorId,
        is_published: true,
      },
      sections: [
        {
          section: { title: 'Python Foundations', position: 1 },
          lessons: [
            { title: 'Python in 100 Seconds',                  external_url: 'https://www.youtube.com/watch?v=x7X9w_GIm1s', is_free_preview: true,  position: 1 },
            { title: 'JavaScript vs Python — Key Differences', external_url: 'https://www.youtube.com/watch?v=DHjqpvDnNGE', is_free_preview: true,  position: 2 },
            { title: 'Variables, Types & Input',               external_url: null,                                            is_free_preview: false, position: 3 },
          ],
        },
        {
          section: { title: 'Working with Data', position: 2 },
          lessons: [
            { title: 'Lists, Dicts & Tuples', external_url: null, is_free_preview: false, position: 1 },
            { title: 'Functions & Modules',   external_url: null, is_free_preview: false, position: 2 },
            { title: 'File I/O & JSON',       external_url: null, is_free_preview: false, position: 3 },
          ],
        },
        {
          section: { title: 'Automation Scripts', position: 3 },
          lessons: [
            { title: 'OS & Subprocess Module',          external_url: null, is_free_preview: false, position: 1 },
            { title: 'SSH Automation with Paramiko',    external_url: null, is_free_preview: false, position: 2 },
            { title: 'Building a Network Scanner',      external_url: null, is_free_preview: false, position: 3 },
          ],
        },
      ],
    },
  ];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log('\n========================================');
  log('  TechOps Academy — Seed Script');
  log('========================================\n');

  if (YOUTUBE_API_KEY) {
    log('✓ YOUTUBE_API_KEY loaded — durations will be fetched from YouTube API\n');
  } else {
    log('⚠ YOUTUBE_API_KEY not found — durations will be null for lessons with video\n');
  }

  // ── 1. Create / find users ───────────────────────────────────────────────
  log('── Step 1: Creating users ──');
  const createdUsers = [];

  for (const u of USERS) {
    log(`  Creating user: ${u.name} <${u.email}> (${u.role})`);
    const { data: authData, error: authError } = await sb.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.name },
    });

    if (authError) {
      const msg = authError.message?.toLowerCase() ?? '';
      if (msg.includes('already') || authError.code === 'email_exists') {
        log(`    Already exists — looking up ID…`);
        const { data: listData, error: listError } = await sb.auth.admin.listUsers();
        if (listError) die('listUsers', listError);
        const existing = listData.users.find((x) => x.email === u.email);
        if (!existing) die('findUser', new Error(`Cannot find ${u.email}`));
        createdUsers.push({ ...u, id: existing.id });
        log(`    Found: ${existing.id}`);
      } else {
        die(`createUser(${u.email})`, authError);
      }
    } else {
      createdUsers.push({ ...u, id: authData.user.id });
      log(`    Created: ${authData.user.id}`);
    }
  }

  // ── 2. Upsert profiles ───────────────────────────────────────────────────
  log('\n── Step 2: Upserting profiles ──');
  for (const u of createdUsers) {
    const { error } = await sb.from('profiles').upsert(
      { id: u.id, full_name: u.name, role: u.role, email: u.email },
      { onConflict: 'id' }
    );
    if (error) die(`upsertProfile(${u.email})`, error);
    log(`  Upserted: ${u.name} → ${u.role}`);
  }

  // ── 3. Delete ALL courses by the instructor (no slug list, no gaps) ───────
  const instructor = createdUsers.find((u) => u.role === 'instructor');
  if (!instructor) die('findInstructor', new Error('No instructor in createdUsers'));

  log(`\n── Step 3: Deleting ALL courses for instructor ${instructor.name} ──`);
  const { data: existingCourses } = await sb
    .from('courses')
    .select('id, title')
    .eq('instructor_id', instructor.id);

  if (!existingCourses?.length) {
    log('  No existing courses found.');
  } else {
    for (const c of existingCourses) {
      await deleteCourse(c.id, c.title);
    }
  }

  // ── 4. Fetch YouTube durations ───────────────────────────────────────────
  log('\n── Step 4: Fetching YouTube durations ──');
  const courseDefs = buildCourses(instructor.id);

  // Collect all unique video URLs
  const urlSet = new Set();
  for (const def of courseDefs) {
    for (const sd of def.sections) {
      for (const l of sd.lessons) {
        if (l.external_url) urlSet.add(l.external_url);
      }
    }
  }

  // Fetch all durations in parallel
  const durationMap = {};
  await Promise.all(
    [...urlSet].map(async (url) => {
      const secs = await fetchYouTubeDuration(url);
      const id = extractYouTubeId(url);
      durationMap[url] = secs;
      log(`  ${id} → ${secs != null ? `${secs}s (${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')})` : 'null (API unavailable)'}`);
    })
  );

  // ── 5. Create new courses ────────────────────────────────────────────────
  log(`\n── Step 5: Creating new courses ──`);
  const createdCourses = [];

  for (const def of courseDefs) {
    log(`\n  Course: "${def.course.title}"`);
    const { data: courseData, error: courseError } = await sb
      .from('courses')
      .insert(def.course)
      .select()
      .single();
    if (courseError) die(`insertCourse(${def.course.slug})`, courseError);
    const courseId = courseData.id;
    log(`    Inserted → ${courseId}`);

    let totalLessons = 0;

    for (const sd of def.sections) {
      const { data: sectionData, error: sectionError } = await sb
        .from('course_sections')
        .insert({ ...sd.section, course_id: courseId })
        .select()
        .single();
      if (sectionError) die(`insertSection(${sd.section.title})`, sectionError);

      const lessonsToInsert = sd.lessons.map((l) => ({
        title: l.title,
        external_url: l.external_url ?? null,
        duration_seconds: l.external_url ? (durationMap[l.external_url] ?? null) : null,
        is_free_preview: l.is_free_preview,
        position: l.position,
        course_id: courseId,
        section_id: sectionData.id,
      }));

      const { error: lessonsError } = await sb.from('lessons').insert(lessonsToInsert);
      if (lessonsError) die(`insertLessons(section=${sectionData.id})`, lessonsError);

      for (const l of lessonsToInsert) {
        const dur = l.duration_seconds;
        const durStr = dur != null ? `${Math.floor(dur/60)}:${String(dur%60).padStart(2,'0')}` : '—';
        log(`      ${l.position}. ${l.title} [${durStr}]`);
      }
      totalLessons += lessonsToInsert.length;
    }

    createdCourses.push({ title: def.course.title, slug: def.course.slug, id: courseId, lessons: totalLessons });
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  log('\n========================================');
  log('  SEED COMPLETE');
  log('========================================\n');

  log('Users:');
  for (const u of createdUsers) {
    log(`  [${u.role.padEnd(10)}] ${u.name}  ${u.email}  ${u.password}`);
  }

  log('\nCourses:');
  for (const c of createdCourses) {
    log(`  "${c.title}"  slug: ${c.slug}  lessons: ${c.lessons}`);
  }

  log('\nDone.\n');
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
