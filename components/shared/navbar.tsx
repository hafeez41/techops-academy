"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  GraduationCap, LogOut, LayoutDashboard, BookOpen, Shield,
  Settings, Menu, X,
} from "lucide-react";
import type { Profile } from "@/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "All Courses" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#faqs", label: "FAQs" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data ?? null);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) fetchProfile(user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    setMobileOpen(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const closeMobile = () => setMobileOpen(false);

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
      {/* ── Main row ── */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" onClick={closeMobile}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <GraduationCap className="h-4 w-4 text-brand-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">
            TechOps<span className="text-brand"> Academy</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Desktop auth */}
          {!loading && (
            <div className="hidden md:flex items-center gap-2">
              {profile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-full outline-none ring-2 ring-transparent hover:ring-brand/50 transition-all">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={profile.avatar_url ?? ""} />
                      <AvatarFallback className="text-xs bg-brand text-brand-foreground font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium truncate">{profile.full_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    {profile.role === "instructor" && (
                      <DropdownMenuItem onClick={() => router.push("/instructor")}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Instructor Hub
                      </DropdownMenuItem>
                    )}
                    {profile.role === "admin" && (
                      <DropdownMenuItem onClick={() => router.push("/admin")}>
                        <Shield className="mr-2 h-4 w-4 text-red-500" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} variant="destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold">
                    <Link href="/signup">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Mobile: avatar visible when logged in */}
          {!loading && profile && (
            <DropdownMenu>
              <DropdownMenuTrigger className="md:hidden rounded-full outline-none ring-2 ring-transparent hover:ring-brand/50 transition-all">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={profile.avatar_url ?? ""} />
                  <AvatarFallback className="text-xs bg-brand text-brand-foreground font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { router.push("/dashboard"); closeMobile(); }}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                {profile.role === "instructor" && (
                  <DropdownMenuItem onClick={() => { router.push("/instructor"); closeMobile(); }}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Instructor Hub
                  </DropdownMenuItem>
                )}
                {profile.role === "admin" && (
                  <DropdownMenuItem onClick={() => { router.push("/admin"); closeMobile(); }}>
                    <Shield className="mr-2 h-4 w-4 text-red-500" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => { router.push("/settings"); closeMobile(); }}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile slide-down menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-sm">
          <nav className="px-4 pt-2 pb-1 space-y-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMobile}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth buttons for logged-out users */}
          {!loading && !profile && (
            <div className="px-4 py-3 border-t border-border/40 flex flex-col gap-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/login" onClick={closeMobile}>Sign in</Link>
              </Button>
              <Button
                size="sm"
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-semibold"
                asChild
              >
                <Link href="/signup" onClick={closeMobile}>Get started</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
