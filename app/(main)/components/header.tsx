"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, LogOut, LogIn } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSession, signOut, signIn } from "next-auth/react";

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Scroll animation setup
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);
  const translateY = useTransform(scrollY, [0, 100], [0, -100]);

  const navigationItems = [
    { name: "Home", href: "/dashboard" },
    { name: "Career Assessment", href: "/assessment" },
    { name: "Career Exploration", href: "/exploration" },
    { name: "Skill Roadmap", href: "/roadmapBySearch" },
    { name: "Saved Items", href: "/saved", icon: <Bookmark className="w-4 h-4 ml-1 mt-0.75" /> }
  ];

  const handleAuthAction = async () => {
    if (session) {
      await signOut({ redirect: false });
      router.push("/login");
    } else {
      router.push("/login");
    }
  };

  return (
    <motion.header
      className="w-full border-b bg-background/95 backdrop-blur px-54"
      style={{ opacity, y: translateY }}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">CareerQuest</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
                {item.icon}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAuthAction}
            className="hidden md:flex items-center justify-center gap-2"
          >
            {session ? (
              <>
                <span>Logout</span>
                <LogOut size={16} />
              </>
            ) : (
              <>
                <span>Login</span>
                <LogIn size={16} />
              </>
            )}
          </Button>

          {/* <Button
            variant="default"
            size="sm"
            className="hidden md:flex items-center justify-center gap-2"
          >
            <span className="inline-flex items-center pb-0.5">GET STARTED</span>
            <ArrowRight size={16} />
          </Button> */}

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t py-4">
          <div className="container flex flex-col gap-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
                {item.icon}
              </Link>
            ))}
            <Button variant="default" size="sm" className="w-full">
              GET STARTED
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAuthAction}
              className="w-full flex items-center justify-center gap-2"
            >
              {session ? (
                <>
                  <span>Logout</span>
                  <LogOut size={16} />
                </>
              ) : (
                <>
                  <span>Login</span>
                  <LogIn size={16} />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </motion.header>
  );
}
