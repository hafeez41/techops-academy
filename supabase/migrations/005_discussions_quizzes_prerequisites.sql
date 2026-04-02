-- ============================================================
-- Migration 005: Discussions, Quizzes, Prerequisites, Video Position
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. Add 'quiz' to lesson_type check constraint
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_type_check;
ALTER TABLE lessons ADD CONSTRAINT lessons_type_check
  CHECK (lesson_type IN ('video', 'text', 'link', 'mixed', 'quiz'));

-- 2. Last visited lesson tracking on enrollments
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS last_visited_lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL;

-- 3. Discussion comments per lesson
CREATE TABLE IF NOT EXISTS lesson_comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id  UUID        NOT NULL REFERENCES lessons(id)        ON DELETE CASCADE,
  course_id  UUID        NOT NULL REFERENCES courses(id)        ON DELETE CASCADE,
  student_id UUID        NOT NULL REFERENCES profiles(id)       ON DELETE CASCADE,
  parent_id  UUID        REFERENCES lesson_comments(id)         ON DELETE CASCADE,
  body       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrolled_read_comments" ON lesson_comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM enrollments  WHERE student_id = auth.uid() AND course_id = lesson_comments.course_id)
    OR EXISTS (SELECT 1 FROM courses   WHERE id = lesson_comments.course_id AND instructor_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles  WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "enrolled_post_comments" ON lesson_comments
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM enrollments WHERE student_id = auth.uid() AND course_id = lesson_comments.course_id)
      OR EXISTS (SELECT 1 FROM courses   WHERE id = lesson_comments.course_id AND instructor_id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles  WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "own_delete_comments" ON lesson_comments
  FOR DELETE USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM courses  WHERE id = lesson_comments.course_id AND instructor_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Quiz questions, options, and attempts
CREATE TABLE IF NOT EXISTS quiz_questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id      UUID        NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  course_id      UUID        NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  question       TEXT        NOT NULL,
  position       INTEGER     NOT NULL DEFAULT 0,
  pass_threshold INTEGER     NOT NULL DEFAULT 70,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_options (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID        NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  text        TEXT        NOT NULL,
  is_correct  BOOLEAN     NOT NULL DEFAULT false,
  position    INTEGER     NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  student_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id    UUID        NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  course_id    UUID        NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  score        INTEGER     NOT NULL DEFAULT 0,
  passed       BOOLEAN     NOT NULL DEFAULT false,
  answers      JSONB       NOT NULL DEFAULT '{}',
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, lesson_id)
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options   ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_read_quiz_questions" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "anyone_read_quiz_options"   ON quiz_options   FOR SELECT USING (true);

CREATE POLICY "instructors_manage_questions" ON quiz_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM courses  WHERE id = quiz_questions.course_id AND instructor_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "instructors_manage_options" ON quiz_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_questions q
      JOIN courses c ON c.id = q.course_id
      WHERE q.id = quiz_options.question_id
        AND (c.instructor_id = auth.uid()
             OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "students_own_attempts" ON quiz_attempts
  FOR ALL USING (student_id = auth.uid());

-- 5. Course prerequisites
CREATE TABLE IF NOT EXISTS course_prerequisites (
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  prerequisite_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, prerequisite_id)
);

ALTER TABLE course_prerequisites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_read_prerequisites" ON course_prerequisites
  FOR SELECT USING (true);

CREATE POLICY "instructors_manage_prerequisites" ON course_prerequisites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM courses  WHERE id = course_prerequisites.course_id AND instructor_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Video resume position
CREATE TABLE IF NOT EXISTS video_positions (
  student_id       UUID  NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id        UUID  NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  position_seconds FLOAT NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, lesson_id)
);

ALTER TABLE video_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_own_positions" ON video_positions
  FOR ALL USING (student_id = auth.uid());
