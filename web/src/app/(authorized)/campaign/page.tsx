'use client';

import React, { useMemo } from 'react';

import { useRouter } from 'next/navigation';

import { Eye, MonitorDot, Plus, Trash2 } from 'lucide-react';

import ContentPagination from '@/components/content/pagination';
import type { TableColumn } from '@/components/table';
import Table from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import dayjs from '@/lib/dayjs';
import { i18n } from '@/lib/language';
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
    defaultStartDate: dayjs().subtract(50, 'years'),
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
          <div className='text-lg font-semibold'>{i18n.campaign.deleteModal.title}</div>
          <div className='mt-2 flex gap-4'>
            <Button
              className='bg-red-600 text-white hover:bg-red-700'
              onClick={() => {
                void (async () => {
                  await handleDeleteRequest({ patchId: campaignId });
                  await handlePaginatedRequest();
                  close();
                })();
              }}
            >
              {i18n.campaign.deleteModal.delete}
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                close();
              }}
            >
              {i18n.campaign.deleteModal.cancel}
            </Button>
          </div>
        </div>
      ),
    });
  };

  const columns: TableColumn<TableRowType>[] = [
    {
      key: 'name',
      label: i18n.campaign.columns.campaign,
      bold: true,
      width: 200,
      render: (row) => {
        return <div className='line-clamp-2'>{row.name}</div>;
      },
    },
    {
      key: 'channels',
      label: i18n.campaign.columns.channels,
      width: 140,
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
            : i18n.campaign.noData}
        </span>
      ),
    },
    {
      key: 'keywords',
      label: i18n.campaign.columns.keywords,
      width: 120,
      render: (row) => (
        <span className='line-clamp-2'>
          {row.campaigns_products && row.campaigns_products.length > 0
            ? row.campaigns_products
                .map((cp) => cp.keyword)
                .filter(Boolean)
                .join(', ')
            : i18n.campaign.noData}
        </span>
      ),
    },
    {
      key: 'status',
      label: i18n.campaign.columns.status,
      align: 'center',
      width: 100,
      render: (row) => (
        <Badge
          variant={row.status === 'active' ? 'default' : 'secondary'}
          className={
            row.status === 'active'
              ? 'border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
              : 'border-gray-200 bg-gray-100 text-gray-500'
          }
        >
          {row.status === 'active' ? i18n.campaign.status.active : i18n.campaign.status.inactive}
        </Badge>
      ),
    },
    {
      key: 'start_date',
      label: i18n.campaign.columns.startDate,
      width: 120,
      render: (row) => dayjs(row.start_date).format('YYYY-MM-DD'),
      align: 'center',
    },
    {
      key: 'end_date',
      label: i18n.campaign.columns.endDate,
      width: 120,
      render: (row) => dayjs(row.end_date).format('YYYY-MM-DD'),
      align: 'center',
    },
    {
      key: 'actions',
      label: i18n.campaign.columns.actions,
      align: 'center',
      width: 120,
      render: (row) => (
        <div className='flex items-center justify-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              router.push(`/campaign/${String(row.id)}/live`);
            }}
          >
            <MonitorDot className='size-4' />
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              router.push(`/campaign/manage/${String(row.id)}`);
            }}
          >
            <Eye className='size-4' />
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
    <div className='flex h-full max-h-full min-h-[520px] flex-1 flex-col overflow-hidden border border-gray-100 px-6 py-4 shadow-sm'>
      <div className='flex flex-row items-center justify-between p-0'>
        <CardTitle className='text-lg-semibold text-blue-700'>{i18n.campaign.title}</CardTitle>
        <Button
          className='rounded-lg border-blue-100 bg-blue-50 px-4 py-2 font-medium text-blue-700 shadow-none hover:bg-blue-100 hover:text-blue-800'
          variant='outline'
          onClick={handleGoToCreateCampaign}
        >
          <div className='flex items-center gap-2 text-blue-700'>
            <Plus className='size-4' /> {i18n.campaign.createCampaign}
          </div>
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
    </div>
  );
};

export default CampaignPage;
