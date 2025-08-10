import {
  Archive,
  House,
  MessageSquare,
  Package,
  ShoppingCart,
  Store,
  Tag,
  Truck,
  User,
  Warehouse,
} from 'lucide-react';

import { PATH } from '@/constants/path.constant';

import type { SidebarConfig } from './types';

export const sidebarConfig: SidebarConfig = [
  { label: 'หน้าหลัก', path: PATH.HOME, icon: House },
  {
    label: 'หน้างานขาย',
    icon: Store,
    children: [{ label: 'แคมเปญ', path: PATH.CAMPAIGN, icon: Tag }],
  },
  { label: 'แชท', path: PATH.CHATS, icon: MessageSquare },
  {
    label: 'คลังสินค้า',
    icon: Warehouse,
    children: [
      { label: 'สินค้า', path: PATH.PRODUCTS, icon: Package },
      { label: 'คลังสินค้า', path: PATH.INVENTORY, icon: Archive },
    ],
  },
  { label: 'รายการสั่งซื้อ', path: PATH.ORDER, icon: ShoppingCart },
  { label: 'การขนส่ง', path: PATH.DELIVERY, icon: Truck },
  { label: 'ลูกค้า', path: PATH.PROFILE, icon: User },
];

export const fenixSidebarConfig: SidebarConfig = [
  { label: 'หน้าหลัก', path: PATH.HOME, icon: House },
  { label: 'แชท', path: PATH.CHATS, icon: MessageSquare },
  { label: 'ลูกค้า', path: PATH.PROFILE, icon: User },
];

// { label: 'Posts', path: PATH.POST, icon: MessageSquareText },
// { label: 'Inbox', path: PATH.INBOX, icon: Inbox },
