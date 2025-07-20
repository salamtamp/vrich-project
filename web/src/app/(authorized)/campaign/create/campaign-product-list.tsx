import React from 'react';

import type { Control, FieldArrayWithId } from 'react-hook-form';

import type { FormValues } from './campaign-form';
import CampaignProductRow from './campaign-product-row';

const CampaignProductList = ({
  fields,
  selectedProductIds,
  onProductChange,
  onRemoveProduct,
  productRefs,
  isLoading,
}: {
  fields: (FieldArrayWithId<FormValues, 'products'> & { control: Control<FormValues> })[];
  selectedProductIds: string[];
  onProductChange: (idx: number, productId: string) => void;
  onRemoveProduct: (idx: number) => void;
  productRefs: React.RefObject<(HTMLInputElement | null)[]>;
  isLoading: boolean;
}) => {
  const availableProducts = [
    { id: 'orange', name: 'Orange' },
    { id: 'watermelon', name: 'Watermelon' },
    { id: 'banana', name: 'Banana' },
  ];

  return (
    <div>
      <h2 className='mb-2 text-lg font-semibold'>Products</h2>
      <div className='flex flex-col gap-2 rounded-lg border bg-gray-50 p-4'>
        {fields.length === 0 && <div className='italic text-gray-400'>No products added yet.</div>}
        {fields.map((field, idx) => (
          <CampaignProductRow
            key={field.id}
            availableProducts={availableProducts}
            control={field.control}
            idx={idx}
            isLoading={isLoading}
            productRefs={productRefs}
            selectedProductIds={selectedProductIds}
            onProductChange={onProductChange}
            onRemoveProduct={onRemoveProduct}
          />
        ))}
      </div>
    </div>
  );
};

export default CampaignProductList;
