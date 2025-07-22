'use client';

import React from 'react';

import { FormPageWrapper } from '@/components/FormPageWrapper';

// Reuse the FormPageWrapper from campaign/create/page.tsx
import ProductForm from './product-form';

const CreateProductPage = () => {
  return (
    <FormPageWrapper title='Create Product'>
      <ProductForm />
    </FormPageWrapper>
  );
};

export default CreateProductPage;
