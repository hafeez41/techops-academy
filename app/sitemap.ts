import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("slug, updated_at")
    .eq("is_published", true);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://techopsacademy.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = (courses ?? []).map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
