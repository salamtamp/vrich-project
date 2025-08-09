'use client';

import React from 'react';

import { CampaignWidget } from '@/components/campaign-widget';
import { campaignWidgetsData } from '@/mock/campaign-widgets';

type KpiGridProps = {
  className?: string;
};

const KpiGrid: React.FC<KpiGridProps> = ({ className }) => {
  return (
    <div className={className}>
      {campaignWidgetsData.map((widget) => (
        <CampaignWidget key={widget.id} widget={widget} />
      ))}
    </div>
  );
};

export default KpiGrid;

