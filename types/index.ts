export type UserRole = "student" | "instructor" | "admin";
export type LessonType = "video" | "text" | "link" | "mixed" | "quiz";
export type ProgressionMode = "self_paced" | "instructor_gated";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  categories: string[];
  is_published: boolean;
  progression_mode: ProgressionMode;
  created_at: string;
  profiles?: Profile;
  lessons?: Lesson[];
  enrollments?: { count: number }[];
  reviews?: Review[];
}

export interface Lesson {
  id: string;
  course_id: string;
  section_id: string | null;
  title: string;
  description: string | null;
  lesson_type: LessonType;
  content: string | null;
  external_url: string | null;
  mux_asset_id: string | null;
  mux_playback_id: string | null;
  duration_seconds: number | null;
  position: number;
  is_free_preview: boolean;
  created_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  position: number;
  created_at: string;
  lessons?: Lesson[];
}

export interface LessonNote {
  id: string;
  student_id: string;
  lesson_id: string;
  course_id: string;
  content: string;
  updated_at: string;
}

export interface LessonUnlock {
  id: string;
  student_id: string;
  course_id: string;
  lesson_id: string;
  unlocked_at: string;
  unlocked_by: string | null;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  courses?: Course;
}

export interface Progress {
  id: string;
  student_id: string;
  lesson_id: string;
  course_id: string;
  completed_at: string;
}

export interface Review {
  id: string;
  student_id: string;
  course_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface LessonComment {
  id: string;
  lesson_id: string;
  course_id: string;
  student_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null };
  replies?: LessonComment[];
}

export interface QuizQuestion {
  id: string;
  lesson_id: string;
  course_id: string;
  question: string;
  position: number;
  pass_threshold: number;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  position: number;
}

export interface QuizAttempt {
  student_id: string;
  lesson_id: string;
  course_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  attempted_at: string;
}

export interface CoursePrerequisite {
  course_id: string;
  prerequisite_id: string;
  courses?: Pick<Course, "id" | "title" | "slug">;
}

export const CATEGORIES = [
  "DevOps",
  "Cloud",
  "Security",
  "Networking",
  "Programming",
  "Databases",
  "AI/ML",
  "Web Development",
  "Mobile",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
