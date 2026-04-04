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
  BriefcaseBusiness,
  GraduationCap,
  MonitorCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  Star,
  Calendar,
  MessageSquare,
  Users,
  CheckCircle2,
} from "lucide-react";

/* ─── Data ──────────────────────────────────────────────── */

const careerPaths = [
  { title: "Linux System Admin", icon: Terminal, description: "Manage servers, automation, and infrastructure" },
  { title: "Cloud Support Engineer", icon: Cloud, description: "AWS, Azure, and GCP cloud operations" },
  { title: "DevOps Engineer", icon: Server, description: "CI/CD, containers, and deployment pipelines" },
  { title: "Linux Administrator", icon: Database, description: "System configuration, security, and networking" },
  { title: "Software Engineer", icon: Network, description: "Full-stack development and system design" },
];

const testimonials = [
  {
    name: "Marcus T.",
    role: "Now working as a DevOps Engineer",
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
    question: "What payment options are available?",
    answer:
      "We offer flexible payment plans for all bundles. The DevOps Bundle can be paid as a one-time fee of $4,000, in 6 monthly installments of $750, or in 3 installments of $1,500. The Accounting Bundle is $3,000 one-time or 2 installments of $1,750. Accounts Payable is $2,000. Contact us to discuss the best option for you.",
  },
  {
    question: "What is the refund policy?",
    answer:
      "We offer a satisfaction guarantee. If you are not satisfied with the course content within the first 7 days of enrollment, you may request a full refund. After 7 days, refunds are evaluated on a case-by-case basis. Please contact support@techopsacademy.com to initiate a refund request.",
  },
  {
    question: "Do you offer any discount coupons?",
    answer:
      "Yes! We periodically run promotions and offer referral discounts. Follow us on social media and subscribe to our newsletter to stay up to date. You can also ask about group discounts if you're enrolling with a colleague.",
  },
  {
    question: "How do I manage my account?",
    answer:
      "Once enrolled, you can log into your student dashboard to access course materials, track your progress, download resources, and communicate with instructors. Visit the dashboard from the navigation menu after logging in.",
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

/* ─── Sub-components ────────────────────────────────────── */

function TerminalWindow() {
  return (
    <div className="rounded-2xl border border-border/80 bg-[hsl(224,25%,7%)] overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/5">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/50 bg-[hsl(224,25%,9%)]">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-xs text-muted-foreground/60 font-mono">devops@techops:~</span>
      </div>
      {/* Terminal content */}
      <div className="p-6 font-mono text-[13px] space-y-4 leading-relaxed">
        <div>
          <span className="text-brand font-bold">❯</span>
          <span className="text-foreground/80 ml-2">kubectl get nodes</span>
          <div className="mt-2 text-xs space-y-1 pl-4 border-l border-border/40">
            <div className="text-muted-foreground/50 uppercase text-[10px] tracking-wider">NAME · · · · · · STATUS · ROLES · AGE</div>
            <div className="text-green-400">node-prod-01 · · Ready · · master · 47d</div>
            <div className="text-green-400">node-prod-02 · · Ready · · worker · 47d</div>
            <div className="text-green-400">node-prod-03 · · Ready · · worker · 45d</div>
          </div>
        </div>
        <div>
          <span className="text-brand font-bold">❯</span>
          <span className="text-foreground/80 ml-2">docker ps --format table</span>
          <div className="mt-2 text-xs space-y-1 pl-4 border-l border-border/40">
            <div className="text-muted-foreground/50 uppercase text-[10px] tracking-wider">NAMES · · · · · · STATUS</div>
            <div className="text-foreground/70">nginx-proxy · · · Up 2 hours</div>
            <div className="text-foreground/70">app-backend · · · Up 2 hours</div>
            <div className="text-foreground/70">postgres-db · · · Up 47 days</div>
          </div>
        </div>
        <div>
          <span className="text-brand font-bold">❯</span>
          <span className="text-foreground/80 ml-2">git push origin main</span>
          <div className="mt-2 text-xs space-y-1 pl-4 border-l border-border/40">
            <div className="text-muted-foreground/60">Enumerating objects: 18, done.</div>
            <div className="text-green-400">✓ Pipeline triggered: deploy-production</div>
            <div className="text-brand/80">→ https://app.techopsacademy.com</div>
          </div>
        </div>
        <div className="flex items-center gap-1 pt-1">
          <span className="text-brand font-bold">❯</span>
          <span className="ml-2 inline-block w-2 h-4 bg-brand/70 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${open ? "border-brand/40 shadow-md shadow-brand/5" : "border-border/50 hover:border-border"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-muted/20 transition-colors"
      >
        <span className="font-semibold text-[15px] leading-snug">{question}</span>
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${open ? "bg-brand text-brand-foreground rotate-180" : "bg-muted text-muted-foreground"}`}>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </button>
      {open && (
        <div className="px-6 pb-5 pt-4 text-[15px] text-muted-foreground leading-relaxed border-t border-border/40">
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

      {/* Announcement */}
      <div className="relative bg-brand text-brand-foreground py-2.5 px-4 text-center text-sm font-semibold overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,black_8px,black_9px)]" />
        <span className="relative inline-flex items-center gap-2.5 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-foreground/80 animate-pulse" />
            <Calendar className="h-3.5 w-3.5 opacity-80" />
          </span>
          Classes have begun — register now and catch up before <strong>May 31st</strong>.{" "}
          <Link href="/signup" className="underline underline-offset-2 hover:no-underline font-black">
            Enroll today →
          </Link>
        </span>
      </div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.25]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        {/* Brand glow */}
        <div className="absolute top-[-10%] left-[30%] w-[700px] h-[500px] bg-brand/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 xl:gap-20 items-center">

            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-brand/30 bg-brand/8 px-4 py-1.5 mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse shrink-0" />
                <span className="text-[11px] font-bold text-brand uppercase tracking-widest">
                  New cohort — May 31st
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-[clamp(3.5rem,8vw,6rem)] font-extrabold tracking-tighter leading-[0.88] mb-8">
                Launch your<br />
                career in<br />
                <span className="text-brand">tech &</span><br />
                <span className="text-brand">finance.</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-md">
                From Linux fundamentals to production deployments — expert-led programs
                built around one goal: <span className="text-foreground font-medium">getting you hired.</span>
              </p>

              <div className="flex flex-wrap gap-3 mb-14">
                <Button
                  size="lg"
                  asChild
                  className="h-12 px-8 text-base font-bold bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg shadow-brand/25 rounded-xl"
                >
                  <Link href="/courses">
                    Explore programs <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 px-8 text-base border-border/60 hover:bg-muted/40 rounded-xl"
                >
                  <Link href="/#contact">Free consultation</Link>
                </Button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/40">
                {[
                  { value: "3", label: "Career bundles" },
                  { value: "5+", label: "Job titles" },
                  { value: "$0", label: "To get started" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-4xl font-black text-brand tracking-tighter leading-none">{s.value}</p>
                    <p className="text-sm text-muted-foreground mt-1.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: terminal */}
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
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────── */}
      <div className="border-y border-border/40 bg-muted/20 py-5 px-4">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {[
            "No experience required",
            "Self-paced & flexible",
            "Expert instructors",
            "Certificate of completion",
            "Lifetime access",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CAREER PATHS ─────────────────────────────────── */}
      <section className="py-32 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-brand mb-3">Career Outcomes</p>
              <h2 className="text-5xl font-extrabold tracking-tighter leading-tight">Where you&apos;ll go</h2>
            </div>
            <p className="text-muted-foreground max-w-xs text-sm md:text-right leading-relaxed">
              Our graduates land roles at top companies across tech and finance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {careerPaths.map((path, i) => {
              const Icon = path.icon;
              return (
                <motion.div
                  key={path.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.07, duration: 0.45, ease }}
                  className="group relative rounded-xl border border-border/50 bg-card p-5 flex flex-col gap-4 overflow-hidden transition-all duration-300 hover:border-brand/50 hover:shadow-xl hover:shadow-brand/8 hover:-translate-y-1"
                >
                  {/* Big number watermark */}
                  <div className="absolute -top-2 -right-1 text-6xl font-black text-muted-foreground/[0.04] tabular-nums select-none leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  {/* Hover glow top */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/0 to-transparent group-hover:via-brand/60 transition-all duration-300" />

                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-muted border border-border/50 group-hover:bg-brand/15 group-hover:border-brand/30 transition-all duration-300">
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-brand transition-colors duration-300" />
                  </div>
                  <div className="relative">
                    <p className="font-bold text-sm leading-snug group-hover:text-foreground transition-colors">{path.title}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{path.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FREE CONSULTATION ────────────────────────────── */}
      <section className="px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative rounded-2xl overflow-hidden border border-brand/20 bg-gradient-to-br from-brand/10 via-brand/5 to-transparent p-8 md:p-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15]" />
            <div className="absolute top-0 left-0 w-48 h-48 bg-brand/20 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/15 ring-1 ring-brand/30">
                  <MessageSquare className="h-7 w-7 text-brand" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight">Free Consultation</h3>
                  <p className="mt-1 text-muted-foreground text-sm max-w-sm leading-relaxed">
                    Not sure which program is right for you? Book a free 30-minute session with an advisor.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex flex-col items-center px-5 py-3.5 rounded-xl border border-brand/30 bg-brand/10 text-center min-w-[80px]">
                  <span className="text-2xl font-extrabold text-brand">Free</span>
                  <span className="text-xs text-muted-foreground mt-0.5">30 min</span>
                </div>
                <div className="flex flex-col items-center px-5 py-3.5 rounded-xl border border-border/60 bg-card text-center min-w-[80px]">
                  <span className="text-2xl font-extrabold">$100</span>
                  <span className="text-xs text-muted-foreground mt-0.5">1 hour</span>
                </div>
                <Button
                  size="lg"
                  asChild
                  className="h-[54px] px-7 bg-brand text-brand-foreground hover:bg-brand/90 font-bold shadow-lg shadow-brand/20 rounded-xl"
                >
                  <Link href="/#contact">Book now →</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION / BENTO ──────────────────────────────── */}
      <section className="py-32 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* Main card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease }}
              className="lg:col-span-7 relative rounded-2xl border border-border/60 bg-card p-8 lg:p-12 flex flex-col justify-between gap-10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--brand)/0.06),transparent_60%)]" />
              <div className="relative">
                <p className="text-[11px] font-black uppercase tracking-widest text-brand mb-4">Our Mission</p>
                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tighter leading-[1.05] mb-6">
                  Built for people who want to{" "}
                  <span className="text-brand">build things.</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-lg text-[15px]">
                  Computers are essential to modern life. Our training is built around a single, concrete goal: teaching you all the steps necessary to put an application online — from your first script to managing production infrastructure at scale.
                </p>
              </div>
              <div className="relative flex flex-wrap gap-3">
                <Button
                  size="lg"
                  asChild
                  className="bg-brand text-brand-foreground hover:bg-brand/90 font-bold shadow-md shadow-brand/20 rounded-xl"
                >
                  <Link href="/signup">
                    Start learning today <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-xl border-border/60 hover:bg-muted/40">
                  <Link href="/courses">Browse all courses</Link>
                </Button>
              </div>
            </motion.div>

            {/* Stat cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
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
                  transition={{ delay: i * 0.08, duration: 0.4, ease }}
                  className="relative rounded-2xl border border-border/60 bg-card p-5 flex flex-col justify-between gap-3 overflow-hidden group hover:border-brand/40 transition-colors duration-300"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/0 to-transparent group-hover:via-brand/50 transition-all duration-300" />
                  <p className="text-5xl font-black text-brand tracking-tighter leading-none">{stat.value}</p>
                  <div>
                    <p className="font-bold text-sm">{stat.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section id="testimonials" className="py-32 px-4 border-y border-border/40 bg-muted/15">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-brand mb-3">Student Stories</p>
              <h2 className="text-5xl font-extrabold tracking-tighter">What our graduates say</h2>
            </div>
            <p className="text-muted-foreground max-w-xs text-sm md:text-right leading-relaxed">
              Real results from real students who started exactly where you are.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1, duration: 0.45, ease }}
                className="h-full"
              >
                <div className="relative h-full rounded-2xl border border-border/60 bg-card p-7 flex flex-col gap-5 overflow-hidden group hover:border-brand/30 hover:shadow-2xl hover:shadow-brand/5 hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/0 to-transparent group-hover:via-brand/40 transition-all duration-300" />

                  {/* Giant quote */}
                  <div className="absolute -top-4 -left-2 text-[9rem] font-black leading-none text-brand/[0.06] select-none pointer-events-none">&ldquo;</div>

                  {/* Stars */}
                  <div className="flex gap-1 relative z-10">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-brand text-brand" />
                    ))}
                  </div>

                  {/* Quote text */}
                  <p className="text-[15px] leading-relaxed text-foreground/85 flex-1 relative z-10">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border/40 relative z-10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand font-black text-base ring-1 ring-brand/20">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">{t.name}</p>
                      <p className="text-xs text-brand mt-0.5 font-semibold">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ─────────────────────────────────────────── */}
      <section id="faqs" className="py-32 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease }}
            >
              <p className="text-[11px] font-black uppercase tracking-widest text-brand mb-3">FAQs</p>
              <h2 className="text-5xl font-extrabold tracking-tighter leading-tight mb-5">
                Common questions
              </h2>
              <p className="text-muted-foreground leading-relaxed text-[15px]">
                Can&apos;t find what you&apos;re looking for? Reach out to our support team directly.
              </p>
              <div className="mt-6">
                <a
                  href="mailto:support@techopsacademy.com"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline underline-offset-4"
                >
                  support@techopsacademy.com →
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="flex flex-col gap-3"
            >
              {faqs.map((faq) => (
                <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────── */}
      <section id="contact" className="py-32 px-4 border-t border-border/40 bg-muted/15">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <p className="text-[11px] font-black uppercase tracking-widest text-brand mb-3">Get in Touch</p>
            <h2 className="text-5xl font-extrabold tracking-tighter">Contact us</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Contact info */}
            <div className="flex flex-col gap-4">
              {[
                { icon: Phone, label: "Phone", value: "+(1) 770-354-2777", href: "tel:+17703542777" },
                { icon: Mail, label: "Email", value: "support@techopsacademy.com", href: "mailto:support@techopsacademy.com" },
                { icon: MapPin, label: "Location", value: "Midlothian, Texas", href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 rounded-xl border border-border/60 bg-card p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/20">
                    <Icon className="h-4 w-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-medium hover:text-brand transition-colors">{value}</a>
                    ) : (
                      <p className="text-sm font-medium">{value}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Hours */}
              <div className="rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/20">
                    <Clock className="h-4 w-4 text-brand" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Business Hours</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {businessHours.map((bh) => (
                    <div key={bh.days} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{bh.days}</span>
                      <span className="font-semibold">{bh.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA card */}
            <div className="lg:col-span-2 relative rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/10 via-brand/5 to-card overflow-hidden p-8 lg:p-10 flex flex-col gap-6">
              <div className="absolute top-0 left-0 w-56 h-56 bg-brand/15 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 ring-1 ring-brand/30 mb-6">
                  <Users className="h-7 w-7 text-brand" />
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight mb-3">Ready to get started?</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px] max-w-md">
                  Book a free 30-minute consultation to discuss your goals and find the right program. Classes are enrolling now — spots are limited.
                </p>
              </div>
              <div className="relative flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  asChild
                  className="bg-brand text-brand-foreground hover:bg-brand/90 font-bold shadow-lg shadow-brand/20 rounded-xl flex-1 sm:flex-none"
                >
                  <Link href="/signup">
                    Enroll now — it&apos;s free to start <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-xl border-border/60 hover:bg-muted/40">
                  <a href="tel:+17703542777">Call us</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-border/40 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">
                  <GraduationCap className="h-4 w-4 text-brand-foreground" />
                </div>
                <span className="font-extrabold text-lg tracking-tighter">
                  TechOps<span className="text-brand"> Academy</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
                Expert-led DevOps and finance training programs built around one goal — getting you hired.
              </p>
              <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <a href="tel:+17703542777" className="flex items-center gap-2 hover:text-brand transition-colors w-fit">
                  <Phone className="h-3.5 w-3.5 shrink-0" /> +(1) 770-354-2777
                </a>
                <a href="mailto:support@techopsacademy.com" className="flex items-center gap-2 hover:text-brand transition-colors w-fit">
                  <Mail className="h-3.5 w-3.5 shrink-0" /> support@techopsacademy.com
                </a>
                <span className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> Midlothian, Texas
                </span>
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">Quick Links</p>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                {[
                  { label: "Home", href: "/" },
                  { label: "All Courses", href: "/courses" },
                  { label: "Testimonials", href: "/#testimonials" },
                  { label: "FAQs", href: "/#faqs" },
                  { label: "Contact", href: "/#contact" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-brand transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hours */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">Business Hours</p>
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                {businessHours.map((bh) => (
                  <div key={bh.days}>
                    <p className="font-semibold text-foreground text-xs mb-0.5">{bh.days}</p>
                    <p>{bh.hours}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TechOps Academy. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/courses" className="hover:text-foreground transition-colors">Courses</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
              <Link href="/signup" className="hover:text-brand transition-colors font-semibold">Get started →</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
