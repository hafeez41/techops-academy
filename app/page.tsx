"use client";

import Link from "next/link";
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
} from "lucide-react";

// All whileInView elements start visible (opacity: 1) so content never hides
// if framer-motion has SSR hydration timing issues
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

const techCategories = [
  { label: "DevOps", icon: Server },
  { label: "Cloud", icon: Cloud },
  { label: "Security", icon: Shield },
  { label: "Networking", icon: Network },
  { label: "Programming", icon: Terminal },
  { label: "Databases", icon: Database },
  { label: "AI/ML", icon: GraduationCap },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero — CSS animations, no framer-motion opacity:0 initial state */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-36">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Badge className="mb-6 bg-brand/10 text-brand border-brand/20 hover:bg-brand/10">
              Practical. Career-ready. Results.
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl leading-[1.1]">
              Launch your career in{" "}
              <span className="text-gradient-brand">tech & finance</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Computers have become essential to every industry. Our training is built
              around one goal — teaching you all the steps necessary to{" "}
              <span className="text-foreground font-medium">put an application online</span>.
              From day one to deployment.
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
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-7 text-base border-border/60"
              >
                <Link href="/signup">Start for free</Link>
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

      {/* Course Bundles */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div {...scrollReveal} className="mb-14">
            <Badge variant="outline" className="mb-4 border-brand/30 text-brand">
              Our Programs
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight">Training bundles</h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Structured curriculum packages designed to take you from beginner to job-ready.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {courses.map((course, i) => {
              const Icon = course.icon;
              return (
                <motion.div
                  key={course.title}
                  initial={{ opacity: 1, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Card className="group h-full flex flex-col border-border/60 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5 transition-all duration-300">
                    <CardContent className="flex flex-col gap-5 p-6 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 group-hover:bg-brand/20 transition-colors">
                          <Icon className="h-5 w-5 text-brand" />
                        </div>
                        {course.badge && (
                          <Badge className="bg-brand/10 text-brand border-brand/20 text-xs">
                            {course.badge}
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold">{course.title}</h3>
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      <ul className="flex flex-col gap-2 flex-1">
                        {course.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-brand shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <div className="border-t border-border/50 pt-5 flex items-center justify-between mt-auto">
                        <span className="text-2xl font-bold">{course.price}</span>
                        <Button
                          asChild
                          size="sm"
                          className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold"
                        >
                          <Link href={course.href}>
                            Learn more <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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

      {/* Tech Categories */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div {...scrollReveal} className="mb-14">
            <Badge variant="outline" className="mb-4 border-brand/30 text-brand">
              All Subjects
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight">Browse by topic</h2>
            <p className="mt-3 text-muted-foreground">
              From fundamentals to advanced specializations.
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-3">
            {techCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  href={`/courses?category=${encodeURIComponent(cat.label)}`}
                >
                  <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:border-brand/40 hover:text-foreground hover:bg-brand/5 transition-all duration-200">
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission / CTA */}
      <section className="py-24 px-4 bg-muted/30">
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
                Computers have become essential to modern life. The problem is that most people
                use them but never truly understand them. We believe everyone deserves the
                knowledge to build, deploy, and maintain technology — not just consume it.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Our training programs are built around a single, concrete goal: teaching you all
                the steps necessary to put an application online. From writing your first script
                to managing production infrastructure at scale.
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

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand">
                <GraduationCap className="h-4 w-4 text-brand-foreground" />
              </div>
              <span className="font-bold text-sm">
                TechOps<span className="text-brand"> Academy</span>
              </span>
            </div>
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
