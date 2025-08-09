import {
  DollarSign,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

export type CampaignWidget = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  start: number;
  end: number;
  duration: number;
  icon2: React.ComponentType<{ className?: string }>;
  perData: string;
  iconcolor: string;
  numbers?: string;
  currency?: string;
};

export const campaignWidgetsData: CampaignWidget[] = [
  {
    id: crypto.randomUUID(),
    icon: Users,
    name: 'Total Reach',
    start: 0,
    end: 345121,
    duration: 3000,
    icon2: TrendingUp,
    perData: '17.9%',
    iconcolor: 'text-green-600 bg-green-100',
  },
  {
    id: crypto.randomUUID(),
    icon: Eye,
    name: 'Impressions',
    start: 0,
    end: 516871,
    duration: 3000,
    icon2: TrendingUp,
    perData: '23.7%',
    iconcolor: 'text-green-600 bg-green-100',
  },
  {
    id: crypto.randomUUID(),
    icon: MessageCircle,
    name: 'Total Comments',
    start: 0,
    end: 14596,
    duration: 3000,
    icon2: TrendingDown,
    perData: '1.6%',
    iconcolor: 'text-red-600 bg-red-100',
  },
  {
    id: crypto.randomUUID(),
    icon: Heart,
    name: 'Total Likes',
    start: 0,
    end: 102450,
    duration: 3000,
    icon2: TrendingUp,
    perData: '3.2%',
    iconcolor: 'text-green-600 bg-green-100',
  },
  {
    id: crypto.randomUUID(),
    icon: DollarSign,
    name: 'Total Revenue',
    start: 0,
    end: 316,
    duration: 3000,
    icon2: TrendingUp,
    perData: '16.1%',
    iconcolor: 'text-green-600 bg-green-100',
    numbers: 'M',
    currency: '$',
  },
  {
    id: crypto.randomUUID(),
    icon: ShoppingCart,
    name: 'Total Orders',
    start: 0,
    end: 278,
    duration: 3000,
    icon2: TrendingUp,
    perData: '9.7%',
    iconcolor: 'text-green-600 bg-green-100',
    numbers: 'K',
    currency: '',
  },
  {
    id: crypto.randomUUID(),
    icon: Share2,
    name: 'Total Shares',
    start: 0,
    end: 53629,
    duration: 3000,
    icon2: TrendingUp,
    perData: '9.7%',
    iconcolor: 'text-green-600 bg-green-100',
  },
  {
    id: crypto.randomUUID(),
    icon: Target,
    name: 'Conversion Rate',
    start: 0,
    end: 70,
    duration: 3000,
    icon2: TrendingDown,
    perData: '0.8%',
    iconcolor: 'text-red-600 bg-red-100',
    numbers: '%',
  },
];
