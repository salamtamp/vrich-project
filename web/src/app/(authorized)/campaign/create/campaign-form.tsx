'use client';

import React, { useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { yupResolver } from '@hookform/resolvers/yup';
import { Plus } from 'lucide-react';
import type { Resolver } from 'react-hook-form';
import { useFieldArray, useForm, useFormState } from 'react-hook-form';
import * as yup from 'yup';

import { FormController } from '@/components/ui';

import DatePicker from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { API } from '@/constants/api.constant';
import { useLoading } from '@/contexts';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import dayjs from '@/lib/dayjs';
import type { CampaignChannel, CampaignResponse, CampaignStatus } from '@/types/api';
import type { CampaignsProduct } from '@/types/api/campaigns_products';
import type { Product } from '@/types/api/product';

import CampaignProductList from './campaign-product-list';
import type { CampaignFormValues } from './campaign-types';

const schema = yup.object({
  name: yup.string().required('Campaign name is required'),
  description: yup.string().optional(),
  status: yup
    .string()
    .oneOf(['active', 'inactive'] as const)
    .required('Status is required'),
  startDate: yup.string().required('Start time is required'),
  endDate: yup.string().required('End time is required'),
  channels: yup
    .array()
    .of(yup.string().oneOf(['facebook_comment', 'facebook_inbox'] as const))
    .min(1, 'At least one channel is required')
    .required('Channels are required'),
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

const defaultValues: CampaignFormValues = {
  name: '',
  description: '',
  status: 'inactive' as CampaignStatus,
  startDate: '',
  endDate: '',
  channels: [],
  products: [],
};

const CampaignForm = () => {
  const router = useRouter();
  const { openLoading, closeLoading } = useLoading();
  const { handleRequest: createCampaign, isLoading: isCampaignLoading } = useRequest<CampaignResponse>({
    request: {
      url: API.CAMPAIGN,
      method: 'POST',
    },
  });

  const { data: productData, isLoading: isProductsLoading } = usePaginatedRequest<{ docs: Product[] }>({
    url: API.PRODUCTS,
    order: 'desc',
    orderBy: 'created_at',
  });
  const productsList = productData?.docs ?? [];

  const { handleRequest: createCampaignProduct } = useRequest<CampaignsProduct>({
    request: {
      url: API.CAMPAIGNS_PRODUCTS,
      method: 'POST',
    },
  });

  const { control, handleSubmit, reset, setValue, watch } = useForm<CampaignFormValues>({
    defaultValues,
    resolver: yupResolver(schema) as Resolver<CampaignFormValues>,
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

  const onAddProductRow = () => {
    append({ productId: '', name: '', keyword: '', quantity: 1 });
  };

  // Update onProductChange to use real products
  const onProductChange = (idx: number, productId: string) => {
    const product = productsList?.find?.((p) => p.id === productId);
    setValue(`products.${idx}.productId`, productId);
    setValue(`products.${idx}.name`, product ? product.name : '');
  };

  // Update onSubmit to create products if needed, then campaign, then campaign-product links
  const onSubmit = async (data: CampaignFormValues) => {
    openLoading();
    try {
      // 1. Ensure all products exist
      const productIds = data.products.map((prod) => prod.productId);
      // 2. Create campaign
      const campaignRes = await createCampaign({
        data: {
          name: data.name,
          description: data.description ?? undefined,
          status: data.status,
          start_date: data.startDate,
          end_date: data.endDate,
          channels: data.channels,
        },
      });
      // 3. Link products to campaign (call campaign-product API)
      if (campaignRes?.id) {
        await Promise.all(
          data.products?.map((prod, i) =>
            createCampaignProduct({
              data: {
                campaign_id: campaignRes.id,
                product_id: productIds[i],
                keyword: prod.keyword,
                quantity: prod.quantity,
                status: data.status,
              },
            })
          ) ?? []
        );
      }
      reset(defaultValues);
      router.push('/campaign');
    } finally {
      closeLoading();
    }
  };

  const onClear = () => {
    reset(defaultValues);
  };

  const fieldsWithControl = fields.map((f) => ({ ...f, control }));

  return (
    <>
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
            <Label htmlFor='campaign-description'>Description</Label>
            <FormController
              control={control}
              name='description'
              render={({ field }) => (
                <Textarea
                  ref={field.ref}
                  id='campaign-description'
                  name={field.name}
                  placeholder='Enter campaign description...'
                  value={typeof field.value === 'string' ? field.value : ''}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='campaign-status'>Status</Label>
            <FormController
              control={control}
              name='status'
              render={({ field }) => (
                <Select
                  value={typeof field.value === 'string' ? field.value : ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id='campaign-status'>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='campaign-channels'>Channels</Label>
            <FormController
              control={control}
              name='channels'
              render={({ field }) => (
                <Select
                  value=''
                  onValueChange={(value) => {
                    const currentChannels = (
                      Array.isArray(field.value) ? field.value : []
                    ) as CampaignChannel[];
                    if (value && !currentChannels.includes(value as CampaignChannel)) {
                      field.onChange([...currentChannels, value as CampaignChannel]);
                    }
                  }}
                >
                  <SelectTrigger id='campaign-channels'>
                    <SelectValue placeholder='Select channels' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='facebook_comment'>Facebook Comment</SelectItem>
                    <SelectItem value='facebook_inbox'>Facebook Inbox</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {Array.isArray(watch('channels')) && watch('channels').length > 0 && (
              <div className='mt-2 flex flex-wrap gap-2'>
                {watch('channels').map((channel, index) => (
                  <div
                    key={`channel-${channel}-${crypto.randomUUID()}`}
                    className='flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm'
                  >
                    <span>{channel === 'facebook_comment' ? 'Facebook Comment' : 'Facebook Inbox'}</span>
                    <button
                      className='ml-1 text-blue-600 hover:text-blue-800'
                      type='button'
                      onClick={() => {
                        const currentChannels = watch('channels');
                        setValue(
                          'channels',
                          currentChannels.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className='flex flex-col gap-1'>
            <Label>Date Range</Label>
            <div>
              <FormController
                disableError
                control={control}
                name='startDate'
                render={({ field: { value, onChange } }) => (
                  <FormController
                    disableError
                    control={control}
                    name='endDate'
                    render={({ field: { value: endValue, onChange: onEndChange } }) => (
                      <DatePicker
                        defaultStartDate={typeof value === 'string' && value ? dayjs(value) : undefined}
                        position='top'
                        defaultEndDate={
                          typeof endValue === 'string' && endValue ? dayjs(endValue) : undefined
                        }
                        onChange={(start, end) => {
                          onChange(start ? start.toISOString() : '');
                          onEndChange(end ? end.toISOString() : '');
                        }}
                      />
                    )}
                  />
                )}
              />
              {errors?.startDate || errors?.endDate ? (
                <div className='mt-1 text-xs text-red-500'>
                  {errors?.startDate?.message ?? errors?.endDate?.message}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <CampaignProductList
          availableProducts={productsList}
          fields={fieldsWithControl}
          isLoading={isCampaignLoading || isProductsLoading}
          productRefs={productRefs}
          products={products}
          selectedProductIds={selectedProductIds}
          setValue={setValue}
          onProductChange={onProductChange}
          onRemoveProduct={remove}
        />
        <Button
          className='w-fit'
          disabled={isCampaignLoading}
          type='button'
          variant='outline'
          onClick={onAddProductRow}
        >
          <Plus className='mr-2 size-4' /> Add Product
        </Button>
        <div className='flex justify-end gap-2'>
          <Button
            disabled={isCampaignLoading}
            type='button'
            variant='softgray'
            onClick={onClear}
          >
            Clear
          </Button>
          <Button
            disabled={isCampaignLoading}
            type='submit'
            variant='softgray'
          >
            {isCampaignLoading ? 'Saving...' : 'Save Campaign'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default CampaignForm;
