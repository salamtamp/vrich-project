'use client';

import React, { useEffect } from 'react';

import { useParams } from 'next/navigation';

import { FormPageWrapper } from '@/components/FormPageWrapper';
import { API } from '@/constants/api.constant';
import useRequest from '@/hooks/request/useRequest';
import type { ProductResponse } from '@/types/api/product';

import ProductForm from '../../create/product-form';

const EditProductPage = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, handleRequest } = useRequest<ProductResponse>({
    request: { url: `${API.PRODUCTS}/${String(id)}`, method: 'GET' },
    defaultLoading: true,
  });

  useEffect(() => {
    void handleRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data?.id) {
    return <></>;
  }
  // Map API response to form values
  const formValues = {
    ...data,
    description: data.description ?? '',
    unit: data.unit ?? '',
    note: data.note ?? '',
    keyword: data.keyword ?? '',
    product_category: data.product_category ?? '',
    product_type: data.product_type ?? '',
    color: data.color ?? '',
    size: data.size ?? '',
  };

  return (
    <FormPageWrapper title='Edit Product'>
      <ProductForm
        initialValues={formValues}
        mode='edit'
      />
    </FormPageWrapper>
  );
};

export default EditProductPage;
