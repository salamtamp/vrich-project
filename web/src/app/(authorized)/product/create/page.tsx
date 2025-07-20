'use client';

import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import ProductForm from './product-form';

const CreateProductPage = () => {
  return (
    <div className='flex min-h-screen flex-col gap-6 overflow-scroll bg-base-gray-light p-6'>
      <Card className='mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-sm'>
        <CardHeader>
          <CardTitle className='text-xl font-semibold text-blue-700'>Create Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProductPage;
