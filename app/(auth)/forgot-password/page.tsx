"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, CheckCircle2, Terminal, Mail } from "lucide-react";

const BrandPanel = () => (
  <div className="relative hidden lg:flex flex-col h-full bg-[hsl(224,25%,6%)] overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-gradient(to right, hsl(38,92%,50%) 1px, transparent 1px), linear-gradient(to bottom, hsl(38,92%,50%) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/15 blur-[120px] rounded-full pointer-events-none" />

    <div className="relative z-10 p-10">
      <Link href="/" className="flex items-center gap-3 w-fit">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
          <GraduationCap className="h-5 w-5 text-brand-foreground" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">TechOps Academy</span>
      </Link>
    </div>

    <div className="relative z-10 flex flex-1 flex-col justify-center px-10 pb-10">
      <div className="mb-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          <Terminal className="ml-auto h-3.5 w-3.5 text-white/30" />
        </div>
        <div className="px-5 py-4 font-mono text-sm space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-brand">$</span>
            <span className="text-white/80">git push origin main --force-with-lease</span>
          </div>
          <div className="flex items-center gap-2 text-white/50">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Branch protected. Access restored.</span>
          </div>
        </div>
      </div>

      <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-3">
        Happens to everyone.
      </h2>
      <p className="text-base text-white/50 mb-10">
        We&apos;ll get you back into your account in seconds.
      </p>

      <div className="space-y-3">
        {[
          "Reset link sent instantly to your inbox",
          "Link expires after 1 hour for security",
          "No account lockouts — just a fresh start",
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="grid min-h-screen lg:grid-cols-2">
        <BrandPanel />
        <div className="flex flex-col items-center justify-center bg-background px-6 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm text-center"
          >
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20">
              <Mail className="h-7 w-7 text-brand" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Check your inbox</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Didn&apos;t receive it? Check your spam folder.
            </p>
            <Button
              variant="outline"
              className="mt-8 h-11 w-full rounded-xl border-border/60"
              asChild
            >
              <Link href="/login">Back to sign in</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

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

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Forgot password?
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
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

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-brand text-brand-foreground font-bold shadow-md shadow-brand/20 hover:bg-brand/90 transition-colors"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send reset link
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
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
