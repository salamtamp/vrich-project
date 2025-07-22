'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';

import { FormController } from '@/components/ui';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { API } from '@/constants/api.constant';
import useRequest from '@/hooks/request/useRequest';
import type { ProductResponse } from '@/types/api/product';

type ProductFormValues = {
  code: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  full_price: number;
  selling_price: number;
  cost: number;
  shipping_fee: number;
  note: string;
  keyword: string;
  product_category: string;
  product_type: string;
  color: string;
  size: string;
  weight: number;
};

const defaultValues: ProductFormValues = {
  code: '',
  name: '',
  description: '',
  quantity: 0,
  unit: '',
  full_price: 0,
  selling_price: 0,
  cost: 0,
  shipping_fee: 0,
  note: '',
  keyword: '',
  product_category: '',
  product_type: '',
  color: '',
  size: '',
  weight: 0,
};

const ProductForm = () => {
  const router = useRouter();
  const { handleRequest, isLoading } = useRequest<ProductResponse>({
    request: {
      url: API.PRODUCTS,
      method: 'POST',
    },
  });

  const { control, handleSubmit, reset } = useForm<ProductFormValues>({
    defaultValues,
    mode: 'onSubmit',
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      await handleRequest({
        data: {
          ...data,
          quantity: Number(data.quantity),
          full_price: Number(data.full_price),
          selling_price: Number(data.selling_price),
          cost: Number(data.cost),
          shipping_fee: Number(data.shipping_fee),
          weight: Number(data.weight),
        },
      });
      router.push('/product');
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const onClear = () => {
    reset(defaultValues);
  };

  return (
    <form
      className='flex flex-col gap-8'
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <Label htmlFor='code'>Product Code</Label>
          <FormController
            control={control}
            name='code'
            render={({ field }) => (
              <Input
                id='code'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor='name'>Product Name</Label>
          <FormController
            control={control}
            name='name'
            render={({ field }) => (
              <Input
                id='name'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
            )}
          />
        </div>
      </div>

      <div>
        <Label htmlFor='description'>Description</Label>
        <FormController
          control={control}
          name='description'
          render={({ field }) => (
            <Textarea
              id='description'
              {...field}
              className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
            />
          )}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div>
          <Label htmlFor='quantity'>Quantity</Label>
          <FormController
            control={control}
            name='quantity'
            render={({ field }) => (
              <Input
                id='quantity'
                min='0'
                type='number'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor='unit'>Unit</Label>
          <FormController
            control={control}
            name='unit'
            render={({ field }) => (
              <Input
                id='unit'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor='weight'>Weight</Label>
          <FormController
            control={control}
            name='weight'
            render={({ field }) => (
              <Input
                id='weight'
                min='0'
                step='0.01'
                type='number'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
              />
            )}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <Label htmlFor='full_price'>Full Price</Label>
          <FormController
            control={control}
            name='full_price'
            render={({ field }) => (
              <Input
                id='full_price'
                min='0'
                step='0.01'
                type='number'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor='selling_price'>Selling Price</Label>
          <FormController
            control={control}
            name='selling_price'
            render={({ field }) => (
              <Input
                id='selling_price'
                min='0'
                step='0.01'
                type='number'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
              />
            )}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <Label htmlFor='cost'>Cost</Label>
          <FormController
            control={control}
            name='cost'
            render={({ field }) => (
              <Input
                id='cost'
                min='0'
                step='0.01'
                type='number'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor='shipping_fee'>Shipping Fee</Label>
          <FormController
            control={control}
            name='shipping_fee'
            render={({ field }) => (
              <Input
                id='shipping_fee'
                min='0'
                step='0.01'
                type='number'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
              />
            )}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <Label htmlFor='product_category'>Product Category</Label>
          <FormController
            control={control}
            name='product_category'
            render={({ field }) => (
              <Input
                id='product_category'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor='product_type'>Product Type</Label>
          <FormController
            control={control}
            name='product_type'
            render={({ field }) => (
              <Input
                id='product_type'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
            )}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <Label htmlFor='color'>Color</Label>
          <FormController
            control={control}
            name='color'
            render={({ field }) => (
              <Input
                id='color'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor='size'>Size</Label>
          <FormController
            control={control}
            name='size'
            render={({ field }) => (
              <Input
                id='size'
                {...field}
                className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
            )}
          />
        </div>
      </div>

      <div>
        <Label htmlFor='keyword'>Keyword</Label>
        <FormController
          control={control}
          name='keyword'
          render={({ field }) => (
            <Input
              id='keyword'
              {...field}
              className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
            />
          )}
        />
      </div>

      <div>
        <Label htmlFor='note'>Note</Label>
        <FormController
          control={control}
          name='note'
          render={({ field }) => (
            <Textarea
              id='note'
              {...field}
              className='rounded-lg border border-gray-200 bg-blueGray-25 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
            />
          )}
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button
          className='rounded-lg border-gray-100 bg-gray-50 px-4 py-2 font-medium text-gray-700 shadow-none hover:bg-gray-100 hover:text-gray-900'
          disabled={isLoading}
          type='button'
          variant='outline'
          onClick={onClear}
        >
          Clear
        </Button>
        <Button
          className='rounded-lg border-blue-600 bg-blue-600 px-4 py-2 font-medium text-white shadow-none hover:border-blue-700 hover:bg-blue-700'
          disabled={isLoading}
          type='submit'
          variant='outline'
        >
          {isLoading ? 'Creating...' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
