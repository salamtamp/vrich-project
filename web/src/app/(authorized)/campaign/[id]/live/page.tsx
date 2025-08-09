'use client';

import React, { useEffect, useMemo } from 'react';

import { useParams } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import { CampaignWidget } from '@/components/campaign-widget';
import { Button } from '@/components/ui/button';
import { API } from '@/constants/api.constant';
import useRequest from '@/hooks/request/useRequest';
import { campaignWidgetsData } from '@/mock/campaign-widgets';
import type { Campaign } from '@/types/api/campaign';

const CampaignLivePage = () => {
  const params = useParams();
  const campaignId = params.id as string;

  const {
    data: campaignData,
    isLoading,
    handleRequest,
  } = useRequest<Campaign>({
    request: {
      url: `${API.CAMPAIGN}/${campaignId}`,
    },
  });

  const campaign = useMemo(() => campaignData, [campaignData]);

  const handleGoBack = () => {
    window.history.back();
  };

  useEffect(() => {
    void handleRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className='flex h-full max-h-full min-h-[520px] flex-1 flex-col overflow-hidden border border-gray-100 px-6 py-4 shadow-sm'>
        <div className='flex h-full items-center justify-center'>
          <div className='text-lg'>Loading...</div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className='flex h-full max-h-full min-h-[520px] flex-1 flex-col overflow-hidden border border-gray-100 px-6 py-4 shadow-sm'>
        <div className='flex h-full items-center justify-center'>
          <div className='text-lg'>Campaign not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full max-h-full min-h-[520px] flex-1 flex-col overflow-hidden border border-gray-100 px-6 py-4 shadow-sm'>
      <div className='flex flex-row items-center justify-between p-0'>
        <div className='flex items-center gap-4'>
          <Button
            className='flex items-center gap-2'
            size='sm'
            variant='outline'
            onClick={handleGoBack}
          >
            <ArrowLeft className='size-4' />
            Back
          </Button>
        </div>
        <div className='flex items-center gap-4'>
          <p className='narrow max-w-[460px] truncate text-md-semibold'>{campaignData?.name}</p>
          <Button variant='outline'>จัดการแคมเปญ</Button>
        </div>
      </div>

      <div className='mt-4 flex-1 overflow-auto'>
        <div className='grid gap-2 md:grid-cols-3 lg:grid-cols-5'>
          {campaignWidgetsData.map((widget) => (
            <CampaignWidget
              key={widget.id}
              widget={widget}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignLivePage;
