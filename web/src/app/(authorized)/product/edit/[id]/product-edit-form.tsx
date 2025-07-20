'use client';

import React, { useEffect } from 'react';

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

type ProductEditFormProps = {
  productId: string;
};

const ProductEditForm = ({ productId }: ProductEditFormProps) => {
  const router = useRouter();

  const { data: productData, isLoading: isLoadingProduct } = useRequest<ProductResponse>({
    request: {
      url: `${API.PRODUCTS}/${productId}`,
      method: 'GET',
    },
  });

  const { handleRequest: handleUpdateRequest, isLoading: isUpdating } = useRequest<ProductResponse>({
    request: {
      url: `${API.PRODUCTS}/${productId}`,
      method: 'PUT',
    },
  });

  const { control, handleSubmit, reset } = useForm<ProductFormValues>({
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (productData) {
      const defaultValues: ProductFormValues = {
        code: productData.code,
        name: productData.name,
        description: productData.description ?? '',
        quantity: productData.quantity,
        unit: productData.unit ?? '',
        full_price: productData.full_price,
        selling_price: productData.selling_price,
        cost: productData.cost,
        shipping_fee: productData.shipping_fee,
        note: productData.note ?? '',
        keyword: productData.keyword ?? '',
        product_category: productData.product_category ?? '',
        product_type: productData.product_type ?? '',
        color: productData.color ?? '',
        size: productData.size ?? '',
        weight: productData.weight,
      };
      reset(defaultValues);
    }
  }, [productData, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      await handleUpdateRequest({
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
      console.error('Failed to update product:', error);
    }
  };

  const onCancel = () => {
    router.push('/product');
  };

  if (isLoadingProduct) {
    return <div className='flex justify-center p-8'>Loading...</div>;
  }

  return (
    <form
      className='grid gap-6'
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
            />
          )}
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button
          disabled={isUpdating}
          type='button'
          variant='softgray'
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          disabled={isUpdating}
          type='submit'
          variant='softgray'
        >
          {isUpdating ? 'Updating...' : 'Update Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductEditForm;
