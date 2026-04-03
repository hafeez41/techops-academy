-- Migration 006: Performance indexes
-- Run in Supabase SQL editor

-- Enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);

-- Progress
CREATE INDEX IF NOT EXISTS idx_progress_student_course ON progress(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);

-- Lessons
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_position ON lessons(course_id, position);

-- Lesson comments
CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson_id ON lesson_comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_parent_id ON lesson_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_student_id ON lesson_comments(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_created_at ON lesson_comments(created_at DESC);

-- Quiz questions
CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson_id ON quiz_questions(lesson_id);

-- Quiz options
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);

-- Quiz attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson_id ON quiz_attempts(lesson_id);

-- Video positions
CREATE INDEX IF NOT EXISTS idx_video_positions_student_lesson ON video_positions(student_id, lesson_id);

-- Course prerequisites
CREATE INDEX IF NOT EXISTS idx_course_prerequisites_course_id ON course_prerequisites(course_id);
CREATE INDEX IF NOT EXISTS idx_course_prerequisites_prerequisite_id ON course_prerequisites(prerequisite_id);

-- Lesson unlocks
CREATE INDEX IF NOT EXISTS idx_lesson_unlocks_student_course ON lesson_unlocks(student_id, course_id);

-- Notes
CREATE INDEX IF NOT EXISTS idx_notes_student_lesson ON lesson_notes(student_id, lesson_id);
