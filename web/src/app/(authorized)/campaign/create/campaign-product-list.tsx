import React from 'react';

import type { Control, FieldArrayWithId, UseFormSetValue } from 'react-hook-form';

import type { Product } from '@/types/api/product';

import CampaignProductRow from './campaign-product-row';
import type { CampaignFormValues } from './campaign-types';

const CampaignProductList = ({
  fields,
  selectedProductIds,
  onProductChange,
  onRemoveProduct,
  productRefs,
  isLoading,
  availableProducts,
  products,
  setValue,
}: {
  fields: (FieldArrayWithId<CampaignFormValues, 'products'> & { control: Control<CampaignFormValues> })[];
  selectedProductIds: string[];
  onProductChange: (idx: number, productId: string) => void;
  onRemoveProduct: (idx: number) => void;
  productRefs: React.RefObject<(HTMLInputElement | null)[]>;
  isLoading: boolean;
  availableProducts: Product[];
  products: CampaignFormValues['products'];
  setValue: UseFormSetValue<CampaignFormValues>;
}) => {
  return (
    <div>
      <h2 className='mb-2 text-lg font-semibold'>Products</h2>
      <div className='flex flex-col gap-2 rounded-lg border bg-gray-50 p-4'>
        {fields.length === 0 && <div className='italic text-gray-400'>No products added yet.</div>}
        {fields.map((field, idx) => (
          <CampaignProductRow
            key={`${field.id}-${crypto.randomUUID()}`}
            availableProducts={availableProducts}
            control={field.control}
            idx={idx}
            isLoading={isLoading}
            productRefs={productRefs}
            products={products}
            selectedProductIds={selectedProductIds}
            setValue={setValue}
            onProductChange={onProductChange}
            onRemoveProduct={onRemoveProduct}
          />
        ))}
      </div>
    </div>
  );
};

export default CampaignProductList;
