'use client';

import React, { useEffect } from 'react';

import { useParams } from 'next/navigation';

import { FormPageWrapper } from '@/components/FormPageWrapper';
import { API } from '@/constants/api.constant';
import { useLoading } from '@/contexts';
import useRequest from '@/hooks/request/useRequest';
import type { Campaign } from '@/types/api/campaign';

import CampaignForm from '../../create/campaign-form';

const ManageCampaignPage = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading, handleRequest } = useRequest<Campaign>({
    request: { url: `${API.CAMPAIGN}/${String(id)}`, method: 'GET' },
    defaultLoading: true,
  });
  const { openLoading, closeLoading } = useLoading();

  useEffect(() => {
    if (isLoading) {
      openLoading();
    } else {
      closeLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    void handleRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data?.id) {
    return <></>;
  }

  // Map API response to form values
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
      <CampaignForm
        campaignId={data.id}
        initialPost={data.post}
        initialValues={formValues}
        mode='edit'
      />
    </FormPageWrapper>
  );
};

export default ManageCampaignPage;
