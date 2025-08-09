import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { API } from '@/constants/api.constant';

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

// EasySlip API types
export type EasySlipResponse = {
  status: number;
  data: {
    payload: string;
    transRef: string;
    date: string;
    countryCode: string;
    amount: {
      amount: number;
      local: {
        amount: number;
        currency: string;
      };
    };
    fee: number;
    ref1: string;
    ref2: string;
    ref3: string;
    sender: {
      bank: {
        id: string;
        name: string;
        short: string;
      };
      account: {
        name: {
          th: string;
          en: string;
        };
        bank: {
          type: string;
          account: string;
        };
      };
    };
    receiver: {
      bank: Record<string, unknown>;
      account: {
        name: {
          th: string;
          en: string;
        };
      };
    };
  };
};

export type EasySlipExtractedData = {
  amount: number;
  date: string;
};

export type EasySlipError = {
  message: string;
  status?: number;
};

/**
 * Verify payment slip using EasySlip API
 * @param base64Image - Base64 encoded image string
 * @returns Promise with extracted amount and date, or error
 */
export const verifyPaymentSlip = async (
  base64Image: string
): Promise<{ data: EasySlipExtractedData | null; error: EasySlipError | null }> => {
  try {
    const response = await fetch(API.PAYMENT_SLIP_VERIFY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API.PAYMENT_SLIP_API_TOKEN}`,
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    });

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: `HTTP error! status: ${response.status}`,
          status: response.status,
        },
      };
    }

    const result: EasySlipResponse = await response.json();

    if (result.status !== 200) {
      return {
        data: null,
        error: {
          message: 'API returned non-success status',
          status: result.status,
        },
      };
    }

    // Extract only amount and date
    const extractedData: EasySlipExtractedData = {
      amount: result.data.amount.amount,
      date: result.data.date,
    };

    return {
      data: extractedData,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    };
  }
};
