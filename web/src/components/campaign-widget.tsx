'use client';

import React from 'react';

import { AnimatedCounter } from '@/components/ui/animated-counter';
import type { CampaignWidget } from '@/mock/campaign-widgets';

type CampaignWidgetProps = {
  widget: CampaignWidget;
};

const CampaignWidget: React.FC<CampaignWidgetProps> = ({ widget }) => {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm'>
      <p className='mb-2 text-sm-regular text-gray-500'>{widget.name}</p>
      <div className='text-2xl font-semibold text-gray-900'>
        {widget.currency}
        <div className='flex flex-col'>
          <AnimatedCounter
            duration={widget.duration}
            end={widget.end}
            start={widget.start}
          />
          <p className='text-md-regular'> {widget.numbers}</p>
        </div>
      </div>
    </div>
  );
};

export { CampaignWidget };
