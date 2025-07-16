'use client';

import React, { useEffect, useRef } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Plus } from 'lucide-react';
import { useFieldArray, useForm, useFormState } from 'react-hook-form';
import * as yup from 'yup';

import { FormController } from '@/components/ui';

import DatePicker from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCampaignRequest } from '@/hooks/request/useCampaignRequest';
import dayjs from '@/lib/dayjs';

import CampaignProductList from './campaign-product-list';

const availableProducts = [
  { id: 'orange', name: 'Orange' },
  { id: 'watermelon', name: 'Watermelon' },
  { id: 'banana', name: 'Banana' },
];

const schema = yup.object({
  name: yup.string().required('Campaign name is required'),
  startAt: yup.string().required('Start time is required'),
  endAt: yup.string().required('End time is required'),
  products: yup
    .array()
    .of(
      yup.object({
        productId: yup.string().required('Product is required'),
        name: yup.string().required('Name is required'),
        keyword: yup.string().required('Keyword is required'),
        quantity: yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
      })
    )
    .min(1, 'At least one product is required')
    .required('Products are required'),
});

export type FormValues = yup.InferType<typeof schema>;

const defaultValues: FormValues = {
  name: '',
  startAt: '',
  endAt: '',
  products: [],
};

const CampaignForm = () => {
  const { handleRequest, isLoading } = useCampaignRequest();
  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues,
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  });
  const { errors } = useFormState({ control });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  const selectedProductIds = fields.map((f) => f.productId);
  const products = watch('products');
  const productRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (fields.length === 0) {
      append({ productId: '', name: '', keyword: '', quantity: 1 });
    }
  }, [fields.length, append]);

  useEffect(() => {
    if (fields.length > 0) {
      const last = products?.[fields.length - 1];
      if (last?.productId && last?.keyword && last?.quantity) {
        append({ productId: '', name: '', keyword: '', quantity: 1 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, fields.length]);

  useEffect(() => {
    if (fields.length > 0) {
      const lastIdx = fields.length - 1;
      productRefs.current[lastIdx]?.focus();
    }
  }, [fields.length]);

  const onAddProductRow = () => {
    append({ productId: '', name: '', keyword: '', quantity: 1 });
  };

  const onProductChange = (idx: number, productId: string) => {
    const product = availableProducts.find((p) => p.id === productId);
    setValue(`products.${idx}.productId`, productId);
    setValue(`products.${idx}.name`, product ? product.name : '');
  };

  const onSubmit = async (data: FormValues) => {
    await handleRequest({
      data: {
        name: data.name,
        startAt: data.startAt,
        endAt: data.endAt,
        products: data.products,
      },
    });
    reset(defaultValues);
  };

  const onClear = () => {
    reset(defaultValues);
  };

  const fieldsWithControl = fields.map((f) => ({ ...f, control }));

  return (
    <form
      className='flex flex-col gap-8'
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='campaign-name'>Campaign Name</Label>
          <FormController
            control={control}
            name='name'
            render={({ field }) => (
              <Input
                ref={field.ref}
                id='campaign-name'
                name={field.name}
                value={typeof field.value === 'string' ? field.value : ''}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Label>Date Range</Label>
          <div>
            <FormController
              disableError
              control={control}
              name='startAt'
              render={({ field: { value, onChange } }) => (
                <FormController
                  disableError
                  control={control}
                  name='endAt'
                  render={({ field: { value: endValue, onChange: onEndChange } }) => (
                    <DatePicker
                      defaultEndDate={typeof endValue === 'string' && endValue ? dayjs(endValue) : undefined}
                      defaultStartDate={typeof value === 'string' && value ? dayjs(value) : undefined}
                      onChange={(start, end) => {
                        onChange(start ? start.toISOString() : '');
                        onEndChange(end ? end.toISOString() : '');
                      }}
                    />
                  )}
                />
              )}
            />
            {errors.startAt || errors.endAt ? (
              <div className='mt-1 text-xs text-red-500'>
                {errors.startAt?.message ?? errors.endAt?.message}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <CampaignProductList
        fields={fieldsWithControl}
        isLoading={isLoading}
        productRefs={productRefs}
        selectedProductIds={selectedProductIds}
        onProductChange={onProductChange}
        onRemoveProduct={remove}
      />
      <Button
        className='w-fit'
        disabled={isLoading}
        type='button'
        variant='outline'
        onClick={onAddProductRow}
      >
        <Plus className='mr-2 size-4' /> Add Product
      </Button>
      <div className='flex justify-end gap-2'>
        <Button
          disabled={isLoading}
          type='button'
          variant='softgray'
          onClick={onClear}
        >
          Clear
        </Button>
        <Button
          disabled={isLoading}
          type='submit'
          variant='softgray'
        >
          {isLoading ? 'Saving...' : 'Save Campaign'}
        </Button>
      </div>
    </form>
  );
};

export default CampaignForm;
