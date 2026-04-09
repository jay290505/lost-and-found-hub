'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Home,
  Map,
  Package,
  PlusCircle,
  Search,
  Trophy,
  UserCircle,
  Shield,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Logo from '@/components/logo';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/dashboard/user-nav';
import { Notifications } from '@/components/dashboard/notifications';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/add-item', label: 'Add Item', icon: PlusCircle },
  { href: '/dashboard/my-items', label: 'My Items', icon: Package },
  { href: '/dashboard/rewards', label: 'Rewards', icon: Trophy },
    { href: '/dashboard/map', label: 'Campus Map', icon: Map },
    { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="group-data-[collapsible=icon]:hidden text-white">
            <Logo />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
                <UserNav />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
  <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-slate-900/95 px-4 backdrop-blur-sm sm:h-auto sm:border-0 sm:bg-slate-900 sm:px-6 text-white">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex-1" />
          <ThemeToggle />
          <Notifications />
          <div className="hidden sm:block">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
