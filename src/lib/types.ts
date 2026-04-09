export type Item = {
  id: string;
  name: string;
  category: 'Electronics' | 'Books' | 'Personal' | 'Other' | 'ID Cards' | 'Laptops' | 'Jewellery' | 'Money';
  department: string;
  status: 'Lost' | 'Found';
  location: 'Library' | 'Canteen' | 'Sports Complex' | 'Hostel' | 'Labs';
  date: Date;
  description: string;
  imageUrl: string;
  imageHint: string;
  userId: string;
};

export type User = {
  id: string;
  name: string;
  collegeId: string;
  department: string;
  email?: string;
  avatarUrl: string;
  avatarHint: string;
  itemsPosted: number;
  itemsFound: number;
};

export type AppNotification = {
  id: string;
  message: string;
  date: Date;
  read: boolean;
};

export type Badge = {
  name: 'Bronze Helper' | 'Silver Helper' | 'Gold Helper';
  icon: React.ComponentType<{ className?: string }>;
  itemsRequired: number;
  description: string;
};

export type Department = {
  label: string;
  options: string[];
};
