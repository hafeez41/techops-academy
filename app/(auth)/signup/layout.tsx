import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | TechOps Academy",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
