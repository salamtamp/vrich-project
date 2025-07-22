'use client';

import React, { useMemo } from 'react';

import { useRouter } from 'next/navigation';

import { Edit, Trash2 } from 'lucide-react';

import ContentPagination from '@/components/content/pagination';
import type { TableColumn } from '@/components/table';
import Table from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import dayjs from '@/lib/dayjs';
import type { PaginationResponse } from '@/types/api/api-response';
import type { Campaign } from '@/types/api/campaign';

type TableRowType = Campaign;

const CampaignPage = () => {
  const router = useRouter();
  const {
    data: campaignsData,
    isLoading,
    handleRequest: handlePaginatedRequest,
  } = usePaginatedRequest<PaginationResponse<Campaign>>({
    url: API.CAMPAIGN,
    orderBy: 'created_at',
    order: 'desc',
  });

  const { handleRequest: handleDeleteRequest, isLoading: isDeleting } = useRequest<Campaign>({
    request: {
      url: API.CAMPAIGN,
      method: 'DELETE',
    },
  });

  const campaigns = useMemo(() => campaignsData?.docs ?? [], [campaignsData?.docs]);
  const total = campaignsData?.total ?? 0;

  const { open, close } = useModalContext();

  const handleGoToCreateCampaign = () => {
    router.push('/campaign/create');
  };

  const handleDeleteCampaign = (campaignId: string) => {
    open({
      content: (
        <div className='flex flex-col items-center justify-center gap-4 p-4'>
          <div className='text-lg font-semibold'>Are you sure you want to delete this campaign?</div>
          <div className='mt-2 flex gap-4'>
            <Button
              className='bg-red-600 text-white hover:bg-red-700'
              onClick={() => {
                void (async () => {
                  await handleDeleteRequest({ patchId: campaignId });
                  await handlePaginatedRequest();
                  close(); // Close modal
                })();
              }}
            >
              Delete
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                close();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ),
    });
  };

  const columns: TableColumn<TableRowType>[] = [
    { key: 'name', label: 'Campaign', bold: true },
    {
      key: 'channels',
      label: 'Channels',
      render: (row) => (
        <span>
          {row.channels && row.channels.length > 0
            ? row.channels.map((ch, idx) => {
                const label = ch.startsWith('facebook_') ? ch.replace('facebook_', '') : ch;
                return (
                  <React.Fragment key={ch}>
                    {label}
                    {idx < row.channels.length - 1 && <br />}
                  </React.Fragment>
                );
              })
            : '-'}
        </span>
      ),
    },
    {
      key: 'keywords',
      label: 'Keywords',
      render: (row) => (
        <span>
          {row.campaigns_products && row.campaigns_products.length > 0
            ? row.campaigns_products
                .map((cp) => cp.keyword)
                .filter(Boolean)
                .join(', ')
            : '-'}
        </span>
      ),
    },
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
      key: 'start_date',
      label: 'Start Date',
      render: (row) => dayjs(row.start_date).format('YYYY-MM-DD'),
      align: 'center',
    },
    {
      key: 'end_date',
      label: 'End Date',
      render: (row) => dayjs(row.end_date).format('YYYY-MM-DD'),
      align: 'center',
    },
    {
      key: 'created_at',
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
            onClick={() => (window.location.href = `/campaign/edit/${String(row.id)}`)}
          >
            <Edit className='size-4' />
          </Button>
          <Button
            className='text-red-600 hover:text-red-700'
            size='sm'
            variant='outline'
            onClick={() => {
              handleDeleteCampaign(row.id);
            }}
          >
            <Trash2 className='size-4' />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className='flex h-fit max-h-full min-h-[520px] flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 px-6 py-4 shadow-sm'>
      <div className='flex flex-row items-center justify-between p-0'>
        <CardTitle className='text-lg-semibold text-blue-700'>Campaigns</CardTitle>
        <Button
          className='rounded-lg border-blue-100 bg-blue-50 px-4 py-2 font-medium text-blue-700 shadow-none hover:bg-blue-100 hover:text-blue-800'
          variant='outline'
          onClick={handleGoToCreateCampaign}
        >
          <span className='text-base'>+ Create Campaign</span>
        </Button>
      </div>
      <div className='mt-4 flex h-full flex-1 flex-col gap-4 overflow-hidden'>
        <Table
          bodyRowProps={{ className: 'bg-white hover:bg-gray-50 ' }}
          columns={columns}
          data={campaigns}
          isLoading={isLoading || isDeleting}
        />
      </div>
      <ContentPagination
        className='mt-4'
        total={total}
      />
    </Card>
  );
};

export default CampaignPage;
