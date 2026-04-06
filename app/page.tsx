"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Server,
  Cloud,
  Network,
  Terminal,
  Database,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  Star,
  Calendar,
  Users,
  CheckCircle2,
} from "lucide-react";

/* ─── Data ──────────────────────────────────────────────── */

const careerPaths = [
  { title: "Linux System Admin", icon: Terminal, description: "Manage servers, automation, and infrastructure at scale." },
  { title: "Cloud Support Engineer", icon: Cloud, description: "AWS, Azure, and GCP cloud operations and support." },
  { title: "DevOps Engineer", icon: Server, description: "CI/CD pipelines, containers, and deployment automation." },
  { title: "Linux Administrator", icon: Database, description: "System configuration, security hardening, and networking." },
  { title: "Software Engineer", icon: Network, description: "Full-stack development and distributed systems design." },
];

const testimonials = [
  {
    name: "Marcus T.",
    role: "DevOps Engineer",
    text: "TechOps Academy gave me everything I needed to land my first DevOps role. The hands-on labs and real-world projects made a huge difference.",
    rating: 5,
  },
  {
    name: "Priya S.",
    role: "Cloud Support Engineer",
    text: "I came in with zero Linux experience. Six months later I had a job offer. The instructors are incredibly patient and knowledgeable.",
    rating: 5,
  },
  {
    name: "James L.",
    role: "Junior Linux Admin",
    text: "The self-paced format worked perfectly for my schedule. I studied nights and weekends and completed the DevOps bundle in four months.",
    rating: 5,
  },
];

const faqs = [
  {
    question: "How does access work?",
    answer:
      "TechOps Academy operates on an invite-only model. Once you've been accepted onto a programme, your payment is arranged directly with us — not through the platform. After that, your account is created and you're given immediate access to all your enrolled courses.",
  },
  {
    question: "How do I get started?",
    answer:
      "Reach out to us through the contact form or book a free consultation. We'll discuss your goals, confirm your place on the right programme, and handle everything from there. You'll receive your login credentials once your enrolment is confirmed.",
  },
  {
    question: "What is the refund policy?",
    answer:
      "We offer a satisfaction guarantee. If you are not satisfied with the course content within the first 7 days of access, you may request a full refund. After 7 days, refunds are evaluated on a case-by-case basis. Please contact support@techopsacademy.com to initiate a refund request.",
  },
  {
    question: "Can I access the courses at my own pace?",
    answer:
      "Yes. Once you have access, courses are available on-demand and you can progress at your own pace. Some programmes use instructor-gated progression, where your instructor unlocks lessons as you advance — this depends on the programme you're enrolled in.",
  },
  {
    question: "How do I manage my account?",
    answer:
      "After logging in, your student dashboard gives you access to all your courses, progress tracking, notes, certificates, and more. Use the navigation menu at the top to get there.",
  },
  {
    question: "I forgot my password. How do I reset it?",
    answer:
      "On the login page, click 'Forgot password?' and enter your registered email address. You'll receive a password reset link within a few minutes. If you don't see it, check your spam folder or contact support@techopsacademy.com for assistance.",
  },
];

const businessHours = [
  { days: "Monday – Friday", hours: "09:00 AM – 8:00 PM" },
  { days: "Saturday – Sunday", hours: "10:30 AM – 10:00 PM" },
];

const ease = [0.22, 1, 0.36, 1] as const;

/* ─── Terminal ───────────────────────────────────────────── */

function TerminalWindow() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#0d1117",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 80px rgba(0,0,0,0.6), 0 0 80px rgba(217,119,6,0.08)",
      }}
    >
      {/* Title bar */}
      <div style={{ background: "#161b22", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        className="flex items-center gap-2 px-5 py-3.5">
        <div className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
        <div className="h-3 w-3 rounded-full" style={{ background: "#ffbd2e" }} />
        <div className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
        <span className="ml-3 text-xs font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
          devops@techops:~
        </span>
      </div>

      {/* Content */}
      <div className="p-6 font-mono text-[13px] space-y-5 leading-relaxed">
        {/* Command 1 */}
        <div>
          <div className="flex items-center gap-2">
            <span style={{ color: "#f59e0b" }} className="font-bold">❯</span>
            <span style={{ color: "#e2e8f0" }}>kubectl get nodes</span>
          </div>
          <div className="mt-2.5 space-y-1 pl-5" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>
              NAME&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;STATUS&nbsp;&nbsp;ROLES&nbsp;&nbsp;&nbsp;AGE
            </div>
            <div style={{ color: "#4ade80" }}>node-prod-01&nbsp;&nbsp;&nbsp;Ready&nbsp;&nbsp;&nbsp;master&nbsp;&nbsp;47d</div>
            <div style={{ color: "#4ade80" }}>node-prod-02&nbsp;&nbsp;&nbsp;Ready&nbsp;&nbsp;&nbsp;worker&nbsp;&nbsp;47d</div>
            <div style={{ color: "#4ade80" }}>node-prod-03&nbsp;&nbsp;&nbsp;Ready&nbsp;&nbsp;&nbsp;worker&nbsp;&nbsp;45d</div>
          </div>
        </div>

        {/* Command 2 */}
        <div>
          <div className="flex items-center gap-2">
            <span style={{ color: "#f59e0b" }} className="font-bold">❯</span>
            <span style={{ color: "#e2e8f0" }}>docker ps --format table</span>
          </div>
          <div className="mt-2.5 space-y-1 pl-5" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>
              NAMES&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;STATUS
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)" }}>nginx-proxy&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Up 2 hours</div>
            <div style={{ color: "rgba(255,255,255,0.55)" }}>app-backend&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Up 2 hours</div>
            <div style={{ color: "rgba(255,255,255,0.55)" }}>postgres-db&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Up 47 days</div>
          </div>
        </div>

        {/* Command 3 */}
        <div>
          <div className="flex items-center gap-2">
            <span style={{ color: "#f59e0b" }} className="font-bold">❯</span>
            <span style={{ color: "#e2e8f0" }}>git push origin main</span>
          </div>
          <div className="mt-2.5 space-y-1 pl-5" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ color: "rgba(255,255,255,0.3)" }}>Enumerating objects: 18, done.</div>
            <div style={{ color: "#4ade80" }}>✓ Pipeline triggered: deploy-production</div>
            <div style={{ color: "#f59e0b", opacity: 0.7 }}>→ https://app.techopsacademy.com</div>
          </div>
        </div>

        {/* Cursor */}
        <div className="flex items-center gap-2 pt-1">
          <span style={{ color: "#f59e0b" }} className="font-bold">❯</span>
          <span className="inline-block w-2 h-[14px] animate-pulse" style={{ background: "#f59e0b", opacity: 0.7 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ Item ───────────────────────────────────────────── */

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b transition-all duration-200 ${open ? "border-brand/30" : "border-border/40"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-6 text-left group"
      >
        <span className={`font-semibold text-[15px] leading-snug transition-colors ${open ? "text-brand" : "text-foreground group-hover:text-brand"}`}>
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-all duration-300 ${open ? "rotate-180 text-brand" : "text-muted-foreground"}`}
        />
      </button>
      {open && (
        <div className="pb-6 text-[15px] text-muted-foreground leading-relaxed -mt-2">
          {answer}
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* ── ANNOUNCEMENT BAND ────────────────────────────── */}
      <div
        className="relative py-2.5 px-4 text-center text-sm font-semibold overflow-hidden"
        style={{ background: "#f59e0b", color: "#1a0f00" }}
      >
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 8px,#000 8px,#000 9px)" }} />
        <span className="relative inline-flex items-center gap-2.5 flex-wrap justify-center">
          <Calendar className="h-3.5 w-3.5 opacity-70" />
          Classes have begun — register now and catch up before{" "}
          <strong>May 31st</strong>.{" "}
          <Link href="/signup" className="underline underline-offset-2 hover:no-underline font-black">
            Enroll today →
          </Link>
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════
          HERO — always dark, no CSS variables
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden min-h-[94vh] flex items-center"
        style={{ background: "#060609" }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Radial fade over dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, #060609 100%)",
          }}
        />
        {/* Amber glow — top center */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-5%", left: "25%", width: "50%", height: "60%",
            background: "radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* Right edge glow */}
        <div
          className="absolute pointer-events-none hidden lg:block"
          style={{
            top: "15%", right: "-8%", width: "500px", height: "500px",
            background: "radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28 w-full">
          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-14 xl:gap-24 items-center">

            {/* ── Left: text ── */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-8"
                style={{
                  border: "1px solid rgba(245,158,11,0.25)",
                  background: "rgba(245,158,11,0.08)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0"
                  style={{ background: "#f59e0b" }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "#f59e0b" }}
                >
                  New cohort — May 31st
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-black tracking-tighter leading-[0.85] mb-8"
                style={{
                  fontSize: "clamp(3.6rem, 8.5vw, 6.5rem)",
                  color: "#ffffff",
                  letterSpacing: "-0.04em",
                }}
              >
                Build it.<br />
                Deploy it.<br />
                <span style={{ color: "#f59e0b" }}>Get hired.</span>
              </h1>

              <p
                className="text-lg leading-relaxed mb-10 max-w-md"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                From Linux fundamentals to production deployments — expert-led programs
                built around one goal:{" "}
                <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                  getting you hired.
                </span>
              </p>

              <div className="flex flex-wrap gap-3 mb-16">
                <Button
                  size="lg"
                  asChild
                  className="h-12 px-8 text-base font-bold rounded-xl"
                  style={{
                    background: "#f59e0b",
                    color: "#1a0f00",
                    boxShadow: "0 0 0 1px rgba(245,158,11,0.3), 0 8px 32px rgba(245,158,11,0.25)",
                  }}
                >
                  <Link href="/courses">
                    Explore programs <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 px-8 text-base rounded-xl"
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <Link href="/#contact">Free consultation</Link>
                </Button>
              </div>

              {/* Stats row */}
              <div
                className="grid grid-cols-3 gap-6 pt-8"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                {[
                  { value: "3", label: "Career bundles" },
                  { value: "5+", label: "Job titles" },
                  { value: "$0", label: "To start" },
                ].map((s) => (
                  <div key={s.label}>
                    <p
                      className="text-4xl font-black tracking-tighter leading-none"
                      style={{ color: "#f59e0b" }}
                    >
                      {s.value}
                    </p>
                    <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Right: terminal ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="hidden lg:block"
            >
              <TerminalWindow />
            </motion.div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div
          className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #060609)" }}
        />
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────── */}
      <div style={{ background: "#060609", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        className="py-6 px-4">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {[
            "No experience required",
            "Self-paced & flexible",
            "Expert instructors",
            "Certificate of completion",
            "Lifetime access",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "#f59e0b" }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          CAREER PATHS — light section, editorial numbered list
      ══════════════════════════════════════════════════════ */}
      <section className="py-32 px-4 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-brand mb-3">
                Career Outcomes
              </p>
              <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tighter leading-tight">
                Where you&apos;ll go
              </h2>
            </div>
            <p className="text-muted-foreground max-w-xs text-sm md:text-right leading-relaxed">
              Our graduates land roles at top companies across tech and finance.
            </p>
          </div>

          <div className="mt-8">
            {careerPaths.map((path, i) => (
              <motion.div
                key={path.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06, duration: 0.45, ease }}
                className={`group relative flex items-center gap-6 py-7 transition-colors duration-200 hover:bg-brand/[0.03] -mx-4 px-4 rounded-xl ${
                  i < careerPaths.length - 1 ? "border-b border-border/40" : ""
                }`}
              >
                {/* Big number */}
                <span
                  className="font-black tabular-nums leading-none select-none shrink-0 w-16 text-right"
                  style={{
                    fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                    color: "hsl(var(--brand) / 0.12)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Thin vertical divider */}
                <div className="w-px self-stretch bg-border/40 shrink-0" />

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-black tracking-tight leading-tight group-hover:text-brand transition-colors duration-200">
                    {path.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {path.description}
                  </p>
                </div>

                <ArrowRight className="h-5 w-5 text-muted-foreground/20 group-hover:text-brand/50 group-hover:translate-x-1 transition-all duration-200 shrink-0 hidden sm:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FREE CONSULTATION — full-bleed amber band
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: "#f59e0b" }} className="py-16 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p
              className="text-[11px] font-black uppercase tracking-widest mb-2 opacity-60"
              style={{ color: "#1a0f00" }}
            >
              Free for everyone
            </p>
            <h3
              className="text-3xl font-black tracking-tighter leading-tight"
              style={{ color: "#1a0f00" }}
            >
              Not sure where to start?
            </h3>
            <p
              className="mt-2 text-[15px] max-w-sm leading-relaxed"
              style={{ color: "rgba(26,15,0,0.65)" }}
            >
              Book a free 30-minute session with an advisor. No pressure, just clarity.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div
              className="flex flex-col items-center px-6 py-4 rounded-xl text-center"
              style={{ background: "rgba(0,0,0,0.1)", color: "#1a0f00" }}
            >
              <span className="text-2xl font-black">Free</span>
              <span className="text-xs opacity-60 mt-0.5">30 min</span>
            </div>
            <div
              className="flex flex-col items-center px-6 py-4 rounded-xl text-center"
              style={{ background: "rgba(0,0,0,0.1)", color: "#1a0f00" }}
            >
              <span className="text-2xl font-black">$100</span>
              <span className="text-xs opacity-60 mt-0.5">1 hour</span>
            </div>
            <Link
              href="/#contact"
              className="flex items-center gap-2 h-12 px-7 rounded-xl text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "#1a0f00",
                color: "#f59e0b",
              }}
            >
              Book now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MISSION — dark section, bold copy
      ══════════════════════════════════════════════════════ */}
      <section
        className="py-32 px-4 relative overflow-hidden"
        style={{ background: "#0a0c10" }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: "0", left: "0", right: "0",
            height: "1px",
            background: "linear-gradient(to right, transparent, rgba(245,158,11,0.3), transparent)",
          }}
        />
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-6 items-start">

            {/* Main statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease }}
              className="lg:col-span-8"
            >
              <p
                className="text-[11px] font-black uppercase tracking-widest mb-4"
                style={{ color: "#f59e0b" }}
              >
                Our Mission
              </p>
              <h2
                className="font-black tracking-tighter leading-[0.9] mb-8"
                style={{
                  fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
                  color: "#ffffff",
                  letterSpacing: "-0.04em",
                }}
              >
                Built for people<br />
                who want to{" "}
                <span style={{ color: "#f59e0b" }}>build things.</span>
              </h2>
              <p
                className="text-lg leading-relaxed max-w-2xl"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Computers are essential to modern life. Our training is built around a single,
                concrete goal: teaching you all the steps necessary to put an application online —
                from your first script to managing production infrastructure at scale.
              </p>
              <div className="flex flex-wrap gap-3 mt-10">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 h-12 px-8 rounded-xl text-base font-bold transition-all hover:scale-[1.02]"
                  style={{
                    background: "#f59e0b",
                    color: "#1a0f00",
                    boxShadow: "0 8px 32px rgba(245,158,11,0.2)",
                  }}
                >
                  Start learning today <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center h-12 px-8 rounded-xl text-base font-semibold transition-colors"
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Browse all courses
                </Link>
              </div>
            </motion.div>

            {/* Stat cluster */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 lg:mt-2">
              {[
                { value: "3", label: "Career bundles", sub: "DevOps · Accounting · AP" },
                { value: "5+", label: "Career paths", sub: "Real job titles" },
                { value: "100%", label: "Online", sub: "Self-paced learning" },
                { value: "$0", label: "Free to start", sub: "Upgrade when ready" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease }}
                  className="rounded-2xl p-5 flex flex-col justify-between gap-3"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p
                    className="text-4xl font-black tracking-tighter leading-none"
                    style={{ color: "#f59e0b" }}
                  >
                    {stat.value}
                  </p>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                      {stat.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {stat.sub}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS — white section, large editorial quotes
      ══════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-32 px-4 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-20">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-brand mb-3">
                Student Stories
              </p>
              <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tighter leading-tight">
                What our graduates say
              </h2>
            </div>
            <p className="text-muted-foreground max-w-xs text-sm md:text-right leading-relaxed">
              Real results from real students who started exactly where you are.
            </p>
          </div>

          {/* Testimonials — large quote layout */}
          <div className="space-y-0 divide-y divide-border/40">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.5, ease }}
                className="group py-12 grid md:grid-cols-[200px_1fr] gap-8 items-start"
              >
                {/* Author */}
                <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand font-black text-base ring-1 ring-brand/20">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-brand font-semibold mt-0.5">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5 md:mt-2">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-brand text-brand" />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <p
                  className="text-[1.35rem] leading-snug font-medium tracking-tight text-foreground/80 group-hover:text-foreground transition-colors duration-300"
                  style={{ lineHeight: 1.45 }}
                >
                  &ldquo;{t.text}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FAQs — clean, no card borders
      ══════════════════════════════════════════════════════ */}
      <section id="faqs" className="py-32 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-[360px_1fr] gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease }}
              className="lg:sticky lg:top-24"
            >
              <p className="text-[11px] font-black uppercase tracking-widest text-brand mb-3">FAQs</p>
              <h2 className="text-[clamp(2.2rem,4vw,3.5rem)] font-black tracking-tighter leading-tight mb-5">
                Common<br />questions
              </h2>
              <p className="text-muted-foreground leading-relaxed text-[15px] mb-6">
                Can&apos;t find what you&apos;re looking for? Reach out directly.
              </p>
              <a
                href="mailto:support@techopsacademy.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline underline-offset-4"
              >
                support@techopsacademy.com →
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="border-t border-border/40"
            >
              {faqs.map((faq) => (
                <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CONTACT — dark section
      ══════════════════════════════════════════════════════ */}
      <section id="contact" className="py-32 px-4 relative overflow-hidden" style={{ background: "#060609" }}>
        <div
          className="absolute pointer-events-none"
          style={{
            top: "0", left: "0", right: "0", height: "1px",
            background: "linear-gradient(to right, transparent, rgba(245,158,11,0.2), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-16">
            <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: "#f59e0b" }}>
              Get in Touch
            </p>
            <h2
              className="font-black tracking-tighter leading-tight"
              style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)", color: "#ffffff" }}
            >
              Let&apos;s talk.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Contact info column */}
            <div className="flex flex-col gap-3">
              {[
                { icon: Phone, label: "Phone", value: "+(1) 770-354-2777", href: "tel:+17703542777" },
                { icon: Mail, label: "Email", value: "support@techopsacademy.com", href: "mailto:support@techopsacademy.com" },
                { icon: MapPin, label: "Location", value: "Midlothian, Texas", href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 rounded-xl p-5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "rgba(245,158,11,0.12)" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: "#f59e0b" }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm font-medium transition-colors hover:text-[#f59e0b]"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Hours card */}
              <div
                className="rounded-xl p-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "rgba(245,158,11,0.12)" }}
                  >
                    <Clock className="h-4 w-4" style={{ color: "#f59e0b" }} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Business Hours
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {businessHours.map((bh) => (
                    <div key={bh.days} className="flex items-center justify-between text-sm">
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>{bh.days}</span>
                      <span className="font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>{bh.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA card */}
            <div
              className="lg:col-span-2 relative rounded-2xl p-8 lg:p-12 flex flex-col gap-6 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.02) 100%)",
                border: "1px solid rgba(245,158,11,0.15)",
              }}
            >
              <div
                className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse, rgba(245,158,11,0.1) 0%, transparent 70%)",
                  filter: "blur(40px)",
                }}
              />
              <div className="relative">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl mb-6"
                  style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}
                >
                  <Users className="h-7 w-7" style={{ color: "#f59e0b" }} />
                </div>
                <h3
                  className="text-3xl font-black tracking-tighter mb-3"
                  style={{ color: "#ffffff" }}
                >
                  Ready to get started?
                </h3>
                <p className="leading-relaxed text-[15px] max-w-md" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Book a free 30-minute consultation to discuss your goals and find the right program.
                  Classes are enrolling now — spots are limited.
                </p>
              </div>
              <div className="relative flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-base font-bold transition-all hover:scale-[1.02]"
                  style={{
                    background: "#f59e0b",
                    color: "#1a0f00",
                    boxShadow: "0 8px 32px rgba(245,158,11,0.2)",
                  }}
                >
                  Enroll now — it&apos;s free to start
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="tel:+17703542777"
                  className="inline-flex items-center justify-center h-12 px-7 rounded-xl text-base font-semibold transition-colors"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Call us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ background: "#030305", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "#f59e0b" }}
                >
                  <GraduationCap className="h-4 w-4" style={{ color: "#1a0f00" }} />
                </div>
                <span className="font-black text-lg tracking-tighter" style={{ color: "#ffffff" }}>
                  TechOps<span style={{ color: "#f59e0b" }}> Academy</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>
                Expert-led DevOps and finance training programs built around one goal — getting you hired.
              </p>
              <div className="flex flex-col gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                <a href="tel:+17703542777" className="flex items-center gap-2 hover:text-[#f59e0b] transition-colors w-fit">
                  <Phone className="h-3.5 w-3.5 shrink-0" /> +(1) 770-354-2777
                </a>
                <a href="mailto:support@techopsacademy.com" className="flex items-center gap-2 hover:text-[#f59e0b] transition-colors w-fit">
                  <Mail className="h-3.5 w-3.5 shrink-0" /> support@techopsacademy.com
                </a>
                <span className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> Midlothian, Texas
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.2)" }}>
                Quick Links
              </p>
              <ul className="flex flex-col gap-3 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                {[
                  { label: "Home", href: "/" },
                  { label: "All Courses", href: "/courses" },
                  { label: "Testimonials", href: "/#testimonials" },
                  { label: "FAQs", href: "/#faqs" },
                  { label: "Contact", href: "/#contact" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-[#f59e0b] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hours */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.2)" }}>
                Business Hours
              </p>
              <div className="flex flex-col gap-3 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                {businessHours.map((bh) => (
                  <div key={bh.days}>
                    <p className="font-semibold text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {bh.days}
                    </p>
                    <p>{bh.hours}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
              © {new Date().getFullYear()} TechOps Academy. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
              <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/signup" className="font-semibold hover:text-[#f59e0b] transition-colors" style={{ color: "#f59e0b" }}>
                Get started →
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
