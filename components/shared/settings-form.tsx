"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, User, Lock, ShieldOff } from "lucide-react";
import type { Profile } from "@/types";

export function SettingsForm({ profile, hasPasswordAuth }: { profile: Profile; hasPasswordAuth: boolean }) {
  const supabase = createClient();

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null, bio: bio.trim() || null })
      .eq("id", profile.id);

    if (error) {
      setProfileError(error.message);
    } else {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
    setProfileSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setPasswordSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setPasswordError("Could not verify your session. Please sign in again.");
      setPasswordSaving(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordError("Current password is incorrect.");
      setPasswordSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    }
    setPasswordSaving(false);
  };

  return (
    <div className="space-y-8">
      {/* Profile section */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 border border-brand/20">
            <User className="h-4 w-4 text-brand" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
            <p className="text-xs text-muted-foreground">Update your public profile information</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <form onSubmit={handleProfileSave} className="space-y-5">
            {profileError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2.5">
                {profileError}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="h-11 rounded-xl border-border/60 focus-visible:ring-brand/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-sm font-medium">
                Bio{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself"
                rows={3}
                className="rounded-xl border-border/60 focus-visible:ring-brand/30 resize-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                disabled={profileSaving}
                className={
                  profileSaved
                    ? "rounded-xl bg-emerald-600 hover:bg-emerald-600 text-white h-10"
                    : "rounded-xl bg-brand text-brand-foreground hover:bg-brand/90 h-10 shadow-sm shadow-brand/20"
                }
              >
                {profileSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : profileSaved ? (
                  <CheckCircle className="mr-2 h-4 w-4" />
                ) : null}
                {profileSaving ? "Saving…" : profileSaved ? "Saved!" : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <Separator className="border-border/40" />

      {/* Password section */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted border border-border/50">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {hasPasswordAuth ? "Change password" : "Password"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {hasPasswordAuth ? "Update your account password" : "Manage your login method"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6">
          {!hasPasswordAuth ? (
            <div className="flex items-start gap-3">
              <ShieldOff className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                You signed in with Google. Password-based login is not available for your account.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-5">
              {passwordError && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2.5">
                  {passwordError}
                </p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  Current password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-xl border-border/60 focus-visible:ring-brand/30"
                />
              </div>

              <Separator className="border-border/40" />

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  New password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                  className="h-11 rounded-xl border-border/60 focus-visible:ring-brand/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm new password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  minLength={8}
                  required
                  className="h-11 rounded-xl border-border/60 focus-visible:ring-brand/30"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={passwordSaving}
                  className={
                    passwordSaved
                      ? "rounded-xl bg-emerald-600 hover:bg-emerald-600 text-white h-10"
                      : "rounded-xl bg-brand text-brand-foreground hover:bg-brand/90 h-10 shadow-sm shadow-brand/20"
                  }
                >
                  {passwordSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : passwordSaved ? (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  ) : null}
                  {passwordSaving ? "Updating…" : passwordSaved ? "Updated!" : "Update password"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
