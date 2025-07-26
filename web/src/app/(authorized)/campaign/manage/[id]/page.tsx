'use client';

import React, { useEffect } from 'react';

import { useParams } from 'next/navigation';

import { FormPageWrapper } from '@/components/FormPageWrapper';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { API } from '@/constants/api.constant';
import { PaginationProvider } from '@/contexts';
import useRequest from '@/hooks/request/useRequest';
import type { Campaign } from '@/types/api/campaign';

import CampaignForm from '../../create/campaign-form';

import OrderTab from './order-tab';
import SummaryTab from './summary-tab';

const ManageCampaignPage = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, handleRequest } = useRequest<Campaign>({
    request: { url: `${API.CAMPAIGN}/${String(id)}`, method: 'GET' },
    defaultLoading: true,
  });
  const [tab, setTab] = React.useState('summary');

  useEffect(() => {
    void handleRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Scroll to top when tab changes
    const scrollContainer = document.querySelector('.overflow-y-scroll');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [tab]);

  if (!data?.id) {
    return <></>;
  }

  const formValues = data
    ? {
        id: data.id ?? '',
        name: data.name ?? '',
        description: data.description ?? '',
        status: data.status ?? 'inactive',
        startDate: data.start_date ?? '',
        endDate: data.end_date ?? '',
        channels: data.channels ?? [],
        postId: data.post_id ?? '',
        products:
          data.campaigns_products?.map((cp) => ({
            productId: cp.product_id,
            name: cp.product?.name ?? '',
            keyword: cp.keyword,
            quantity: cp.quantity,
            status: cp.status ?? 'inactive',
          })) ?? [],
      }
    : undefined;

  return (
    <FormPageWrapper
      className='flex h-full flex-col overflow-hidden'
      title='Manage Campaign'
    >
      <Tabs
        className=''
        value={tab}
        onValueChange={setTab}
      >
        <TabsList className='bg-gray-200'>
          <TabsTrigger value='summary'>Summary</TabsTrigger>
          <TabsTrigger value='detail'>Detail</TabsTrigger>
          <TabsTrigger value='orders'>Orders</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className='mt-2 flex-1 overflow-y-scroll pr-1'>
        {tab === 'summary' && (
          <PaginationProvider defaultValue={{ limit: 10 }}>
            <SummaryTab campaignId={data.id} />
          </PaginationProvider>
        )}
        {tab === 'detail' && (
          <PaginationProvider defaultValue={{ limit: 1000000 }}>
            <CampaignForm
              key={`campaign-form-${tab}`}
              campaignId={data.id}
              initialPost={data.post}
              initialValues={formValues}
              mode='edit'
            />
          </PaginationProvider>
        )}
        {tab === 'orders' && <OrderTab campaignId={data.id} />}
      </div>
    </FormPageWrapper>
  );
};

export default ManageCampaignPage;
