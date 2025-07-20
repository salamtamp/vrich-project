'use client';

import React from 'react';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import CampaignForm from './campaign-form';

const CreateCampaignPage = () => {
  return (
    <div className='flex max-h-full flex-1 flex-col gap-6 overflow-scroll bg-base-gray-light p-6'>
      <CardHeader>
        <CardTitle className='text-xl font-semibold text-blue-700'>Create Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <CampaignForm />
      </CardContent>
    </div>
  );
};

export default CreateCampaignPage;
