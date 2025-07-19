'use client';

import React, { useMemo } from 'react';

import ContentPagination from '@/components/content/pagination';
import type { TableColumn } from '@/components/table';
import Table from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API } from '@/constants/api.constant';
import { PaginationProvider } from '@/contexts';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import dayjs from '@/lib/dayjs';
import type { PaginationResponse } from '@/types/api/api-response';
import type { Campaign } from '@/types/api/campaign';

import CampaignForm from './(modal-create)/campaign-form';

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
      return row.start_at ? dayjs(row.start_at).format('YYYY-MM-DD') : '-';
    },
    align: 'center',
  },
  {
    key: 'endAt',
    label: 'End Date',
    render: (row) => (row.end_at ? dayjs(row.end_at).format('YYYY-MM-DD') : '-'),
    align: 'center',
  },
  {
    key: 'createdAt',
    label: 'Created',
    render: (row) => dayjs(row.created_at).format('YYYY-MM-DD HH:mm'),
    align: 'center',
  },
];

const CampaignPage = () => {
  const { open } = useModalContext();
  const { data, isLoading } = usePaginatedRequest<PaginationResponse<Campaign>>({
    url: API.CAMPAIGN,
    orderBy: 'createdAt',
  });
  const campaigns = useMemo(() => data?.docs ?? [], [data?.docs]);
  const total = data?.total ?? 0;

  const handleOpenCreateCampaign = () => {
    open({
      content: (
        <Card className='mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-sm'>
          <CardHeader>
            <CardTitle className='text-xl font-semibold text-blue-700'>Create Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <CampaignForm />
          </CardContent>
        </Card>
      ),
    });
  };

  return (
    <PaginationProvider defaultValue={{ limit: 15 }}>
      <div className='flex min-h-screen flex-col gap-6 bg-base-gray-light p-6'>
        <Card className='w-full rounded-2xl border border-gray-200 bg-white shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-2xl font-bold text-blue-700'>Campaigns</CardTitle>
            <Button
              variant='softgray'
              onClick={handleOpenCreateCampaign}
            >
              Create Campaign
            </Button>
          </CardHeader>
          <CardContent className='p-0'>
            <Table
              bodyRowProps={{ className: 'bg-white hover:bg-gray-50 transition-colors' }}
              columns={columns}
              data={campaigns}
              isLoading={isLoading}
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
