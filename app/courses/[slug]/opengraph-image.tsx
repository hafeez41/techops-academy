import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function CourseOGImage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("title, description, thumbnail_url, profiles(full_name)")
    .eq("slug", params.slug)
    .single();

  const title = course?.title ?? "TechOps Academy";
  const description =
    course?.description
      ? course.description.slice(0, 120) + (course.description.length > 120 ? "…" : "")
      : "Learn in-demand tech skills from expert instructors.";
  const instructor =
    (course?.profiles as { full_name: string | null } | null)?.full_name ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #f97316, #fb923c)",
          }}
        />

        {/* Logo wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#f97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "800",
              color: "white",
            }}
          >
            T
          </div>
          <span style={{ color: "#a1a1aa", fontSize: "16px", fontWeight: "600" }}>
            TechOps Academy
          </span>
        </div>

        {/* Course title */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: "800",
              color: "#fafafa",
              lineHeight: 1.15,
              marginBottom: "24px",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#a1a1aa",
              lineHeight: 1.5,
              maxWidth: "820px",
            }}
          >
            {description}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid #27272a",
          }}
        >
          {instructor && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#27272a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#f97316",
                }}
              >
                {instructor[0]?.toUpperCase()}
              </div>
              <span style={{ color: "#71717a", fontSize: "16px" }}>
                {instructor}
              </span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#f97316",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "15px",
              fontWeight: "700",
              color: "white",
              marginLeft: "auto",
            }}
          >
            Enroll Now →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
