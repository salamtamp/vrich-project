'use client';

import React from 'react';

import { useParams } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import ProductEditForm from './product-edit-form';

const EditProductPage = () => {
  const params = useParams();
  const productId = params.id as string;

  return (
    <div className='flex min-h-screen flex-col gap-6 bg-base-gray-light p-6'>
      <Card className='mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-sm'>
        <CardHeader>
          <CardTitle className='text-xl font-semibold text-blue-700'>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductEditForm productId={productId} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProductPage;
