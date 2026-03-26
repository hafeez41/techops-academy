export type UserRole = "student" | "instructor" | "admin";

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
  created_at: string;
  profiles?: Profile;
  lessons?: Lesson[];
  enrollments?: { count: number }[];
  reviews?: Review[];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  mux_asset_id: string | null;
  mux_playback_id: string | null;
  duration_seconds: number | null;
  position: number;
  is_free_preview: boolean;
  created_at: string;
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
