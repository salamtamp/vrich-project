'use client';

import React from 'react';

import { useParams } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import CampaignEditForm from './campaign-edit-form';

const EditCampaignPage = () => {
  const params = useParams();
  const campaignId = params.id as string;

  return (
    <div className='flex min-h-screen flex-col gap-6 bg-base-gray-light p-6'>
      <Card className='mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-sm'>
        <CardHeader>
          <CardTitle className='text-xl font-semibold text-blue-700'>Edit Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignEditForm campaignId={campaignId} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCampaignPage;
