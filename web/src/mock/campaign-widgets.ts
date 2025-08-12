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

import { CampaignWidgetKey } from '@/constants/campaign-widgets.constant';

export type CampaignWidget = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  key: CampaignWidgetKey;
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
    label: 'จำนวนออเดอร์ทั้งหมด',
    key: CampaignWidgetKey.TOTAL_ORDERS,
    start: 0,
    end: 1445,
    duration: 1,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
  },
  {
    id: crypto.randomUUID(),
    icon: PlusCircle,
    label: 'จำนวนออเดอร์ใหม่',
    key: CampaignWidgetKey.NEW_ORDERS,
    start: 0,
    end: 100,
    duration: 1,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
  },
  {
    id: crypto.randomUUID(),
    icon: Clock,
    label: 'รอการชำระเงิน',
    key: CampaignWidgetKey.PENDING_PAYMENT,
    start: 0,
    end: 845,
    duration: 1,
    icon2: TrendingDown,
    iconcolor: 'badge badge-red',
  },
  {
    id: crypto.randomUUID(),
    icon: CheckCircle2,
    label: 'ชำระเงินแล้ว',
    key: CampaignWidgetKey.PAID_ORDERS,
    start: 0,
    end: 500,
    duration: 1,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
  },
  {
    id: crypto.randomUUID(),
    icon: DollarSign,
    label: 'ยอดขาย',
    key: CampaignWidgetKey.SALES,
    start: 0,
    end: 1245,
    duration: 1,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
    numbers: ' พันบาท',
  },
  {
    id: crypto.randomUUID(),
    icon: Users,
    label: 'จำนวนคนที่มีส่วนร่วม',
    key: CampaignWidgetKey.ENGAGED_USERS,
    start: 0,
    end: 150,
    duration: 1,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
  },
  {
    id: crypto.randomUUID(),
    icon: Inbox,
    label: 'จำนวนคนที่ยังไม่ได้ทัก Inbox',
    key: CampaignWidgetKey.UNCONTACTED_INBOX_USERS,
    start: 0,
    end: 24,
    duration: 1,
    icon2: TrendingDown,
    iconcolor: 'badge badge-red',
  },
  {
    id: crypto.randomUUID(),
    icon: UserCheck,
    label: 'จำนวนคนที่สั่งซื้อ',
    key: CampaignWidgetKey.CUSTOMERS_WHO_ORDERED,
    start: 0,
    end: 95,
    duration: 1,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
  },
  {
    id: crypto.randomUUID(),
    icon: UserPlus,
    label: 'จำนวนลูกค้าใหม่',
    key: CampaignWidgetKey.NEW_CUSTOMERS,
    start: 0,
    end: 9,
    duration: 1,
    icon2: TrendingUp,
    iconcolor: 'badge badge-green',
  },
  {
    id: crypto.randomUUID(),
    icon: UserMinus,
    label: 'จำนวนลูกค้าเก่า',
    key: CampaignWidgetKey.OLD_CUSTOMERS,
    start: 0,
    end: 86,
    duration: 1,
    icon2: TrendingDown,
    iconcolor: 'badge badge-red',
  },
];
