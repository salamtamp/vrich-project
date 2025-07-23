'use client';

import React, { useEffect } from 'react';

import { useParams } from 'next/navigation';

import { FormPageWrapper } from '@/components/FormPageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { API } from '@/constants/api.constant';
import useRequest from '@/hooks/request/useRequest';
import type { Campaign } from '@/types/api/campaign';

import CampaignForm from '../../create/campaign-form';

import OrderTab from './order-tab';

const ManageCampaignPage = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, handleRequest } = useRequest<Campaign>({
    request: { url: `${API.CAMPAIGN}/${String(id)}`, method: 'GET' },
    defaultLoading: true,
  });
  const [tab, setTab] = React.useState('detail');

  useEffect(() => {
    void handleRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          })) ?? [],
      }
    : undefined;

  return (
    <FormPageWrapper title='Manage Campaign'>
      <Tabs
        className='w-full'
        value={tab}
        onValueChange={setTab}
      >
        <TabsList>
          <TabsTrigger value='detail'>Detail</TabsTrigger>
          <TabsTrigger value='orders'>Orders</TabsTrigger>
        </TabsList>
        <TabsContent value='detail'>
          <CampaignForm
            campaignId={data.id}
            initialPost={data.post}
            initialValues={formValues}
            mode='edit'
          />
        </TabsContent>
        <TabsContent value='orders'>
          <OrderTab campaignId={data.id} />
        </TabsContent>
      </Tabs>
    </FormPageWrapper>
  );
};

export default ManageCampaignPage;
