import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jkmljlyqjjxlsddswrps.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprbWxqbHlxamp4bHNkZHN3cnBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI2MjU3NCwiZXhwIjoyMDg5ODM4NTc0fQ.VboNRhUF1audjI8kNKaJKBD9ATtTYtrmGej6TF3_JUU';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Users ───────────────────────────────────────────────────────────────────

const USERS = [
  {
    name: 'Marcus Reid',
    email: 'marcus.reid@techops.dev',
    password: 'Instructor@123',
    role: 'instructor',
  },
  {
    name: 'Zara Ahmed',
    email: 'zara.ahmed@techops.dev',
    password: 'Student@123',
    role: 'student',
  },
  {
    name: 'Tyler Brooks',
    email: 'tyler.brooks@techops.dev',
    password: 'Student@123',
    role: 'student',
  },
];

// ─── Slugs to delete (handles both old and current courses) ──────────────────

const SLUGS_TO_DELETE = [
  // original sample courses
  'docker-kubernetes-scratch',
  'network-security-essentials',
  'linux-fundamentals-beginners',
  'aws-cloud-practitioner',
  'python-system-administrators',
  // current seeded courses
  'linux-cli-fundamentals',
  'docker-containers',
  'python-for-sysadmins-v2',
  // catch any other test courses
  'python-for-sysadmins',
];

// ─── New courses data ─────────────────────────────────────────────────────────

function buildCourses(instructorId) {
  return [
    {
      course: {
        title: 'Linux Command Line Fundamentals',
        slug: 'linux-cli-fundamentals',
        description:
          'Master the Linux terminal from scratch. Learn navigation, file management, permissions, scripting, and process management used by real sysadmins and DevOps engineers.',
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
            {
              title: 'Linux in 100 Seconds',
              external_url: 'https://www.youtube.com/watch?v=rrB13utjYV4',
              duration_seconds: 100,
              is_free_preview: true,
              position: 1,
            },
            {
              title: 'Setting Up Your Environment',
              external_url: 'https://www.youtube.com/watch?v=VbEx7B_PTOE',
              duration_seconds: 840,
              is_free_preview: true,
              position: 2,
            },
            {
              title: 'Navigating the File System',
              external_url: 'https://www.youtube.com/watch?v=39oyFIStuaI',
              duration_seconds: 900,
              is_free_preview: false,
              position: 3,
            },
          ],
        },
        {
          section: { title: 'Core Commands', position: 2 },
          lessons: [
            {
              title: 'Files, Directories & Paths',
              external_url: 'https://www.youtube.com/watch?v=s3ii48qYBxA',
              duration_seconds: 780,
              is_free_preview: false,
              position: 1,
            },
            {
              title: 'Users, Groups & Permissions',
              external_url: 'https://www.youtube.com/watch?v=jwnvKOjmtEA',
              duration_seconds: 860,
              is_free_preview: false,
              position: 2,
            },
            {
              title: 'Processes & System Info',
              external_url: 'https://www.youtube.com/watch?v=TJzltwv7jJs',
              duration_seconds: 720,
              is_free_preview: false,
              position: 3,
            },
          ],
        },
        {
          section: { title: 'Shell Scripting', position: 3 },
          lessons: [
            {
              title: 'Bash Scripting Basics',
              external_url: 'https://www.youtube.com/watch?v=tK9Oc6AEnR4',
              duration_seconds: 940,
              is_free_preview: false,
              position: 1,
            },
            {
              title: 'Variables & Control Flow',
              external_url: 'https://www.youtube.com/watch?v=v-F3YLd6oMw',
              duration_seconds: 860,
              is_free_preview: false,
              position: 2,
            },
            {
              title: 'Writing Your First Script',
              external_url: 'https://www.youtube.com/watch?v=1SNDQdMlMiY',
              duration_seconds: 800,
              is_free_preview: false,
              position: 3,
            },
          ],
        },
      ],
    },
    {
      course: {
        title: 'Docker & Containers',
        slug: 'docker-containers',
        description:
          'Go from zero to containerizing real applications. Learn Docker fundamentals, image building, Docker Compose, and how containers fit into modern DevOps workflows.',
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
            {
              title: 'Docker in 100 Seconds',
              external_url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ',
              duration_seconds: 100,
              is_free_preview: true,
              position: 1,
            },
            {
              title: 'What is a Container?',
              external_url: 'https://www.youtube.com/watch?v=EnJ7qX9fkcU',
              duration_seconds: 560,
              is_free_preview: true,
              position: 2,
            },
            {
              title: 'Installing Docker',
              external_url: 'https://www.youtube.com/watch?v=oPzDuSBzGj0',
              duration_seconds: 680,
              is_free_preview: false,
              position: 3,
            },
          ],
        },
        {
          section: { title: 'Working with Images', position: 2 },
          lessons: [
            {
              title: 'Pulling & Running Containers',
              external_url: 'https://www.youtube.com/watch?v=iqqDU2crIEQ',
              duration_seconds: 820,
              is_free_preview: false,
              position: 1,
            },
            {
              title: 'Writing a Dockerfile',
              external_url: 'https://www.youtube.com/watch?v=LQjaJINkQXY',
              duration_seconds: 740,
              is_free_preview: false,
              position: 2,
            },
            {
              title: 'Volumes & Networking',
              external_url: 'https://www.youtube.com/watch?v=SO3XIJc4sWY',
              duration_seconds: 780,
              is_free_preview: false,
              position: 3,
            },
          ],
        },
        {
          section: { title: 'Docker Compose', position: 3 },
          lessons: [
            {
              title: 'Compose Basics',
              external_url: 'https://www.youtube.com/watch?v=DM65_JyGxCo',
              duration_seconds: 900,
              is_free_preview: false,
              position: 1,
            },
            {
              title: 'Multi-Container Apps',
              external_url: 'https://www.youtube.com/watch?v=MVIcrmeV_6c',
              duration_seconds: 860,
              is_free_preview: false,
              position: 2,
            },
            {
              title: 'Production Best Practices',
              external_url: 'https://www.youtube.com/watch?v=y6b0xI6GCGY',
              duration_seconds: 760,
              is_free_preview: false,
              position: 3,
            },
          ],
        },
      ],
    },
    {
      course: {
        title: 'Python for Network & System Engineers',
        slug: 'python-for-sysadmins-v2',
        description:
          'Learn Python specifically for IT professionals. Automate repetitive tasks, write network scripts, parse configs, and build tools that make your job easier.',
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
            {
              title: 'Python in 100 Seconds',
              external_url: 'https://www.youtube.com/watch?v=x7X9w_GIm1s',
              duration_seconds: 100,
              is_free_preview: true,
              position: 1,
            },
            {
              title: 'Variables, Types & Input',
              external_url: 'https://www.youtube.com/watch?v=cKPlPJyQrt4',
              duration_seconds: 800,
              is_free_preview: true,
              position: 2,
            },
            {
              title: 'Control Flow & Loops',
              external_url: 'https://www.youtube.com/watch?v=6iF8Xb7Z3wQ',
              duration_seconds: 860,
              is_free_preview: false,
              position: 3,
            },
          ],
        },
        {
          section: { title: 'Working with Data', position: 2 },
          lessons: [
            {
              title: 'Lists, Dicts & Tuples',
              external_url: 'https://www.youtube.com/watch?v=W8KRzm-HUcc',
              duration_seconds: 920,
              is_free_preview: false,
              position: 1,
            },
            {
              title: 'Functions & Modules',
              external_url: 'https://www.youtube.com/watch?v=9Os0o3wzS_I',
              duration_seconds: 780,
              is_free_preview: false,
              position: 2,
            },
            {
              title: 'File I/O & JSON',
              external_url: 'https://www.youtube.com/watch?v=Uh2ebFW8OYM',
              duration_seconds: 840,
              is_free_preview: false,
              position: 3,
            },
          ],
        },
        {
          section: { title: 'Automation Scripts', position: 3 },
          lessons: [
            {
              title: 'OS & Subprocess Module',
              external_url: 'https://www.youtube.com/watch?v=2Fp1N6dof0Y',
              duration_seconds: 760,
              is_free_preview: false,
              position: 1,
            },
            {
              title: 'Paramiko SSH Automation',
              external_url: 'https://www.youtube.com/watch?v=tHEWGl1gPWk',
              duration_seconds: 900,
              is_free_preview: false,
              position: 2,
            },
            {
              title: 'Building a Network Scanner',
              external_url: 'https://www.youtube.com/watch?v=MBOKQVaSAJg',
              duration_seconds: 980,
              is_free_preview: false,
              position: 3,
            },
          ],
        },
      ],
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(msg);
}

function die(context, error) {
  console.error(`ERROR [${context}]:`, error?.message ?? error);
  process.exit(1);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log('\n========================================');
  log('  TechOps Academy — Seed Script');
  log('========================================\n');

  // ── 1. Create users ──────────────────────────────────────────────────────
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
      if (authError.message?.toLowerCase().includes('already been registered') ||
          authError.message?.toLowerCase().includes('already exists') ||
          authError.code === 'email_exists') {
        // User already exists — fetch their ID
        log(`    User already exists, fetching existing ID…`);
        const { data: listData, error: listError } = await sb.auth.admin.listUsers();
        if (listError) die('listUsers', listError);
        const existing = listData.users.find((x) => x.email === u.email);
        if (!existing) die('findUser', new Error(`Could not find existing user ${u.email}`));
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
    log(`  Upserted profile: ${u.name} → role=${u.role}`);
  }

  // ── 3. Delete old courses by slug ───────────────────────────────────────
  log('\n── Step 3: Deleting old courses ──');

  for (const slug of SLUGS_TO_DELETE) {
    const { data: course } = await sb.from('courses').select('id, title').eq('slug', slug).single();
    if (!course) { log(`  Skipping "${slug}" — not found`); continue; }

    log(`  Deleting: "${course.title}" (${course.id})`);

    // Cascade delete all related data
    await Promise.all([
      sb.from('enrollments').delete().eq('course_id', course.id),
      sb.from('progress').delete().eq('course_id', course.id),
      sb.from('reviews').delete().eq('course_id', course.id),
      sb.from('lesson_unlocks').delete().eq('course_id', course.id),
      sb.from('course_prerequisites').delete().eq('course_id', course.id),
    ]);

    const { data: lessons } = await sb.from('lessons').select('id').eq('course_id', course.id);
    if (lessons?.length) {
      const lessonIds = lessons.map((l) => l.id);
      await sb.from('lesson_files').delete().in('lesson_id', lessonIds);
      await sb.from('progress').delete().in('lesson_id', lessonIds);
    }
    await sb.from('lessons').delete().eq('course_id', course.id);
    await sb.from('course_sections').delete().eq('course_id', course.id);
    await sb.from('courses').delete().eq('id', course.id);
    log(`    Done.`);
  }

  // ── 4. Create new courses ────────────────────────────────────────────────
  const instructor = createdUsers.find((u) => u.role === 'instructor');
  if (!instructor) die('findInstructor', new Error('No instructor found in createdUsers'));

  log(`\n── Step 4: Creating new courses (instructor: ${instructor.name}) ──`);

  const courseDefs = buildCourses(instructor.id);
  const createdCourses = [];

  for (const def of courseDefs) {
    log(`\n  Course: "${def.course.title}"`);

    // Insert course
    const { data: courseData, error: courseError } = await sb
      .from('courses')
      .insert(def.course)
      .select()
      .single();
    if (courseError) die(`insertCourse(${def.course.slug})`, courseError);
    const courseId = courseData.id;
    log(`    Inserted course → ${courseId}`);

    let totalLessons = 0;

    for (const sd of def.sections) {
      // Insert section
      const { data: sectionData, error: sectionError } = await sb
        .from('course_sections')
        .insert({ ...sd.section, course_id: courseId })
        .select()
        .single();
      if (sectionError) die(`insertSection(${sd.section.title})`, sectionError);
      const sectionId = sectionData.id;
      log(`    Section "${sd.section.title}" → ${sectionId}`);

      // Insert lessons
      const lessonsToInsert = sd.lessons.map((l) => ({
        ...l,
        course_id: courseId,
        section_id: sectionId,
      }));

      const { error: lessonsError } = await sb.from('lessons').insert(lessonsToInsert);
      if (lessonsError) die(`insertLessons(section=${sectionId})`, lessonsError);
      log(`      Inserted ${lessonsToInsert.length} lessons`);
      totalLessons += lessonsToInsert.length;
    }

    createdCourses.push({
      title: def.course.title,
      slug: def.course.slug,
      id: courseId,
      sections: def.sections.length,
      lessons: totalLessons,
    });
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  log('\n========================================');
  log('  SEED COMPLETE — SUMMARY');
  log('========================================\n');

  log('Users created / upserted:');
  for (const u of createdUsers) {
    log(`  [${u.role.padEnd(10)}] ${u.name}`);
    log(`             Email   : ${u.email}`);
    log(`             Password: ${u.password}`);
    log(`             UUID    : ${u.id}`);
  }

  log('\nOld courses deleted (by slug):');
  for (const slug of SLUGS_TO_DELETE) {
    log(`  - ${slug}`);
  }

  log('\nNew courses created:');
  for (const c of createdCourses) {
    log(`  - "${c.title}"`);
    log(`    slug    : ${c.slug}`);
    log(`    id      : ${c.id}`);
    log(`    sections: ${c.sections}  lessons: ${c.lessons}`);
  }

  log('\nDone.\n');
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
