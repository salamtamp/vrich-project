import React from 'react';

import { Check, CheckCheck, Clock, CreditCard, PackageCheck, Trophy, Truck, XCircle } from 'lucide-react';

export const STATUS_COLORS: Record<string, string> = {
  pending:
    'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700',

  confirmed:
    'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800',

  paid: 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100 hover:text-amber-800',

  approved:
    'border-purple-200 bg-purple-50 text-purple-700 hover:border-purple-300 hover:bg-purple-100 hover:text-purple-800',

  shipped:
    'border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-800',

  delivered:
    'border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100 hover:text-green-800',

  cancelled: 'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 hover:text-red-800',

  completed:
    'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirm',
  paid: 'Paid',
  approved: 'Approve',
  shipped: 'Ship',
  delivered: 'Deliver',
  cancelled: 'Cancel',
  completed: 'Complete',
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <Check className='size-4' />;
    case 'paid':
      return <CreditCard className='size-4' />;
    case 'approved':
      return <CheckCheck className='size-4' />;
    case 'shipped':
      return <Truck className='size-4' />;
    case 'delivered':
      return <PackageCheck className='size-4' />;
    case 'cancelled':
      return <XCircle className='size-4' />;
    case 'completed':
      return <Trophy className='size-4' />;
    default:
      return <Clock className='size-4' />;
  }
};
