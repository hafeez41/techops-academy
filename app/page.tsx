"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  Server,
  Cloud,
  Shield,
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
} from "lucide-react";

const scrollReveal = {
  initial: { opacity: 1, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const courses = [
  {
    title: "DevOps Bundle",
    price: "$4,000",
    paymentPlans: [
      { label: "One-time", amount: "$4,000" },
      { label: "6 monthly", amount: "6 × $750/mo" },
      { label: "3 installments", amount: "3 × $1,500" },
    ],
    description:
      "Complete DevOps training from Linux fundamentals through CI/CD pipelines, containerization, Kubernetes, and cloud deployment.",
    badge: "Most Popular",
    icon: Server,
    features: [
      "Linux & Bash scripting",
      "Docker & Kubernetes",
      "CI/CD with GitHub Actions",
      "AWS / Azure cloud",
      "Monitoring & observability",
    ],
    href: "/courses",
  },
  {
    title: "Accounting Bundle",
    price: "$3,000",
    paymentPlans: [
      { label: "One-time", amount: "$3,000" },
      { label: "2 installments", amount: "2 × $1,750" },
    ],
    description:
      "Full accounting curriculum covering bookkeeping, financial statements, payroll, tax preparation, and accounting software.",
    badge: null,
    icon: BriefcaseBusiness,
    features: [
      "Bookkeeping fundamentals",
      "Financial statements",
      "Payroll processing",
      "Tax preparation basics",
      "QuickBooks & accounting software",
    ],
    href: "/courses",
  },
  {
    title: "Accounts Payable",
    price: "$2,000",
    paymentPlans: [
      { label: "One-time", amount: "$2,000" },
    ],
    description:
      "Specialized accounts payable training covering invoice processing, vendor management, reconciliation, and compliance.",
    badge: null,
    icon: MonitorCheck,
    features: [
      "Invoice processing workflows",
      "Vendor relationship management",
      "3-way matching process",
      "Month-end reconciliation",
      "Audit & compliance",
    ],
    href: "/courses",
  },
];

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

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-semibold text-sm leading-snug">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Announcement Banner */}
      <div className="bg-brand text-brand-foreground py-3 px-4 text-center text-sm font-medium">
        <span className="inline-flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          Classes have already begun — you can register now and catch up before classes resume on{" "}
          <strong>May 31st</strong>.{" "}
          <Link href="/signup" className="underline underline-offset-2 hover:no-underline font-semibold">
            Enroll today →
          </Link>
        </span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-36">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Badge className="mb-6 bg-brand/10 text-brand border-brand/20 hover:bg-brand/10">
              Welcome to TechOps Academy
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl leading-[1.1]">
              Launch your career in{" "}
              <span className="text-gradient-brand">tech & finance</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Computers have become essential to every industry. Our training program is built
              around one concrete goal — teaching you all the steps necessary to{" "}
              <span className="text-foreground font-medium">put an application online</span>.
              From day one through production deployment.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold h-12 px-7 text-base"
              >
                <Link href="/courses">
                  Explore bundles <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {["No experience required", "Self-paced learning", "Industry-recognized paths"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course Bundles — temporarily hidden, will pull from DB */}
      {/* <section className="py-24 px-4">...</section> */}

      {/* Free Consultation */}
      <section className="py-16 px-4 bg-brand/5 border-y border-brand/10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 shrink-0">
                <MessageSquare className="h-7 w-7 text-brand" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Free Consultation</h3>
                <p className="mt-1 text-muted-foreground">
                  Not sure which program is right for you? Book a free 30-minute session with an advisor.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <div className="flex flex-col items-center px-5 py-3 rounded-xl border border-border/60 bg-background text-center">
                <span className="text-2xl font-bold text-brand">Free</span>
                <span className="text-xs text-muted-foreground mt-0.5">30 minutes</span>
              </div>
              <div className="flex flex-col items-center px-5 py-3 rounded-xl border border-border/60 bg-background text-center">
                <span className="text-2xl font-bold">$100</span>
                <span className="text-xs text-muted-foreground mt-0.5">1 hour</span>
              </div>
              <Button
                size="lg"
                asChild
                className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold h-full px-6"
              >
                <Link href="/#contact">Book now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Career Paths */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <motion.div {...scrollReveal} className="mb-14">
            <Badge variant="outline" className="mb-4 border-brand/30 text-brand">
              Career Outcomes
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight">Where you&apos;ll go</h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Our graduates land roles at top companies across tech and finance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {careerPaths.map((path, i) => {
              const Icon = path.icon;
              return (
                <motion.div
                  key={path.title}
                  initial={{ opacity: 1, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                >
                  <Card className="group border-border/60 hover:border-brand/30 hover:bg-brand/5 transition-all duration-200 cursor-default">
                    <CardContent className="flex flex-col gap-3 p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted group-hover:bg-brand/10 transition-colors">
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-brand transition-colors" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-snug">{path.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {path.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center">
            <motion.div {...scrollReveal}>
              <Badge variant="outline" className="mb-4 border-brand/30 text-brand">
                Our Mission
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight leading-snug">
                Built for people who want to{" "}
                <span className="text-gradient-brand">build things</span>
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Welcome to the Linux and DevOps system administration training program.
                Computers have become essential to modern life. The problem is that most people
                use them but never truly understand them.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We believe everyone deserves the knowledge to build, deploy, and maintain
                technology — not just consume it. Our training is built around a single,
                concrete goal: teaching you all the steps necessary to put an application online.
                From writing your first script to managing production infrastructure at scale.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold"
                >
                  <Link href="/signup">
                    Start learning today <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-border/60">
                  <Link href="/courses">Browse all courses</Link>
                </Button>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "3", label: "Career bundles", sub: "DevOps, Accounting, AP" },
                { value: "5+", label: "Career paths", sub: "Mapped to real job titles" },
                { value: "100%", label: "Online & self-paced", sub: "Learn on your schedule" },
                { value: "$0", label: "Get started free", sub: "Upgrade when ready" },
              ].map((stat) => (
                <Card key={stat.label} className="border-border/60 h-full">
                  <CardContent className="p-5">
                    <p className="text-3xl font-bold text-brand">{stat.value}</p>
                    <p className="mt-1 font-semibold text-sm">{stat.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <motion.div {...scrollReveal} className="mb-14">
            <Badge variant="outline" className="mb-4 border-brand/30 text-brand">
              Student Stories
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight">What our graduates say</h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Real results from real students who started exactly where you are.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 1, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card className="h-full border-border/60 hover:border-brand/30 transition-all duration-200">
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-brand text-brand" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="border-t border-border/40 pt-4">
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-brand mt-0.5">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div {...scrollReveal} className="mb-14">
            <Badge variant="outline" className="mb-4 border-brand/30 text-brand">
              FAQs
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight">Frequently asked questions</h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Can&apos;t find what you&apos;re looking for? Reach out to our support team.
            </p>
          </motion.div>

          <div className="max-w-3xl flex flex-col gap-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <motion.div {...scrollReveal} className="mb-14">
            <Badge variant="outline" className="mb-4 border-brand/30 text-brand">
              Get in Touch
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight">Contact us</h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Have questions about enrollment, programs, or payment plans? We&apos;re here to help.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Contact details */}
            <div className="flex flex-col gap-5">
              <Card className="border-border/60">
                <CardContent className="flex flex-col gap-5 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 shrink-0">
                      <Phone className="h-4 w-4 text-brand" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Phone</p>
                      <a
                        href="tel:+17703542777"
                        className="text-sm text-muted-foreground hover:text-brand transition-colors mt-0.5 block"
                      >
                        +(1) 770-354-2777
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 shrink-0">
                      <Mail className="h-4 w-4 text-brand" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Email</p>
                      <a
                        href="mailto:support@techopsacademy.com"
                        className="text-sm text-muted-foreground hover:text-brand transition-colors mt-0.5 block"
                      >
                        support@techopsacademy.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 shrink-0">
                      <MapPin className="h-4 w-4 text-brand" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Location</p>
                      <p className="text-sm text-muted-foreground mt-0.5">Midlothian, Texas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business hours */}
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                      <Clock className="h-4 w-4 text-brand" />
                    </div>
                    <p className="font-semibold text-sm">Business Hours</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {businessHours.map((bh) => (
                      <div key={bh.days} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{bh.days}</span>
                        <span className="font-medium">{bh.hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-5">
              <Card className="border-border/60 bg-brand/5">
                <CardContent className="flex flex-col gap-5 p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                    <Users className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Ready to get started?</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Book a free 30-minute consultation to discuss your goals and find the right program.
                      Classes are enrolling now — spots are limited.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button
                      size="lg"
                      asChild
                      className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold w-full"
                    >
                      <Link href="/signup">
                        Enroll now — it&apos;s free to start <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="border-border/60 w-full">
                      <a href="tel:+17703542777">Call us: +(1) 770-354-2777</a>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="border-border/60 w-full">
                      <a href="mailto:support@techopsacademy.com">Email support</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
                  <GraduationCap className="h-4 w-4 text-brand-foreground" />
                </div>
                <span className="font-bold text-base tracking-tight">
                  TechOps<span className="text-brand"> Academy</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Welcome to the Linux and DevOps system administration training program.
                We&apos;re dedicated to helping you launch a career in tech and finance.
              </p>
              <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
                <a href="tel:+17703542777" className="flex items-center gap-2 hover:text-brand transition-colors">
                  <Phone className="h-3.5 w-3.5" /> +(1) 770-354-2777
                </a>
                <a href="mailto:support@techopsacademy.com" className="flex items-center gap-2 hover:text-brand transition-colors">
                  <Mail className="h-3.5 w-3.5" /> support@techopsacademy.com
                </a>
                <span className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> Midlothian, Texas
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p className="font-semibold text-sm mb-4">Quick Links</p>
              <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                {[
                  { label: "Home", href: "/" },
                  { label: "All Courses", href: "/courses" },
                  { label: "Testimonials", href: "/#testimonials" },
                  { label: "FAQs", href: "/#faqs" },
                  { label: "Contact", href: "/#contact" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-brand transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hours */}
            <div>
              <p className="font-semibold text-sm mb-4">Business Hours</p>
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                {businessHours.map((bh) => (
                  <div key={bh.days}>
                    <p className="font-medium text-foreground text-xs">{bh.days}</p>
                    <p className="mt-0.5">{bh.hours}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TechOps Academy. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-sm text-muted-foreground">
              <Link href="/courses" className="hover:text-foreground transition-colors">
                Courses
              </Link>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link href="/signup" className="hover:text-foreground transition-colors">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
