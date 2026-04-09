"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOCK_USER } from '@/lib/mock-data';
import { LogOut, User, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';

export function UserNav() {
  const { state } = useSidebar();
  const router = useRouter();
  const [user, setUser] = useState(MOCK_USER as typeof MOCK_USER);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    try {
      const name = localStorage.getItem('user_name');
      const collegeId = localStorage.getItem('user_collegeId');
      if (name || collegeId) {
        setUser({
          ...MOCK_USER,
          name: name || MOCK_USER.name,
          collegeId: collegeId || MOCK_USER.collegeId,
        });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleLogout = async () => {
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
      await fetch(`${base.replace(/\/$/, '')}/api/logout/`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout request failed', e);
    }
    try { localStorage.removeItem('user_name'); localStorage.removeItem('user_collegeId'); } catch(e){}
    router.push('/');
  };

  if (!mounted) return null;

  if (state === 'collapsed') {
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.avatarHint} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.collegeId}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/dashboard/profile" passHref>
                <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                </DropdownMenuItem>
            </Link>
            <DropdownMenuItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
  <DropdownMenuItem onSelect={handleLogout}>
   <LogOut className="mr-2 h-4 w-4" />
   <span>Log out</span>
  </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="w-full flex items-center justify-between p-2 rounded-md hover:bg-sidebar-accent">
        <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.avatarHint} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-sm font-medium leading-none">{user.name}</span>
                <span className="text-xs leading-none text-muted-foreground">{user.collegeId}</span>
            </div>
        </div>
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
    </Button>
    </div>
  )
}
