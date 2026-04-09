import { User, Item, AppNotification, Badge } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { Medal } from 'lucide-react';

const getImage = (id: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return {
    url: img?.imageUrl || 'https://picsum.photos/seed/default/400/300',
    hint: img?.imageHint || 'image'
  };
};

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Jay Jobanputra',
  collegeId: 'A-12345',
  department: 'B.Tech - Computer',
  avatarUrl: getImage('user-avatar-1').url,
  avatarHint: getImage('user-avatar-1').hint,
  itemsPosted: 7,
  itemsFound: 8,
};

export const MOCK_ITEMS: Item[] = [
  {
    id: 'i1',
    name: 'Leather Wallet',
    category: 'Personal',
    department: 'MBA',
    status: 'Found',
    location: 'Library',
    date: new Date('2024-05-20T10:00:00Z'),
    description: 'A brown leather wallet found near the main desk. Contains some cash and cards. Please identify to claim.',
    imageUrl: getImage('item-wallet').url,
    imageHint: getImage('item-wallet').hint,
    userId: 'u2',
  },
  {
    id: 'i2',
    name: 'MacBook Pro 14"',
    category: 'Laptops',
    department: 'B.Tech - Computer',
    status: 'Lost',
    location: 'Canteen',
    date: new Date('2024-05-19T14:30:00Z'),
    description: 'Lost my space gray MacBook Pro. It has a small scratch on the corner and a sticker of a planet.',
    imageUrl: getImage('item-laptop').url,
    imageHint: getImage('item-laptop').hint,
    userId: 'u1',
  },
  {
    id: 'i3',
    name: 'Spiral Notebook',
    category: 'Books',
    department: 'B.Tech - Civil',
    status: 'Found',
    location: 'Sports Complex',
    date: new Date('2024-05-18T18:00:00Z'),
    description: 'Found a notebook with physics notes. Left on the bleachers.',
    imageUrl: getImage('item-notebook').url,
    imageHint: getImage('item-notebook').hint,
    userId: 'u3',
  },
  {
    id: 'i4',
    name: 'Steel Water Bottle',
    category: 'Other',
    department: 'Diploma - Mechanical',
    status: 'Lost',
    location: 'Labs',
    date: new Date('2024-05-17T09:15:00Z'),
    description: 'My favorite black steel water bottle. It has a small dent on the side.',
    imageUrl: getImage('item-bottle').url,
    imageHint: getImage('item-bottle').hint,
    userId: 'u4',
  },
  {
    id: 'i5',
    name: 'Wireless Headphones',
    category: 'Electronics',
    department: 'B.Tech - IT',
    status: 'Found',
    location: 'Library',
    date: new Date('2024-05-21T11:45:00Z'),
    description: 'Black Sony wireless headphones found in a study cubicle on the second floor.',
    imageUrl: getImage('item-headphones').url,
    imageHint: getImage('item-headphones').hint,
    userId: 'u5',
  },
  {
    id: 'i6',
    name: 'Student ID Card',
    category: 'ID Cards',
    department: 'BBA',
    status: 'Found',
    location: 'Canteen',
    date: new Date('2024-05-22T13:00:00Z'),
    description: 'Found a student ID card near the entrance of the canteen. Belongs to Jane Smith.',
    imageUrl: getImage('item-id-card').url,
    imageHint: getImage('item-id-card').hint,
    userId: 'u1',
  },
  {
    id: 'i8',
    name: 'Silver Ring',
    category: 'Jewellery',
    department: 'B.Pharm',
    status: 'Found',
    location: 'Sports Complex',
    date: new Date('2024-05-22T17:00:00Z'),
    description: 'Found a silver ring with a small inscription inside.',
    imageUrl: getImage('item-ring').url,
    imageHint: getImage('item-ring').hint,
    userId: 'u7',
  },
  {
    id: 'i9',
    name: 'Cash',
    category: 'Money',
    department: 'B.Com',
    status: 'Found',
    location: 'Canteen',
    date: new Date('2024-05-23T12:30:00Z'),
    description: 'Found a small amount of cash near the checkout counter.',
    imageUrl: getImage('item-cash').url,
    imageHint: getImage('item-cash').hint,
    userId: 'u8',
  }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
    { id: 'n1', message: 'Someone found an ID card near the canteen!', date: new Date(), read: false },
    { id: 'n2', message: 'Your lost wallet might match an item found near the library.', date: new Date(Date.now() - 3600000), read: false },
    { id: 'n3', message: 'A new item has been posted in the "Electronics" category.', date: new Date(Date.now() - 86400000), read: true },
    { id: 'n4', message: 'You have been awarded the Bronze Helper badge!', date: new Date(Date.now() - 172800000), read: true },
];

export const MOCK_BADGES: Badge[] = [
    { name: 'Bronze Helper', icon: Medal, itemsRequired: 3, description: 'You\'ve helped recover 3 items. A great start!' },
    { name: 'Silver Helper', icon: Medal, itemsRequired: 5, description: '5 items recovered! You\'re a campus hero.' },
    { name: 'Gold Helper', icon: Medal, itemsRequired: 10, description: '10 items! Your efforts make our campus better.' },
]
