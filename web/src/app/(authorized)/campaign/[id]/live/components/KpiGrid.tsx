'use client';

import React from 'react';

import OrderTab from '@/app/(authorized)/campaign/manage/[id]/order-tab';
import { CampaignWidget } from '@/components/campaign-widget';
import { CampaignWidgetKey } from '@/constants/campaign-widgets.constant';
import useModalContext from '@/hooks/useContext/useModalContext';
import type { CampaignWidget as CampaignWidgetType } from '@/mock/campaign-widgets';
import { campaignWidgetsData } from '@/mock/campaign-widgets';

type KpiGridProps = {
  className?: string;
  campaignId: string;
};

const KpiGrid: React.FC<KpiGridProps> = ({ className, campaignId }) => {
  const { open } = useModalContext();

  const handleWidgetClick = (widget: CampaignWidgetType) => {
    if (widget.key === CampaignWidgetKey.TOTAL_ORDERS) {
      open({
        content: (
          <OrderTab
            isModal
            campaignId={campaignId}
          />
        ),
        className: 'w-full max-w-[1200px] h-[80vh]',
      });
    }
  };

  return (
    <div className={className}>
      {campaignWidgetsData.map((widget) => (
        <CampaignWidget
          key={widget.id}
          widget={widget}
          onClick={() => {
            handleWidgetClick(widget);
          }}
        />
      ))}
    </div>
  );
};

export default KpiGrid;
