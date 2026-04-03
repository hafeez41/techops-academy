import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PageTransition } from "@/components/providers/page-transition";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "TechOps Academy",
    template: "%s | TechOps Academy",
  },
  description: "Master DevOps, Cloud, Security, and more with expert-led courses.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NextTopLoader
            color="hsl(38, 78%, 52%)"
            height={2}
            showSpinner={false}
            shadow={false}
          />
          <PageTransition>
            {children}
          </PageTransition>
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{ duration: 3500 }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
