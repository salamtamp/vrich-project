'use client';

import React, { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { yupResolver } from '@hookform/resolvers/yup';
import { Plus, Trash2, X } from 'lucide-react';
import { User } from 'lucide-react';
import type { Resolver } from 'react-hook-form';
import { useFieldArray, useForm, useFormState } from 'react-hook-form';
import * as yup from 'yup';

import { FormController } from '@/components/ui';

import DatePicker from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { API } from '@/constants/api.constant';
import { useLoading } from '@/contexts';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import { ImageWithFallback } from '@/hooks/useImageFallback';
import dayjs from '@/lib/dayjs';
import { createQuantitySchema } from '@/lib/yup-utils';
import type { CampaignChannel, CampaignResponse, CampaignStatus } from '@/types/api';
import type { FacebookPostResponse } from '@/types/api/facebook-post';
import type { Product } from '@/types/api/product';

import CampaignProductList from './campaign-product-list';
import type { CampaignFormValues } from './campaign-types';
import PostSelectModal from './post-select-modal';

const schema = yup.object({
  name: yup.string().required('Campaign name is required'),
  description: yup.string().optional(),
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
        quantity: createQuantitySchema(1),
        status: yup.string().oneOf(['active', 'inactive']).optional(),
      })
    )
    .min(1, 'At least one product is required')
    .required('Products are required'),
  postId: yup.string().when('channels', {
    is: (channels: string[]) => Array.isArray(channels) && channels.includes('facebook_comment'),
    then: (schema) => schema.required('Facebook post is required'),
    otherwise: (schema) => schema.optional(),
  }),
});

const defaultValues: CampaignFormValues = {
  name: '',
  description: '',
  status: 'inactive' as CampaignStatus,
  startDate: '',
  endDate: '',
  channels: [],
  postId: '',
  products: [],
};

type CampaignFormProps =
  | { mode: 'create'; initialValues?: undefined; campaignId?: undefined; initialPost?: undefined }
  | {
      mode: 'edit';
      initialValues: CampaignFormValues | undefined;
      campaignId: string;
      initialPost?: FacebookPostResponse | null;
    };

const CampaignForm = ({ mode, initialValues, campaignId, initialPost }: CampaignFormProps) => {
  const router = useRouter();
  const { openLoading, closeLoading } = useLoading();

  const { handleRequest: requestCampaignWithProducts, isLoading: isCampaignLoading } =
    useRequest<CampaignResponse>({
      request: {
        url: mode === 'edit' ? API.CAMPAIGN_WITH_PRODUCTS_PUT(campaignId) : API.CAMPAIGN_WITH_PRODUCTS_POST,
        method: mode === 'edit' ? 'PUT' : 'POST',
      },
    });

  const { data: productData, isLoading: isProductsLoading } = usePaginatedRequest<{ docs: Product[] }>({
    url: API.PRODUCTS,
    order: 'desc',
    orderBy: 'created_at',
    defaultStartDate: dayjs().subtract(50, 'years'),
  });

  const productsList = productData?.docs ?? [];

  const { handleRequest: fetchPost } = useRequest<FacebookPostResponse>({
    request: { url: API.POST, method: 'GET' },
  });

  const { control, handleSubmit, reset, setValue, watch } = useForm<CampaignFormValues>({
    defaultValues: mode === 'edit' && initialValues ? { ...defaultValues, ...initialValues } : defaultValues,
    resolver: yupResolver(schema) as Resolver<CampaignFormValues>,
    mode: 'onSubmit',
  });

  const postId = watch('postId');

  const { errors } = useFormState({ control });

  const channels = watch('channels');

  const { fields, append, remove } = useFieldArray({ control, name: 'products' });

  const selectedProductIds = fields.map((f) => f.productId);
  const products = watch('products');
  const productRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { open, close } = useModalContext();

  const [selectedPost, setSelectedPost] = useState<FacebookPostResponse | null>(initialPost ?? null);

  useEffect(() => {
    if (initialPost) {
      setSelectedPost(initialPost);
      setValue('postId', initialPost.id, { shouldValidate: true });
      return;
    }
    // When editing, if initialValues.postId exists, fetch the post by id
    const fetchSelectedPost = async () => {
      if (initialValues?.postId) {
        const post = await fetchPost({ patchId: initialValues.postId });
        if (post) {
          setSelectedPost(post);
          setValue('postId', post.id, { shouldValidate: true });
        }
      }
    };
    void fetchSelectedPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPost, initialValues?.postId]);

  useEffect(() => {
    if (fields.length === 0) {
      append({ productId: '', name: '', keyword: '', quantity: 1, status: 'inactive' });
    }
  }, [fields.length, append]);

  const onAddProductRow = () => {
    append({ productId: '', name: '', keyword: '', quantity: 1, status: 'inactive' });
  };

  const onProductChange = (idx: number, productId: string) => {
    const product = productsList?.find?.((p) => p.id === productId);
    setValue(`products.${idx}.productId`, productId);
    setValue(`products.${idx}.name`, product ? product.name : '');
  };

  if (mode === 'edit' && !initialValues) {
    return (
      <div className='flex h-96 w-full items-center justify-center'>
        <Spinner />
      </div>
    );
  }

  const onSubmit = async (data: CampaignFormValues) => {
    openLoading();
    try {
      const payload = {
        name: data.name,
        description: data.description ?? undefined,
        status: mode === 'edit' ? data.status : 'inactive',
        start_date: data.startDate,
        end_date: data.endDate,
        channels: data.channels,
        post_id: data.channels.includes('facebook_comment') ? data.postId : undefined,
        products: data.products.map((prod) => ({
          product_id: prod.productId,
          keyword: prod.keyword,
          quantity: prod.quantity,
          status: prod.status ?? 'inactive',
        })),
      };
      await requestCampaignWithProducts({
        data: payload,
      });
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
    <form
      className='flex flex-col gap-4'
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
      <div className='flex flex-col gap-6 rounded-xl bg-gray-200 px-6 pb-8 pt-4'>
        <h2 className='text-lg-semibold'>Campaign Details</h2>

        {mode === 'edit' && (
          <div className='flex items-center gap-4'>
            <FormController
              control={control}
              name='status'
              render={({ field }) => (
                <Switch
                  checked={field.value === 'active'}
                  id='campaign-status'
                  onCheckedChange={(checked) => {
                    field.onChange(checked ? 'active' : 'inactive');
                  }}
                />
              )}
            />
            <span>{watch('status') === 'active' ? 'Active' : 'Inactive'}</span>
          </div>
        )}

        <div className='flex min-w-[250px] flex-1 flex-col gap-1'>
          <Label
            className='mb-2'
            htmlFor='campaign-name'
          >
            Name
          </Label>
          <FormController
            control={control}
            name='name'
            render={({ field }) => (
              <Input
                ref={field.ref}
                className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
                id='campaign-name'
                name={field.name}
                value={typeof field.value === 'string' ? field.value : ''}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className='flex min-w-[220px] flex-1 flex-col gap-1'>
          <Label
            className='mb-2'
            htmlFor='campaign-channels'
          >
            Channels
          </Label>
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
                <SelectTrigger
                  className='w-fit rounded-lg border border-gray-300 bg-white'
                  id='campaign-channels'
                >
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
                  key={`channel-${channel}`}
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
                    <X className='size-4' />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='flex min-w-[260px] flex-1 flex-col gap-1'>
          <Label
            className='mb-2'
            htmlFor='date-range'
          >
            Date Range
          </Label>
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
                      className='w-fit rounded-lg border border-gray-300 bg-white'
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
            {errors?.startDate || errors?.endDate ? (
              <div className='mt-1 text-xs text-red-500'>
                {errors?.startDate?.message ?? errors?.endDate?.message}
              </div>
            ) : null}
          </div>
        </div>
        <div className='flex w-full flex-col gap-1'>
          <Label
            className='mb-2'
            htmlFor='campaign-description'
          >
            Description
          </Label>
          <FormController
            control={control}
            name='description'
            render={({ field }) => (
              <Textarea
                ref={field.ref}
                className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400'
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
      </div>

      {channels.includes('facebook_comment') && (
        <div className='flex flex-col gap-4 rounded-xl bg-gray-200 px-6 pb-8 pt-4'>
          <h2 className='text-lg-semibold text-blue-700'>Facebook Post</h2>

          {selectedPost ? (
            <div className='mb-2 flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4'>
              {selectedPost.profile?.profile_picture_url ? (
                <ImageWithFallback
                  alt={selectedPost.profile?.name || 'profile'}
                  className='size-12 rounded-full object-cover'
                  fallbackIcon={<User size={28} />}
                  size={48}
                  src={selectedPost.profile.profile_picture_url}
                />
              ) : null}
              <div className='flex-1'>
                <div className='font-semibold'>{selectedPost.profile?.name}</div>
                <div className='text-gray-700'>{selectedPost.message ?? 'ไม่มีข้อความ'}</div>
              </div>
              <Button
                className='hover:bg-red-50'
                size='icon'
                type='button'
                variant='ghost'
                onClick={() => {
                  setValue('postId', '', { shouldValidate: true });
                  setSelectedPost(null);
                }}
              >
                <Trash2 className='size-4 text-red-500' />
              </Button>
            </div>
          ) : null}

          <Button
            className='w-fit !rounded-lg border border-gray-300 px-4 pt-2 text-base font-semibold hover:bg-gray-300'
            type='button'
            variant='outline'
            onClick={() => {
              open({
                content: (
                  <PostSelectModal
                    control={control}
                    defaultStartDate={dayjs().subtract(50, 'years')}
                    fieldName='postId'
                    setValue={setValue}
                    value={postId}
                    onClose={close}
                    onSelect={(post) => {
                      setValue('postId', post.id, { shouldValidate: true });
                      setSelectedPost(post);
                      close();
                    }}
                  />
                ),
              });
            }}
          >
            {selectedPost ? 'Select New Facebook Post' : 'Select Facebook Post'}
          </Button>

          {errors?.postId ? <div className='mt-1 text-xs text-red-500'>{errors?.postId.message}</div> : null}
        </div>
      )}

      <div className='flex flex-col gap-4 rounded-xl bg-gray-200 px-6 pb-8 pt-4'>
        <h2 className='text-lg-semibold text-blue-700'>Products</h2>

        <CampaignProductList
          availableProducts={productsList}
          fields={fieldsWithControl}
          isLoading={isCampaignLoading || isProductsLoading}
          mode={mode}
          productRefs={productRefs}
          products={products}
          selectedProductIds={selectedProductIds}
          setValue={setValue}
          onProductChange={onProductChange}
          onRemoveProduct={remove}
        />
        <Button
          className='w-fit px-6 py-2 text-base font-semibold'
          disabled={isCampaignLoading}
          type='button'
          variant='outline'
          onClick={onAddProductRow}
        >
          <Plus className='mr-1 size-4' /> Add Product
        </Button>
      </div>

      <div className='mt-2 flex justify-end gap-4'>
        <Button
          className='rounded-lg border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 shadow-none hover:border-gray-400 hover:bg-gray-100'
          disabled={isCampaignLoading}
          type='button'
          variant='outline'
          onClick={onClear}
        >
          Cancel
        </Button>
        <Button
          className='rounded-lg border-blue-600 bg-blue-600 px-6 py-2 font-medium text-white shadow-none hover:border-blue-700 hover:bg-blue-700'
          disabled={isCampaignLoading}
          type='submit'
          variant='outline'
        >
          {isCampaignLoading ? 'Saving...' : 'Save Campaign'}
        </Button>
      </div>
    </form>
  );
};

export default CampaignForm;
