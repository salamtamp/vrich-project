import {
  CheckCircle2,
  Clock,
  DollarSign,
  Inbox,
  PlusCircle,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
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
  iconcolor: string;
  numbers?: string;
  currency?: string;
};

export const campaignWidgetsData: CampaignWidget[] = [
  {
    id: crypto.randomUUID(),
    icon: ShoppingCart,
    name: 'จำนวนออเดอร์ทั้งหมด',
    start: 0,
    end: 1445,
    duration: 3000,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
  },
  {
    id: crypto.randomUUID(),
    icon: PlusCircle,
    name: 'จำนวนออเดอร์ใหม่',
    start: 0,
    end: 100,
    duration: 3000,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
  },
  {
    id: crypto.randomUUID(),
    icon: Clock,
    name: 'รอการชำระเงิน',
    start: 0,
    end: 845,
    duration: 3000,
    icon2: TrendingDown,
    iconcolor: 'badge badge-red',
  },
  {
    id: crypto.randomUUID(),
    icon: CheckCircle2,
    name: 'ชำระเงินแล้ว',
    start: 0,
    end: 500,
    duration: 3000,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
  },
  {
    id: crypto.randomUUID(),
    icon: DollarSign,
    name: 'ยอดขาย',
    start: 0,
    end: 1245,
    duration: 3000,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
    numbers: ' พันบาท',
  },
  {
    id: crypto.randomUUID(),
    icon: Users,
    name: 'จำนวนคนที่มีส่วนร่วม',
    start: 0,
    end: 150,
    duration: 3000,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
  },
  {
    id: crypto.randomUUID(),
    icon: Inbox,
    name: 'จำนวนคนที่ยังไม่ได้ทัก Inbox',
    start: 0,
    end: 24,
    duration: 3000,
    icon2: TrendingDown,
    iconcolor: 'badge badge-red',
  },
  {
    id: crypto.randomUUID(),
    icon: UserCheck,
    name: 'จำนวนคนที่สั่งซื้อ',
    start: 0,
    end: 95,
    duration: 3000,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
  },
  {
    id: crypto.randomUUID(),
    icon: UserPlus,
    name: 'จำนวนลูกค้าใหม่',
    start: 0,
    end: 9,
    duration: 3000,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
  },
  {
    id: crypto.randomUUID(),
    icon: UserMinus,
    name: 'จำนวนลูกค้าเก่า',
    start: 0,
    end: 86,
    duration: 3000,
    icon2: TrendingDown,
    iconcolor: 'badge badge-red',
  },
];
