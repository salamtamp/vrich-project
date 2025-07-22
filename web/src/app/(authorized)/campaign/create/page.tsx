'use client';

import React from 'react';

import { FormPageWrapper } from '@/components/FormPageWrapper';

import CampaignForm from './campaign-form';

const CreateCampaignPage = () => {
  return (
    <FormPageWrapper title='Create Campaign'>
      <CampaignForm mode='create' />
    </FormPageWrapper>
  );
};

export default CreateCampaignPage;
