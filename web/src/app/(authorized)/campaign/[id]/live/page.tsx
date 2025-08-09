'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useParams } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import type { TextData } from '@/components/list-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API } from '@/constants/api.constant';
import useRequest from '@/hooks/request/useRequest';
import { dayjsUtil } from '@/lib/dayjs';
import type { Campaign } from '@/types/api/campaign';

import KpiGrid from './components/KpiGrid';
import LiveMonitor from './components/LiveMonitor';
import ProductTable from './components/ProductTable';

import styles from './page.module.scss';

const CampaignLivePage = () => {
  const params = useParams();
  const campaignId = params.id as string;

  const {
    data: campaignData,
    isLoading,
    handleRequest,
  } = useRequest<Campaign>({
    request: {
      url: `${API.CAMPAIGN}/${campaignId}`,
    },
  });

  const campaign = useMemo(() => campaignData, [campaignData]);

  const [search, setSearch] = useState('');

  const products = useMemo(() => campaign?.campaigns_products ?? [], [campaign?.campaigns_products]);

  const liveItems: TextData[] = useMemo(() => {
    const src = (campaign?.campaigns_products ?? []).slice(0, 8);
    return src.map((cp) => ({
      id: cp.product?.id ?? cp.id,
      text: cp.product?.name ?? '-',
      name: cp.product?.code,
      timeAgo: dayjsUtil(campaign?.created_at ?? new Date().toISOString()).fromNow(),
      dateString: dayjsUtil(campaign?.created_at ?? new Date().toISOString()).format('D MMM BBBB HH:mm'),
    }));
  }, [campaign?.campaigns_products, campaign?.created_at]);

  const handleGoBack = () => {
    window.history.back();
  };

  useEffect(() => {
    void handleRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    const skeletons = Array.from({ length: 10 }, () => crypto.randomUUID());
    return (
      <Card className={styles.container}>
        <CardHeader className='flex flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-20 animate-pulse rounded-md bg-gray-100' />
            <div className='h-6 w-48 animate-pulse rounded-md bg-gray-100' />
          </div>
          <div className='flex items-center gap-2'>
            <div className='h-8 w-28 animate-pulse rounded-md bg-gray-100' />
            <div className='h-8 w-36 animate-pulse rounded-md bg-gray-100' />
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.kpiGrid}>
            {skeletons.map((id) => (
              <div
                key={id}
                className='h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-50'
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!campaign) {
    return (
      <div className='flex h-full max-h-full min-h-[520px] flex-1 flex-col overflow-hidden border border-gray-100 px-6 py-4 shadow-sm'>
        <div className='flex h-full items-center justify-center'>
          <div className='text-lg'>Campaign not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className='flex flex-row items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Button
            className='flex items-center gap-2'
            size='sm'
            variant='outline'
            onClick={handleGoBack}
          >
            <ArrowLeft className='size-4' />
            Back
          </Button>
          <CardTitle className='truncate text-base md:text-lg'>{campaignData?.name}</CardTitle>
        </div>
      </div>

      <div className='flex flex-1 flex-col'>
        <KpiGrid className={styles.kpiGrid} />
        <div className={styles.sectionsGrid}>
          <ProductTable
            products={products}
            search={search}
            onSearchChange={setSearch}
          />
          <LiveMonitor items={liveItems} />
        </div>
      </div>
    </div>
  );
};

export default CampaignLivePage;
