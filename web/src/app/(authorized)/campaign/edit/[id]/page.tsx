'use client';

import React, { useEffect } from 'react';

import { useParams } from 'next/navigation';

import { FormPageWrapper } from '@/components/FormPageWrapper';
import { API } from '@/constants/api.constant';
import useRequest from '@/hooks/request/useRequest';
import type { CampaignsProduct } from '@/types/api/campaigns_products';

import CampaignForm from '../../create/campaign-form';

const EditCampaignPage = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading, handleRequest } = useRequest<CampaignsProduct>({
    request: { url: `${API.CAMPAIGNS_PRODUCTS}/${String(id)}`, method: 'GET' },
    defaultLoading: true,
  });

  useEffect(() => {
    void handleRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return null;
  }
  if (!data) {
    return null;
  }
  // Map API response to form values
  const formValues = {
    id: data.campaign?.id ?? '',
    name: data.campaign?.name ?? '',
    description: data.campaign?.description ?? '',
    status: data.campaign?.status ?? 'inactive',
    startDate: data.campaign?.start_date ?? '',
    endDate: data.campaign?.end_date ?? '',
    channels: data.campaign?.channels ?? [],
    postId: data.campaign?.post_id ?? '',
    products: [
      {
        productId: data.product_id,
        name: data.product?.name ?? '',
        keyword: data.keyword,
        quantity: data.quantity,
      },
    ],
  };

  if (!data.campaign?.id) {
    return <></>;
  }

  return (
    <FormPageWrapper title='Edit Campaign'>
      <CampaignForm
        campaignId={data.campaign.id}
        initialValues={formValues}
        mode='edit'
      />
    </FormPageWrapper>
  );
};

export default EditCampaignPage;
