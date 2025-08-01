import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import dayjs from './dayjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRelativeTimeInThai(date: string | Date | null | undefined): string {
  if (!date) {
    return '';
  }

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
  } else if (diffMonths === 0) {
    return `${diffDays} วันที่แล้ว`;
  } else if (diffMonths < 13) {
    return `${diffMonths} เดือนที่แล้ว`;
  }
  return `${diffYears} ปีที่แล้ว`;
}

/**
 * Converts UTC date to Bangkok timezone and formats it
 * @param date - The date to convert (UTC string, Date object, or null/undefined)
 * @param format - The format string (default: 'YYYY-MM-DD HH:mm')
 * @param fallback - The fallback value if date is null/undefined (default: '-')
 * @returns Formatted date string in Bangkok timezone or fallback value
 */
export function formatDateToBangkok(
  date: string | Date | null | undefined,
  format: string = 'YYYY-MM-DD HH:mm',
  fallback: string = '-'
): string {
  if (!date) {
    return fallback;
  }

  return dayjs.utc(date).tz('Asia/Bangkok').format(format);
}
