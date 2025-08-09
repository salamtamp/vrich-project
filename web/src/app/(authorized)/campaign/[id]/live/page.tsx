'use client';

import React, { useMemo } from 'react';

import { useParams } from 'next/navigation';

import { ArrowLeft, Radio } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { API } from '@/constants/api.constant';
import useRequest from '@/hooks/request/useRequest';
import type { Campaign } from '@/types/api/campaign';

const CampaignLivePage = () => {
  const params = useParams();
  const campaignId = params.id as string;

  const { data: campaignData, isLoading } = useRequest<Campaign>({
    request: {
      url: `${API.CAMPAIGN}/${campaignId}`,
    },
  });

  const campaign = useMemo(() => campaignData, [campaignData]);

  const handleGoBack = () => {
    window.history.back();
  };

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
          <CardTitle className='text-lg-semibold text-blue-700'>{campaign.name} - Live</CardTitle>
        </div>
        <div className='flex items-center gap-2'>
          <Radio className='size-4 text-green-600' />
          <span className='text-sm font-medium text-green-600'>Live</span>
        </div>
      </div>

      <div className='mt-6 flex-1 overflow-auto'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded-lg border border-gray-200 bg-white p-6'>
            <h3 className='mb-4 text-lg font-semibold'>Campaign Overview</h3>
            <div className='space-y-3'>
              <div>
                <span className='text-sm text-gray-600'>Status:</span>
                <span
                  className={`ml-2 rounded px-2 py-1 text-xs font-medium ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {campaign.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className='text-sm text-gray-600'>Channels:</span>
                <div className='mt-1'>
                  {campaign.channels && campaign.channels.length > 0 ? (
                    campaign.channels.map((channel) => (
                      <span
                        key={channel}
                        className='mb-1 mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-800'
                      >
                        {channel.startsWith('facebook_') ? channel.replace('facebook_', '') : channel}
                      </span>
                    ))
                  ) : (
                    <span className='text-sm text-gray-500'>No channels</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-200 bg-white p-6'>
            <h3 className='mb-4 text-lg font-semibold'>Live Statistics</h3>
            <div className='space-y-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>0</div>
                <div className='text-sm text-gray-600'>Active Posts</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>0</div>
                <div className='text-sm text-gray-600'>Total Comments</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>0</div>
                <div className='text-sm text-gray-600'>Total Likes</div>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-200 bg-white p-6'>
            <h3 className='mb-4 text-lg font-semibold'>Recent Activity</h3>
            <div className='space-y-3'>
              <div className='text-sm text-gray-600'>No recent activity</div>
            </div>
          </div>
        </div>

        <div className='mt-6 rounded-lg border border-gray-200 bg-white p-6'>
          <h3 className='mb-4 text-lg font-semibold'>Live Feed</h3>
          <div className='py-8 text-center text-gray-500'>
            <Radio className='mx-auto mb-4 size-12 text-gray-300' />
            <p>Live feed will appear here when campaign is active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignLivePage;
