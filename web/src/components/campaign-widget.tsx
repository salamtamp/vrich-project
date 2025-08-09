'use client';

import React from 'react';

import { MoreHorizontal } from 'lucide-react';

import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';
import type { CampaignWidget } from '@/mock/campaign-widgets';

type CampaignWidgetProps = {
  widget: CampaignWidget;
};

const CampaignWidget: React.FC<CampaignWidgetProps> = ({ widget }) => {
  const Icon = widget.icon;
  const TrendIcon = widget.icon2;

  return (
    <div className='col-span-12 border-b border-gray-200 md:col-span-6 md:border-r xl:col-span-3'>
      <div className='p-6'>
        <div className='mb-6 flex items-center gap-3'>
          <p className='flex grow items-center gap-2 text-gray-500'>
            <Icon className='size-4' />
            {widget.name}
          </p>
          <Dropdown
            trigger={
              <DropdownTrigger
                className='text-gray-500 hover:text-gray-700'
                icon={<MoreHorizontal className='size-4' />}
              />
            }
          >
            <DropdownMenu>
              <DropdownItem
                onClick={() => {
                  // Weekly action
                }}
              >
                Weekly
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  // Monthly action
                }}
              >
                Monthly
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  // Yearly action
                }}
              >
                Yearly
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className='flex items-center gap-3'>
          <h5 className='grow text-2xl font-bold text-gray-900'>
            {widget.currency}
            <AnimatedCounter
              duration={widget.duration}
              end={widget.end}
              start={widget.start}
            />
            {widget.numbers}
          </h5>
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              widget.iconcolor
            )}
          >
            <TrendIcon className='size-3' />
            {widget.perData}
          </div>
        </div>
      </div>
    </div>
  );
};

export { CampaignWidget };
