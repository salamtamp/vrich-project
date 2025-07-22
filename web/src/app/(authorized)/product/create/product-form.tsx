import React, { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFormState } from 'react-hook-form';
import * as yup from 'yup';

import { FormController } from '@/components/ui';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { API } from '@/constants/api.constant';
import { useLoading } from '@/contexts';
import useRequest from '@/hooks/request/useRequest';
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
  quantity: yup.number().min(0, 'Quantity must be at least 0').required('Quantity is required'),
  unit: yup.string().required('Unit is required'),
  full_price: yup.number().min(0, 'Full price must be at least 0').required('Full price is required'),
  selling_price: yup
    .number()
    .min(0, 'Selling price must be at least 0')
    .required('Selling price is required'),
  cost: yup.number().min(0, 'Cost must be at least 0').required('Cost is required'),
  shipping_fee: yup.number().min(0, 'Shipping fee must be at least 0').required('Shipping fee is required'),
  note: yup.string().optional().default(''),
  keyword: yup.string().required('Keyword is required'),
  product_category: yup.string().required('Product category is required'),
  product_type: yup.string().required('Product type is required'),
  color: yup.string().optional().default(''),
  size: yup.string().optional().default(''),
  weight: yup.number().min(0, 'Weight must be at least 0').required('Weight is required'),
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
    resolver: yupResolver(schema),
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
      reset(defaultValues);
      router.push('/product');
    } finally {
      setIsSubmitting(false);
      closeLoading();
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
            {errors?.code ? <div className='mt-1 text-xs text-red-500'>{errors.code.message}</div> : null}
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
            {errors?.name ? <div className='mt-1 text-xs text-red-500'>{errors.name.message}</div> : null}
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
          {errors?.keyword ? <div className='mt-1 text-xs text-red-500'>{errors.keyword.message}</div> : null}
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
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='flex flex-col gap-1'>
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
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
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
            {errors?.unit ? <div className='mt-1 text-xs text-red-500'>{errors.unit.message}</div> : null}
          </div>
          <div className='flex flex-col gap-1'>
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
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                />
              )}
            />
            {errors?.weight ? <div className='mt-1 text-xs text-red-500'>{errors.weight.message}</div> : null}
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='flex flex-col gap-1'>
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
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
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
                <Input
                  id='selling_price'
                  min='0'
                  step='0.01'
                  type='number'
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
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
                <Input
                  id='cost'
                  min='0'
                  step='0.01'
                  type='number'
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
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
                <Input
                  id='shipping_fee'
                  min='0'
                  step='0.01'
                  type='number'
                  {...field}
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
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
            {errors?.product_category ? (
              <div className='mt-1 text-xs text-red-500'>{errors.product_category.message}</div>
            ) : null}
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
            {errors?.product_type ? (
              <div className='mt-1 text-xs text-red-500'>{errors.product_type.message}</div>
            ) : null}
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
              <Input
                id='weight'
                min='0'
                step='0.01'
                type='number'
                {...field}
                className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
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
          Clear
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
