import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import dayjs from './dayjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRelativeTimeInThai(date: string | Date): string {
  const now = dayjs();
  const input = dayjs(date);
  const diffSeconds = now.diff(input, 'second');
  const diffMinutes = now.diff(input, 'minute');
  const diffHours = now.diff(input, 'hour');
  const diffDays = now.diff(input, 'day');
  const diffMonths = now.diff(input, 'month');
  const diffYears = now.diff(input, 'year');

  if (diffSeconds < 60) {
    return 'เมื่อสักครู่';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} นาทีที่แล้ว`;
  } else if (diffHours < 24) {
    return `${diffHours} ชั่วโมงที่แล้ว`;
  } else if (diffDays < 30) {
    return `${diffDays} วันที่แล้ว`;
  } else if (diffMonths < 12) {
    return `${diffMonths} เดือนที่แล้ว`;
  }
  return `${diffYears} ปีที่แล้ว`;
}
