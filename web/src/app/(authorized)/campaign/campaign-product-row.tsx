import React from 'react';

import { Trash2 } from 'lucide-react';
import type { Control } from 'react-hook-form';

import { FormController } from '@/components/ui';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { FormValues } from './campaign-form';

const CampaignProductRow = ({
  idx,
  control,
  selectedProductIds,
  availableProducts,
  onProductChange,
  onRemoveProduct,
  productRefs,
  isLoading,
}: {
  idx: number;
  control: Control<FormValues>;
  selectedProductIds: string[];
  availableProducts: { id: string; name: string }[];
  onProductChange: (idx: number, productId: string) => void;
  onRemoveProduct: (idx: number) => void;
  productRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  isLoading: boolean;
}) => (
  <div className='flex flex-col gap-1'>
    <div className='flex items-start gap-2'>
      <FormController
        control={control}
        name={`products.${idx}.productId`}
        render={({ field }) => (
          <div className='flex flex-col'>
            <ShadcnSelect
              value={typeof field.value === 'string' ? field.value : ''}
              onValueChange={(v) => {
                field.onChange(v);
                onProductChange(idx, v);
              }}
            >
              <SelectTrigger className='w-[180px]'>
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
            </ShadcnSelect>
          </div>
        )}
      />
      <FormController
        control={control}
        name={`products.${idx}.keyword`}
        render={({ field }) => (
          <div className='flex flex-col'>
            <Input
              ref={(el) => {
                productRefs.current[idx] = el;
                if (typeof field.ref === 'function') {
                  field.ref(el);
                } else if (field.ref) {
                  (field.ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
                }
              }}
              name={field.name}
              placeholder='Keyword'
              value={typeof field.value === 'string' ? field.value : ''}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
          </div>
        )}
      />
      <FormController
        control={control}
        name={`products.${idx}.quantity`}
        render={({ field }) => (
          <div className='flex flex-col'>
            <Input
              ref={field.ref}
              min={1}
              name={field.name}
              type='number'
              value={typeof field.value === 'number' || typeof field.value === 'string' ? field.value : 1}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
          </div>
        )}
      />
      <Button
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
    </div>
  </div>
);

export default CampaignProductRow;
