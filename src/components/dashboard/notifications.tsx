"use client";

import { Bell } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function Notifications() {
    const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0">{unreadCount}</Badge>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline">Notifications</SheetTitle>
          <SheetDescription>
            Here are your recent updates from around campus.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-8rem)] pr-4 mt-4">
            <div className="flex flex-col gap-4">
            {MOCK_NOTIFICATIONS.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 rounded-lg border p-3 text-sm transition-all hover:bg-accent">
                     {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
                     <div className={`flex-1 ${!notification.read ? '' : 'pl-5'}`}>
                        <p className={`font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(notification.date, { addSuffix: true })}</p>
                    </div>
                </div>
            ))}
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
