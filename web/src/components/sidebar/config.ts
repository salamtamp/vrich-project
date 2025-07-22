import { Inbox, MessageSquareText, ShoppingBag, Tag, User } from 'lucide-react';

import { PATH } from '@/constants/path.constant';

export const sidebarConfig = [
  { label: 'Profile', path: PATH.PROFILE, icon: User },
  { label: 'Posts', path: PATH.POST, icon: MessageSquareText },
  { label: 'Inbox', path: PATH.INBOX, icon: Inbox },
  { label: 'Campaign', path: PATH.CAMPAIGN, icon: Tag },
  { label: 'Products', path: PATH.PRODUCTS, icon: ShoppingBag },
];
