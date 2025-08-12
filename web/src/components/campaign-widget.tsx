'use client';

import React from 'react';

import { AnimatedCounter } from '@/components/ui/animated-counter';
import type { CampaignWidget } from '@/mock/campaign-widgets';

type CampaignWidgetProps = {
  widget: CampaignWidget;
  onClick?: () => void;
};

const CampaignWidget: React.FC<CampaignWidgetProps> = ({ widget, onClick }) => {
  const LeadIcon = widget.icon;

  return (
    <button
      className='group rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-transparent transition hover:shadow-md hover:ring-gray-200'
      onClick={onClick}
    >
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center gap-2 text-gray-600'>
          {LeadIcon ? <LeadIcon className='size-4 text-gray-400' /> : null}
          <p className='text-sm-regular'>{widget.label}</p>
        </div>
        <div />
      </div>

      <div className='flex items-end justify-between'>
        <div className='flex w-full items-end justify-center text-2xl font-semibold text-gray-900'>
          {widget.currency}
          <AnimatedCounter
            duration={widget.duration}
            end={widget.end}
            start={widget.start}
          />
          {widget.numbers ? (
            <span className='ml-1 text-base font-normal text-gray-600'>{widget.numbers}</span>
          ) : null}
        </div>
      </div>
    </button>
  );
};

export { CampaignWidget };
