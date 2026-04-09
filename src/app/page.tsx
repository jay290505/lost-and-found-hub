"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { AnimatedText } from "@/components/animated-text";
import { ThemeToggle } from "@/components/theme-toggle";
import { SplashScreen } from "@/components/splash-screen";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show splash screen for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <AnimatePresence>
        {isLoading && <SplashScreen />}
      </AnimatePresence>

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute bottom-0 left-0 h-1/3 w-1/3 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-1/2 w-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.5 }}
        className="relative z-10 flex flex-col items-center justify-center space-y-8 px-4 text-center"
      >
        <Logo />
        <div className="max-w-3xl">
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            <AnimatedText text="Reconnect What's Lost." />
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            The smart, simple, and secure way to manage lost and found items on campus.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button asChild size="lg" className="group">
            <Link href="/login">
              Login with College ID
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </motion.main>
    </div>
  );
}
