"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Loader2, CheckCircle2, Terminal } from "lucide-react";

const BrandPanel = () => (
  <div className="relative hidden lg:flex flex-col h-full bg-[hsl(224,25%,6%)] overflow-hidden">
    {/* Grid pattern overlay */}
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-gradient(to right, hsl(38,92%,50%) 1px, transparent 1px), linear-gradient(to bottom, hsl(38,92%,50%) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />

    {/* Brand glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/15 blur-[120px] rounded-full pointer-events-none" />

    {/* Logo */}
    <div className="relative z-10 p-10">
      <Link href="/" className="flex items-center gap-3 w-fit">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
          <GraduationCap className="h-5 w-5 text-brand-foreground" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">TechOps Academy</span>
      </Link>
    </div>

    {/* Center content */}
    <div className="relative z-10 flex flex-1 flex-col justify-center px-10 pb-10">
      {/* Terminal window */}
      <div className="mb-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        {/* Terminal title bar */}
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          <Terminal className="ml-auto h-3.5 w-3.5 text-white/30" />
        </div>
        {/* Terminal body */}
        <div className="px-5 py-4 font-mono text-sm space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-brand">$</span>
            <span className="text-white/80">kubectl apply -f deployment.yaml</span>
          </div>
          <div className="flex items-center gap-2 text-white/50">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>deployment.apps/app configured</span>
          </div>
          <div className="flex items-center gap-2 text-white/50">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>service/app-lb created</span>
          </div>
        </div>
      </div>

      {/* Headline */}
      <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-3">
        Learn. Build. Deploy.
      </h2>
      <p className="text-base text-white/50 mb-10">
        Join thousands of engineers launching their careers.
      </p>

      {/* Trust items */}
      <div className="space-y-3">
        {[
          "Hands-on labs in real cloud environments",
          "Career-ready DevOps & platform engineering tracks",
          "Mentors who ship production systems daily",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
            <span className="text-sm text-white/60">{item}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/15 ring-1 ring-brand/30">
            <GraduationCap className="h-10 w-10 text-brand" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Check your email
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-brand">{email}</span>
          </p>
          <Button
            variant="outline"
            className="mt-8 rounded-xl border-border/60 h-11 px-6 font-medium"
            asChild
          >
            <Link href="/login">Back to sign in</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

      {/* Right panel */}
      <div className="flex flex-col items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile-only logo */}
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
                <GraduationCap className="h-5 w-5 text-brand-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">TechOps Academy</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Start learning for free — no credit card required
            </p>
          </div>

          {/* Google button */}
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl border-border/60 font-medium"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                Full name
              </Label>
              <Input
                id="name"
                placeholder="Alex Johnson"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11 rounded-xl border-border/60 focus-visible:ring-brand/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-border/60 focus-visible:ring-brand/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                className="h-11 rounded-xl border-border/60 focus-visible:ring-brand/30"
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-brand text-brand-foreground font-bold shadow-md shadow-brand/20 hover:bg-brand/90 transition-colors"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create account
            </Button>
          </form>

          {/* Sign in link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4 hover:text-brand transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
