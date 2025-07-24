import React from 'react';

import { Trash2 } from 'lucide-react';
import type { Control, UseFormSetValue } from 'react-hook-form';

import { FormController } from '@/components/ui';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Product } from '@/types/api/product';

import type { CampaignFormValues } from './campaign-types';

const CampaignProductRow = ({
  idx,
  control,
  selectedProductIds,
  availableProducts,
  onProductChange,
  onRemoveProduct,
  productRefs,
  isLoading,
  products,
  setValue,
  mode,
}: {
  idx: number;
  control: Control<CampaignFormValues>;
  selectedProductIds: string[];
  availableProducts: Product[];
  onProductChange: (idx: number, productId: string) => void;
  onRemoveProduct: (idx: number) => void;
  productRefs: React.RefObject<(HTMLInputElement | null)[]>;
  isLoading: boolean;
  products: CampaignFormValues['products'];
  setValue: UseFormSetValue<CampaignFormValues>;
  mode: 'create' | 'edit'; // <-- add mode type
}) => {
  const selectedProduct = availableProducts.find((p) => p.id === products[idx]?.productId);

  React.useEffect(() => {
    if (selectedProduct && !products[idx]?.keyword) {
      setValue(`products.${idx}.keyword`, selectedProduct.keyword ?? '', { shouldValidate: true });
    }
  }, [selectedProduct, idx, setValue, products]);

  return (
    <div className='flex flex-col gap-2 rounded-lg border bg-white p-4 shadow-sm'>
      <div className='flex w-full items-center justify-between gap-4'>
        <div className='flex size-full flex-wrap items-start gap-4'>
          <div className='w-[220px]'>
            <FormController
              control={control}
              name={`products.${idx}.productId`}
              render={({ field }) => (
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='product-name'>Product</Label>
                  <Select
                    value={typeof field.value === 'string' ? field.value : ''}
                    onValueChange={(v) => {
                      field.onChange(v);
                      onProductChange(idx, v);
                    }}
                  >
                    <SelectTrigger
                      className='w-full'
                      id={`product-select-${idx}`}
                    >
                      <SelectValue placeholder='Select Product' />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((p) => (
                        <SelectItem
                          key={p.id}
                          disabled={selectedProductIds.includes(p.id) && p.id !== field.value}
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
          </div>
          <div className='min-w-[120px] flex-1'>
            <FormController
              control={control}
              name={`products.${idx}.keyword`}
              render={({ field }) => (
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='keyword'>Keyword</Label>
                  <Input
                    ref={(el) => {
                      productRefs.current[idx] = el;
                      if (typeof field.ref === 'function') {
                        field.ref(el);
                      } else if (field.ref) {
                        (field.ref as React.RefObject<HTMLInputElement | null>).current = el;
                      }
                    }}
                    id={`product-keyword-${idx}`}
                    name={field.name}
                    placeholder='Keyword'
                    value={typeof field.value === 'string' ? field.value : ''}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>
          <div className='w-[160px]'>
            <FormController
              control={control}
              name={`products.${idx}.quantity`}
              render={({ field }) => (
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='quantity'>Quantity</Label>
                  <Input
                    ref={field.ref}
                    id={`product-quantity-${idx}`}
                    max={selectedProduct?.quantity ?? undefined}
                    min={1}
                    name={field.name}
                    step='1'
                    type='number'
                    value={
                      typeof field.value === 'number' || typeof field.value === 'string' ? field.value : 1
                    }
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            {selectedProduct?.quantity ? (
              <span className='text-xs text-gray-400'>Max: {selectedProduct.quantity}</span>
            ) : null}
          </div>
          {mode === 'edit' && (
            <div className='flex w-[60px] flex-col items-center justify-center gap-2'>
              <Label htmlFor={`product-status-${idx}`}>Active</Label>
              <FormController
                control={control}
                name={`products.${idx}.status`}
                render={({ field }) => (
                  <Switch
                    checked={field.value === 'active'}
                    id={`product-status-${idx}`}
                    onCheckedChange={(checked) => {
                      field.onChange(checked ? 'active' : 'inactive');
                    }}
                  />
                )}
              />
            </div>
          )}
        </div>
        {!(
          products.length - 1 === idx &&
          !products[idx]?.productId &&
          !products[idx]?.keyword &&
          !products[idx]?.quantity
        ) && (
          <Button
            className='hover:bg-red-50'
            disabled={isLoading}
            size='icon'
            type='button'
            variant='ghost'
            onClick={() => {
              onRemoveProduct(idx);
            }}
          >
            <Trash2 className='size-4 text-red-500' />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CampaignProductRow;
