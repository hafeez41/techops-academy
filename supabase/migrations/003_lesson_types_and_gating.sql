-- ============================================================
-- Migration 003: Lesson types + instructor-gated progression
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. Add rich lesson type fields to lessons
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS lesson_type TEXT NOT NULL DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS content      TEXT,
  ADD COLUMN IF NOT EXISTS external_url TEXT;

ALTER TABLE lessons
  DROP CONSTRAINT IF EXISTS lessons_type_check;
ALTER TABLE lessons
  ADD CONSTRAINT lessons_type_check
  CHECK (lesson_type IN ('video', 'text', 'link', 'mixed'));

-- 2. Add progression mode to courses
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS progression_mode TEXT NOT NULL DEFAULT 'self_paced';

ALTER TABLE courses
  DROP CONSTRAINT IF EXISTS courses_progression_mode_check;
ALTER TABLE courses
  ADD CONSTRAINT courses_progression_mode_check
  CHECK (progression_mode IN ('self_paced', 'instructor_gated'));

-- 3. Track who enrolled a student (instructor-assigned vs self-enrolled)
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS enrolled_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 4. Lesson-level unlock table for instructor-gated courses
CREATE TABLE IF NOT EXISTS lesson_unlocks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID        NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  course_id    UUID        NOT NULL REFERENCES courses(id)   ON DELETE CASCADE,
  lesson_id    UUID        NOT NULL REFERENCES lessons(id)   ON DELETE CASCADE,
  unlocked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlocked_by  UUID        REFERENCES profiles(id)           ON DELETE SET NULL,
  UNIQUE (student_id, lesson_id)
);

-- 5. Helper function: look up a user's ID by email (SECURITY DEFINER reads auth.users)
CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE email = lower(trim(p_email)) LIMIT 1;
$$;

-- 6. RLS for lesson_unlocks
ALTER TABLE lesson_unlocks ENABLE ROW LEVEL SECURITY;

-- Instructors can manage unlocks for their own courses
CREATE POLICY "instructors_manage_unlocks" ON lesson_unlocks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lesson_unlocks.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

-- Students can read their own unlocks
CREATE POLICY "students_view_own_unlocks" ON lesson_unlocks
  FOR SELECT
  USING (student_id = auth.uid());

-- Admins have full access
CREATE POLICY "admins_all_unlocks" ON lesson_unlocks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
