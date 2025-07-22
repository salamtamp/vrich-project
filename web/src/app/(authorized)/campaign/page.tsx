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
import type { CampaignsProduct } from '@/types/api/campaigns_products';

type TableRowType = CampaignsProduct;

const CampaignPage = () => {
  const router = useRouter();
  const { data: campaignsProductsData, isLoading } = usePaginatedRequest<
    PaginationResponse<CampaignsProduct>
  >({
    url: API.CAMPAIGNS_PRODUCTS,
    orderBy: 'createdAt',
  });
  const { handleRequest: handleDeleteRequest, isLoading: isDeleting } = useRequest<CampaignsProduct>({
    request: {
      url: API.CAMPAIGNS_PRODUCTS,
      method: 'DELETE',
    },
  });

  const campaignsProducts = useMemo(() => campaignsProductsData?.docs ?? [], [campaignsProductsData?.docs]);
  const total = campaignsProductsData?.total ?? 0;

  const handleGoToCreateCampaign = () => {
    router.push('/campaign/create');
  };

  const handleDeleteCampaignProduct = async (campaignProductId: string) => {
    if (confirm('Are you sure you want to delete this campaign-product link?')) {
      try {
        await handleDeleteRequest({ patchId: campaignProductId });
      } catch (error) {
        console.error('Failed to delete campaign-product:', error);
      }
    }
  };

  const columns: TableColumn<TableRowType>[] = [
    { key: 'campaign.name', label: 'Campaign', bold: true },
    { key: 'product.name', label: 'Product', bold: true },
    { key: 'keyword', label: 'Keyword' },
    { key: 'quantity', label: 'Quantity', align: 'center' },
    { key: 'campaign.status', label: 'Campaign Status', align: 'center' },
    { key: 'product.selling_price', label: 'Product Price', align: 'center' },
    {
      key: 'status',
      label: 'Link Status',
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
            onClick={() => (window.location.href = `/campaign/edit/${String(row.campaign_id)}`)}
          >
            <Edit className='size-4' />
          </Button>
          <Button
            className='text-red-600 hover:text-red-700'
            size='sm'
            variant='outline'
            onClick={() => {
              void handleDeleteCampaignProduct(row.id);
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
      <div className='flex min-h-screen flex-col gap-8 bg-blueGray-50 p-8'>
        <Card className='w-full rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between border-b border-gray-100 pb-4'>
            <CardTitle className='text-2xl font-semibold tracking-tight text-blue-700'>Campaigns</CardTitle>
            <Button
              className='rounded-lg border-blue-100 bg-blue-50 px-4 py-2 font-medium text-blue-700 shadow-none hover:bg-blue-100 hover:text-blue-800'
              variant='outline'
              onClick={handleGoToCreateCampaign}
            >
              <span className='text-base'>+ Create Campaign</span>
            </Button>
          </CardHeader>
          <CardContent className='p-0'>
            <Table
              columns={columns}
              data={campaignsProducts}
              isLoading={isLoading || isDeleting}
              bodyRowProps={{
                className:
                  'bg-white hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0',
              }}
            />
            <ContentPagination
              className='mt-6'
              total={total}
            />
          </CardContent>
        </Card>
      </div>
    </PaginationProvider>
  );
};

export default CampaignPage;
