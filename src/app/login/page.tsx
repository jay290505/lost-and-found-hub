"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, LogIn } from "lucide-react";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // POST to backend login endpoint (dev)
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get('college-id') as string;
    const password = formData.get('password') as string;
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '') + '/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    }).then(async (res) => {
      const data = await res.json();
      if (res.ok) {
        try { localStorage.setItem('user_name', data.name || username); localStorage.setItem('user_collegeId', data.collegeId || username); } catch (e) {}
        router.push('/dashboard');
      } else {
        alert('Login failed: ' + (data.detail || res.statusText));
      }
    }).catch((err) => {
      console.error(err);
      alert('Login request failed');
    });
  };

  

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
       <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute bottom-0 left-1/4 h-1/3 w-1/3 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute right-1/4 top-0 h-1/2 w-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        className="z-10 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
            <Link href="/" className="flex justify-center">
              <Logo />
            </Link>
        </motion.div>
        <Card className="shadow-2xl shadow-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Student Login</CardTitle>
              <CardDescription>Sign in to access the portal.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e)=>{ e.preventDefault(); handleLogin(e); }} className="grid gap-4">
                <Input name="college-id" placeholder="Student ID or email" />
                <Input name="password" placeholder="Password" type="password" />
                <Button type="submit">Sign in</Button>
                
              </form>
            </CardContent>
        </Card>
        <motion.p variants={itemVariants} className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline underline-offset-4 hover:text-primary">
            Register
          </Link>
        </motion.p>
        <motion.p variants={itemVariants} className="mt-4 text-center text-sm text-muted-foreground">
          Dev credentials: <strong>A-12345</strong> / <strong>password123</strong>
        </motion.p>
      </motion.div>
    </div>
  );
}
