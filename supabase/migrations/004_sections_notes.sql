-- Course sections
CREATE TABLE IF NOT EXISTS course_sections (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  position    INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES course_sections(id) ON DELETE SET NULL;

-- Lesson notes (one per student per lesson, upserted)
CREATE TABLE IF NOT EXISTS lesson_notes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id   UUID        NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  course_id   UUID        NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  content     TEXT        NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, lesson_id)
);

ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_manage_own_notes" ON lesson_notes
  FOR ALL USING (student_id = auth.uid());

ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_read_sections" ON course_sections
  FOR SELECT USING (true);

CREATE POLICY "instructors_manage_sections" ON course_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = course_sections.course_id AND courses.instructor_id = auth.uid())
  );

CREATE POLICY "admins_all_sections" ON course_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
