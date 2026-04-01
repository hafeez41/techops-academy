import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { SettingsForm } from "@/components/shared/settings-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, bio, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Detect whether the user has a password-based identity (vs OAuth-only)
  const hasPasswordAuth = user.identities?.some((i) => i.provider === "email") ?? true;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile and account security
          </p>
        </div>
        <SettingsForm profile={profile} hasPasswordAuth={hasPasswordAuth} />
      </main>
    </div>
  );
}
