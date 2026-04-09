"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Tag, Calendar, MapPin, Eye, MessageSquare, Building } from 'lucide-react';
import { useState } from 'react';

import { type Item } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ItemDetailsDialog } from './item-details-dialog';

type ItemCardProps = {
  item: Item;
};

export function ItemCard({ item }: ItemCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, boxShadow: "0px 10px 20px hsla(var(--primary), 0.1)" }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="h-full"
      >
        <Card className="group relative flex h-full flex-col overflow-hidden" onClick={() => setIsDetailsOpen(true)}>
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            {item.imageUrl && item.imageUrl.startsWith && item.imageUrl.startsWith('data:') ? (
              // next/image doesn't support data URLs reliably; use <img> for base64 previews
              // keep same styling as Image with object-cover and fill behavior
              <img
                src={item.imageUrl}
                alt={item.name}
                data-ai-hint={item.imageHint}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <Image
                src={item.imageUrl}
                alt={item.name}
                data-ai-hint={item.imageHint}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <Badge
              variant={item.status === 'Found' ? 'default' : 'destructive'}
              className="absolute right-2 top-2 bg-opacity-80 backdrop-blur-sm"
            >
              {item.status}
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="font-headline truncate">{item.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4" />
              <span>{item.department}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Found near {item.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(item.date, { addSuffix: true })}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); setIsDetailsOpen(true); }}>
                  <Eye className="mr-2 h-4 w-4" /> Details
              </Button>
              <Button onClick={(e) => { e.stopPropagation(); setIsDetailsOpen(true); }}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Claim
              </Button>
          </CardFooter>
        </Card>
      </motion.div>
      <ItemDetailsDialog item={item} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
    </>
  );
}
