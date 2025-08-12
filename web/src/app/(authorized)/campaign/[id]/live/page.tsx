'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useParams } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API } from '@/constants/api.constant';
import useRequest from '@/hooks/request/useRequest';
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
        <CardHeader className={styles.loadingHeader}>
          <div className={styles.loadingHeaderLeft}>
            <div className={styles.loadingHeaderLeftSkeleton1} />
            <div className={styles.loadingHeaderLeftSkeleton2} />
          </div>
          <div className={styles.loadingHeaderRight}>
            <div className={styles.loadingHeaderRightSkeleton1} />
            <div className={styles.loadingHeaderRightSkeleton2} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.kpiGrid}>
            {skeletons.map((id) => (
              <div
                key={id}
                className={styles.kpiSkeleton}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!campaign) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundContent}>
          <div className={styles.notFoundText}>Campaign not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            className={styles.backButton}
            size='sm'
            variant='outline'
            onClick={handleGoBack}
          >
            <ArrowLeft className={styles.backIcon} />
            Back
          </Button>
          <CardTitle className={styles.title}>{campaignData?.name}</CardTitle>
        </div>
      </div>

      <div className={styles.mainContent}>
        <KpiGrid className={styles.kpiGrid} />
        <div className={styles.sectionsGrid}>
          <ProductTable
            products={products}
            search={search}
            onSearchChange={setSearch}
          />
          <LiveMonitor />
        </div>
      </div>
    </div>
  );
};

export default CampaignLivePage;
