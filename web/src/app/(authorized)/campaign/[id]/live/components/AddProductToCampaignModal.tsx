'use client';

import React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { FormController, NumberInput } from '@/components/ui';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import type { Campaign } from '@/types/api';
import type { Product } from '@/types/api/product';

const schema = yup.object({
  productId: yup.string().required('Product is required'),
  keyword: yup.string().required('Keyword is required'),
  quantity: yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
});

type FormValues = {
  productId: string;
  keyword: string;
  quantity: number;
};

type AddProductToCampaignModalProps = {
  campaign: Campaign | null;
  onSuccess: () => void;
  onClose: () => void;
};

const AddProductToCampaignModal: React.FC<AddProductToCampaignModalProps> = ({
  campaign,
  onSuccess,
  onClose,
}) => {
  const { data: productData, isLoading: isProductsLoading } = usePaginatedRequest<{ docs: Product[] }>({
    url: API.PRODUCTS,
    disableLimit: true,
  });
  const productsList = productData?.docs ?? [];

  const { handleRequest: updateCampaign, isLoading: isUpdating } = useRequest<Campaign>({
    request: {
      url: API.CAMPAIGN_WITH_PRODUCTS_PUT(campaign?.id ?? ''),
      method: 'PUT',
    },
  });

  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      productId: '',
      keyword: '',
      quantity: 1,
    },
  });

  const selectedProductId = watch('productId');
  const selectedProduct = productsList.find((p) => p.id === selectedProductId);

  React.useEffect(() => {
    if (selectedProduct && !watch('keyword')) {
      setValue('keyword', selectedProduct.keyword ?? '');
    }
  }, [selectedProduct, setValue, watch]);

  const onSubmit = async (data: FormValues) => {
    if (!campaign) {
      return;
    }

    const existingProducts = (
      campaign.campaigns_products?.map((p) => ({
        product_id: p.product_id,
        keyword: p.keyword,
        quantity: p.quantity,
        status: p.status,
      })) ?? []
    ).filter((p) => p.product_id);

    const newProduct = {
      product_id: data.productId,
      keyword: data.keyword,
      quantity: data.quantity,
      status: 'active',
    };

    const payload = {
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      channels: campaign.channels,
      post_id: campaign.post_id,
      products: [...existingProducts, newProduct],
    };

    await updateCampaign({ data: payload });
    onSuccess();
    onClose();
  };

  return (
    <form
      className='p-4'
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
      <h2 className='mb-4 text-lg font-semibold'>Add Product to Campaign</h2>
      <div className='space-y-4'>
        <FormController
          control={control}
          name='productId'
          render={({ field }) => (
            <div>
              <Label>Product</Label>
              <Select
                value={String(field.value ?? '')}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a product' />
                </SelectTrigger>
                <SelectContent>
                  {productsList.map((p) => (
                    <SelectItem
                      key={p.id}
                      disabled={campaign?.campaigns_products?.some((cp) => cp.product_id === p.id)}
                      value={p.id}
                    >
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <FormController
          control={control}
          name='keyword'
          render={({ field }) => (
            <div>
              <Label>Keyword</Label>
              <Input {...field} />
            </div>
          )}
        />

        <FormController
          control={control}
          name='quantity'
          render={({ field: { onChange, onBlur, value, name, ref } }) => (
            <div>
              <Label>Quantity</Label>
              <NumberInput
                name={name}
                ref={ref}
                onBlur={onBlur}
                value={String(value)}
                allowDecimal={false}
                min={1}
                onChange={(val: string | number) => {
                  const num = Number(val);
                  onChange(Number.isNaN(num) ? 0 : num);
                }}
              />
            </div>
          )}
        />
      </div>
      <div className='mt-6 flex justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          disabled={isUpdating || isProductsLoading}
          type='submit'
        >
          {isUpdating ? 'Adding...' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default AddProductToCampaignModal;
