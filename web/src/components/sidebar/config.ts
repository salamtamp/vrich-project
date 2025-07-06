import { MessageSquare, MessageSquareText, User } from 'lucide-react';

import { PATH } from '@/constants/path.constant';

export const sidebarConfig = [
  { label: 'Messages', path: PATH.MESSAGE, icon: MessageSquare },
  { label: 'Comments', path: PATH.COMMENT, icon: MessageSquareText },
  { label: 'Profile', path: PATH.PROFILE, icon: User },
];
