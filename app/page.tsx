"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, Users, Award, Zap } from "lucide-react";
import { CATEGORIES } from "@/types";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const stats = [
  { label: "Courses", value: "50+", icon: BookOpen },
  { label: "Students", value: "10K+", icon: Users },
  { label: "Instructors", value: "30+", icon: Award },
  { label: "Hours of content", value: "500+", icon: Zap },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-28 text-center sm:py-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <Badge variant="secondary" className="mb-6 text-xs tracking-wide">
            New courses added weekly
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Level up your{" "}
            <span className="underline decoration-dotted underline-offset-4">
              tech career
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Expert-led courses in DevOps, Cloud, Security, and Networking.
            Learn at your own pace and build skills that matter.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/courses">
                Browse courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup">Start for free</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2 text-center"
              >
                <Icon className="h-6 w-6 text-muted-foreground" />
                <span className="text-3xl font-bold">{value}</span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight">Browse by category</h2>
            <p className="mt-3 text-muted-foreground">
              From fundamentals to advanced topics
            </p>
          </motion.div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/courses?category=${encodeURIComponent(cat)}`}>
                  <Card className="group cursor-pointer transition-all hover:border-foreground/20 hover:shadow-sm">
                    <CardContent className="flex items-center justify-center p-6 text-center">
                      <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                        {cat}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to start learning?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of professionals advancing their careers.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">Create free account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">Explore courses</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="mt-auto border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} TechOps Academy. All rights reserved.
      </footer>
    </div>
  );
}
