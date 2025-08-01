import React, { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { yupResolver } from '@hookform/resolvers/yup';
import { type Resolver, useForm, useFormState } from 'react-hook-form';
import * as yup from 'yup';

import { FormController, NumberInput } from '@/components/ui';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { API } from '@/constants/api.constant';
import { useLoading } from '@/contexts';
import useRequest from '@/hooks/request/useRequest';
import { createPriceSchema, createQuantitySchema, createWeightSchema } from '@/lib/yup-utils';
import type { ProductResponse } from '@/types/api/product';

type ProductFormValues = {
  id?: string;
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

const schema = yup.object({
  code: yup.string().required('Product code is required'),
  name: yup.string().required('Product name is required'),
  description: yup.string().optional().default(''),
  quantity: createQuantitySchema(0),
  unit: yup.string().required('Unit is required'),
  full_price: createPriceSchema(0),
  selling_price: createPriceSchema(0),
  cost: createPriceSchema(0),
  shipping_fee: createPriceSchema(0),
  note: yup.string().optional().default(''),
  keyword: yup.string().required('Keyword is required'),
  product_category: yup.string().required('Product category is required'),
  product_type: yup.string().required('Product type is required'),
  color: yup.string().optional().default(''),
  size: yup.string().optional().default(''),
  weight: createWeightSchema(0),
});

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

type ProductFormProps =
  | { mode: 'create'; initialValues?: undefined }
  | { mode: 'edit'; initialValues: ProductFormValues | undefined };

const ProductForm = ({ mode, initialValues }: ProductFormProps) => {
  const params = useParams();
  const router = useRouter();
  const { openLoading, closeLoading } = useLoading();
  const { handleRequest, isLoading } = useRequest<ProductResponse>({
    request: {
      url: API.PRODUCTS,
      method: mode === 'edit' ? 'PUT' : 'POST',
    },
  });

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { control, handleSubmit, reset } = useForm<ProductFormValues>({
    defaultValues: mode === 'edit' && initialValues ? { ...defaultValues, ...initialValues } : defaultValues,
    resolver: yupResolver(schema) as Resolver<ProductFormValues>,
    mode: 'onSubmit',
  });
  const { errors } = useFormState({ control });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (mode === 'edit' && !initialValues) {
    return (
      <div className='flex h-96 w-full items-center justify-center'>
        <Spinner />
      </div>
    );
  }

  const onSubmit = async (data: typeof defaultValues) => {
    openLoading();
    setIsSubmitting(true);
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
        patchId: mode === 'edit' ? id : undefined,
      });
      router.push('/product');
    } finally {
      closeLoading();
      setIsSubmitting(false);
    }
  };

  const onClear = () => {
    reset(defaultValues);
  };

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
      {/* Section 1: Product Details */}
      <div className='flex flex-col gap-6 rounded-xl bg-gray-200 px-6 pb-8 pt-4'>
        <h2 className='text-lg-semibold'>Product Details</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='code'>Product Code</Label>
            <FormController
              control={control}
              name='code'
              render={({ field }) => (
                <Input
                  id='code'
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                />
              )}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='name'>Product Name</Label>
            <FormController
              control={control}
              name='name'
              render={({ field }) => (
                <Input
                  id='name'
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                />
              )}
            />
          </div>
        </div>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='description'>Description</Label>
          <FormController
            control={control}
            name='description'
            render={({ field }) => (
              <Textarea
                id='description'
                {...field}
                className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
              />
            )}
          />
          {errors?.description ? (
            <div className='mt-1 text-xs text-red-500'>{errors.description.message}</div>
          ) : null}
        </div>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='keyword'>Keyword</Label>
          <FormController
            control={control}
            name='keyword'
            render={({ field }) => (
              <Input
                id='keyword'
                {...field}
                className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
              />
            )}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='note'>Note</Label>
          <FormController
            control={control}
            name='note'
            render={({ field }) => (
              <Textarea
                id='note'
                {...field}
                className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
              />
            )}
          />
          {errors?.note ? <div className='mt-1 text-xs text-red-500'>{errors.note.message}</div> : null}
        </div>
      </div>

      {/* Section 2: Pricing & Inventory */}
      <div className='flex flex-col gap-6 rounded-xl bg-gray-200 px-6 pb-8 pt-4'>
        <h2 className='text-lg-semibold'>Pricing & Inventory</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='quantity'>Quantity</Label>
            <FormController
              control={control}
              name='quantity'
              render={({ field }) => (
                <NumberInput
                  allowDecimal={false}
                  id='quantity'
                  min={0}
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                  onChange={(value: number | string) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
            {errors?.quantity ? (
              <div className='mt-1 text-xs text-red-500'>{errors.quantity.message}</div>
            ) : null}
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='unit'>Unit</Label>
            <FormController
              control={control}
              name='unit'
              render={({ field }) => (
                <Input
                  id='unit'
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                />
              )}
            />
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='full_price'>Full Price</Label>
            <FormController
              control={control}
              name='full_price'
              render={({ field }) => (
                <NumberInput
                  decimalPlaces={2}
                  id='full_price'
                  min={0}
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                  onChange={(value: string | number) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
            {errors?.full_price ? (
              <div className='mt-1 text-xs text-red-500'>{errors.full_price.message}</div>
            ) : null}
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='selling_price'>Selling Price</Label>
            <FormController
              control={control}
              name='selling_price'
              render={({ field }) => (
                <NumberInput
                  id='selling_price'
                  min={0}
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                  decimalPlaces={2}
                  onChange={(value: string | number) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
            {errors?.selling_price ? (
              <div className='mt-1 text-xs text-red-500'>{errors.selling_price.message}</div>
            ) : null}
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='cost'>Cost</Label>
            <FormController
              control={control}
              name='cost'
              render={({ field }) => (
                <NumberInput
                  id='cost'
                  min={0}
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                  decimalPlaces={2}
                  onChange={(value: string | number) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
            {errors?.cost ? <div className='mt-1 text-xs text-red-500'>{errors.cost.message}</div> : null}
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='shipping_fee'>Shipping Fee</Label>
            <FormController
              control={control}
              name='shipping_fee'
              render={({ field }) => (
                <NumberInput
                  id='shipping_fee'
                  min={0}
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                  decimalPlaces={2}
                  onChange={(value: string | number) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
            {errors?.shipping_fee ? (
              <div className='mt-1 text-xs text-red-500'>{errors.shipping_fee.message}</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Section 3: Attributes */}
      <div className='flex flex-col gap-6 rounded-xl bg-gray-200 px-6 pb-8 pt-4'>
        <h2 className='text-lg-semibold'>Attributes</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='product_category'>Product Category</Label>
            <FormController
              control={control}
              name='product_category'
              render={({ field }) => (
                <Input
                  id='product_category'
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                />
              )}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='product_type'>Product Type</Label>
            <FormController
              control={control}
              name='product_type'
              render={({ field }) => (
                <Input
                  id='product_type'
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                />
              )}
            />
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='color'>Color</Label>
            <FormController
              control={control}
              name='color'
              render={({ field }) => (
                <Input
                  id='color'
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                />
              )}
            />
            {errors?.color ? <div className='mt-1 text-xs text-red-500'>{errors.color.message}</div> : null}
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='size'>Size</Label>
            <FormController
              control={control}
              name='size'
              render={({ field }) => (
                <Input
                  id='size'
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                />
              )}
            />
            {errors?.size ? <div className='mt-1 text-xs text-red-500'>{errors.size.message}</div> : null}
          </div>
        </div>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='weight'>Weight</Label>
          <FormController
            control={control}
            name='weight'
            render={({ field }) => (
              <NumberInput
                id='weight'
                min={0}
                {...field}
                className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                decimalPlaces={2}
                onChange={(value: string | number) => {
                  field.onChange(value);
                }}
              />
            )}
          />
          {errors?.weight ? <div className='mt-1 text-xs text-red-500'>{errors.weight.message}</div> : null}
        </div>
      </div>

      <div className='mt-2 flex justify-end gap-4'>
        <Button
          className='rounded-lg border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 shadow-none hover:border-gray-400 hover:bg-gray-100'
          disabled={isLoading || isSubmitting}
          type='button'
          variant='outline'
          onClick={onClear}
        >
          Cancel
        </Button>
        <Button
          className='rounded-lg border-blue-600 bg-blue-600 px-6 py-2 font-medium text-white shadow-none hover:border-blue-700 hover:bg-blue-700'
          disabled={isLoading || isSubmitting}
          type='submit'
          variant='outline'
        >
          {isLoading || isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
