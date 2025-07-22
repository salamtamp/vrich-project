'use client';

import React from 'react';

import { FormPageWrapper } from '@/components/FormPageWrapper';

import CampaignForm from './campaign-form';

const CreateCampaignPage = () => {
  return (
    <FormPageWrapper title='Create Campaign'>
      <CampaignForm />
    </FormPageWrapper>
  );
};

export default CreateCampaignPage;
