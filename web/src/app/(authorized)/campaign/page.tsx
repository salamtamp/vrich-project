'use client';

import React, { useMemo } from 'react';

import { useRouter } from 'next/navigation';

import { Edit, Trash2 } from 'lucide-react';

import ContentPagination from '@/components/content/pagination';
import type { TableColumn } from '@/components/table';
import Table from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API } from '@/constants/api.constant';
import { PaginationProvider } from '@/contexts';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import dayjs from '@/lib/dayjs';
import type { PaginationResponse } from '@/types/api/api-response';
import type { Campaign } from '@/types/api/campaign';

const CampaignPage = () => {
  const router = useRouter();
  const {
    data,
    isLoading,
    handleRequest: handlePaginatedRequest,
  } = usePaginatedRequest<PaginationResponse<Campaign>>({
    url: API.CAMPAIGN,
    orderBy: 'createdAt',
  });

  const { handleRequest: handleDeleteRequest, isLoading: isDeleting } = useRequest<Campaign>({
    request: {
      url: API.CAMPAIGN,
      method: 'DELETE',
    },
  });

  const campaigns = useMemo(() => data?.docs ?? [], [data?.docs]);
  const total = data?.total ?? 0;

  const handleGoToCreateCampaign = () => {
    router.push('/campaign/create');
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await handleDeleteRequest({ patchId: campaignId });
        await handlePaginatedRequest();
      } catch (error) {
        console.error('Failed to delete campaign:', error);
      }
    }
  };

  const columns: TableColumn<Campaign>[] = [
    { key: 'name', label: 'Name', bold: true },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (row) => (
        <Badge
          variant={row.status === 'active' ? 'default' : 'secondary'}
          className={
            row.status === 'active'
              ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
              : 'border-gray-200 bg-gray-100 text-gray-500'
          }
        >
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'startAt',
      label: 'Start Date',
      render: (row) => {
        return row.start_date ? dayjs(row.start_date).format('YYYY-MM-DD') : '-';
      },
      align: 'center',
    },
    {
      key: 'endAt',
      label: 'End Date',
      render: (row) => (row.end_date ? dayjs(row.end_date).format('YYYY-MM-DD') : '-'),
      align: 'center',
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => dayjs(row.created_at).format('YYYY-MM-DD HH:mm'),
      align: 'center',
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (row) => (
        <div className='flex items-center justify-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => (window.location.href = `/campaign/edit/${row.id}`)}
          >
            <Edit className='size-4' />
          </Button>
          <Button
            className='text-red-600 hover:text-red-700'
            size='sm'
            variant='outline'
            onClick={() => {
              void handleDeleteCampaign(row.id);
            }}
          >
            <Trash2 className='size-4' />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PaginationProvider defaultValue={{ limit: 15 }}>
      <div className='flex min-h-screen flex-col gap-6 bg-base-gray-light p-6'>
        <Card className='w-full rounded-2xl border border-gray-200 bg-white shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-2xl font-bold text-blue-700'>Campaigns</CardTitle>
            <Button
              variant='softgray'
              onClick={handleGoToCreateCampaign}
            >
              Create Campaign
            </Button>
          </CardHeader>
          <CardContent className='p-0'>
            <Table
              bodyRowProps={{ className: 'bg-white hover:bg-gray-50 transition-colors' }}
              columns={columns}
              data={campaigns}
              isLoading={isLoading || isDeleting}
            />
            <ContentPagination
              className='mt-4'
              total={total}
            />
          </CardContent>
        </Card>
      </div>
    </PaginationProvider>
  );
};

export default CampaignPage;
