'use client';

import React, { useCallback } from 'react';

import OrderTab from '@/app/(authorized)/campaign/manage/[id]/order-tab';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import useModalContext from '@/hooks/useContext/useModalContext';
import { cn } from '@/lib/utils';
import type { CampaignWidget } from '@/mock/campaign-widgets';

type CampaignWidgetProps = {
  widget: CampaignWidget;
  campaignId: string;
};

const CampaignWidget: React.FC<CampaignWidgetProps> = ({ widget, campaignId }) => {
  const LeadIcon = widget.icon;

  const { open } = useModalContext();

  const handleClick = useCallback(() => {
    if (!widget.orderStatus) {
      return;
    }
    open({
      content: (
        <div className='h-[540px] w-[900px] max-w-full'>
          <OrderTab
            isModal
            campaignId={campaignId}
            orderStatus={widget.orderStatus}
          />
        </div>
      ),
    });
  }, [campaignId, open, widget.orderStatus]);

  return (
    <button
      className={cn(
        'group rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-transparent transition',
        !widget.orderStatus ? 'cursor-auto' : 'hover:shadow-md hover:ring-gray-200'
      )}
      onClick={handleClick}
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
