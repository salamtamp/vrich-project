'use client';

import React, { useEffect, useMemo } from 'react';

import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';

import ContentPagination from '@/components/content/pagination';
import Table, { type TableColumn } from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API } from '@/constants/api.constant';
import { getStatusIcon, STATUS_COLORS, STATUS_LABELS } from '@/constants/order-status';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import dayjs from '@/lib/dayjs';
import type { PaginationResponse } from '@/types/api/api-response';

type CampaignSummary = {
  campaign: {
    id: string;
    name: string;
    status: string;
  };
  summary: {
    total_orders: number;
    total_sales: number;
    total_cost: number;
    total_profit: number;
    order_status_breakdown: Record<string, number>;
  };
  products: PaginationResponse<{
    product_id: string;
    product_name: string;
    selling_price: number;
    selling_unit: string;
    cost: number;
    profit: number;
    sold_quantity: number;
    total_sales: number;
    total_cost: number;
  }>;
};

type SummaryTabProps = { campaignId: string };

const SummaryTab: React.FC<SummaryTabProps> = ({ campaignId }) => {
  const { data, handleRequest, isLoading } = usePaginatedRequest<CampaignSummary>({
    url: `${API.CAMPAIGN}/${campaignId}/summary`,
    orderBy: 'product_name',
    defaultStartDate: dayjs().subtract(50, 'years'),
  });

  useEffect(() => {
    void handleRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summaryCards = useMemo(() => {
    if (!data) {
      return [];
    }
    return [
      {
        title: 'Total Orders',
        value: data.summary.total_orders,
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        title: 'Total Quantity',
        value: data.products.docs.reduce((total, product) => total + product.sold_quantity, 0),
        icon: ShoppingCart,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
      {
        title: 'Total Sales',
        value: `฿${data.summary.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        title: 'Total Profit',
        value: `฿${data.summary.total_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: TrendingUp,
        color: data.summary.total_profit >= 0 ? 'text-emerald-600' : 'text-red-600',
        bgColor: data.summary.total_profit >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      },
    ];
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-lg'>Loading summary...</div>
      </div>
    );
  }

  const productColumns: TableColumn<CampaignSummary['products']['docs'][0]>[] = [
    {
      key: 'product_name',
      label: 'Product Name',
      width: 200,
      render: (row) => <span className='font-medium'>{row.product_name}</span>,
    },
    {
      key: 'selling_price',
      label: 'Selling Price',
      align: 'right',
      width: 120,
      render: (row) => (
        <span className='font-mono'>
          ฿
          {row.selling_price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: 'cost',
      label: 'Cost',
      align: 'right',
      width: 100,
      render: (row) => (
        <span className='font-mono text-gray-600'>
          ฿{row.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'sold_quantity',
      label: 'Sold Qty',
      align: 'center',
      width: 100,
      render: (row) => <span className='font-medium'>{row.sold_quantity}</span>,
    },
    {
      key: 'total_sales',
      label: 'Total Sales',
      align: 'right',
      width: 120,
      render: (row) => (
        <span className='font-mono text-blue-600'>
          ฿{row.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'profit',
      label: 'Total Profit',
      align: 'right',
      width: 120,
      render: (row) => (
        <span className={`font-mono ${row.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ฿{row.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  return (
    <div className='flex size-full flex-col gap-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {summaryCards.map((card) => (
          <Card
            key={`${card.title}-${crypto.randomUUID()}`}
            className={`${card.bgColor} border-0 shadow-sm`}
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>{card.title}</CardTitle>
              <card.icon className={`size-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Products Table */}
      <Card className='flex min-h-[460px] flex-col overflow-hidden p-4 shadow-sm'>
        <CardTitle className='mb-2 text-lg'>Product Summary</CardTitle>
        <div className='flex flex-1 overflow-hidden'>
          <Table
            columns={productColumns}
            data={[...data.products.docs]}
            emptyStateComponent={<div className='py-8 text-center text-gray-500'>No products found</div>}
            isLoading={isLoading}
          />
        </div>
        <ContentPagination
          className='mt-2'
          limitOptions={[10, 20, 30, 50, 100, 200]}
          total={data.products.total}
        />
      </Card>

      {/* Order Status Breakdown */}
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='text-lg'>Order Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            {Object.entries(data.summary.order_status_breakdown).map(([status, count]) => (
              <Badge
                key={`${status}-${crypto.randomUUID()}`}
                className={`text-sm ${STATUS_COLORS[status] || ''}`}
                variant='secondary'
              >
                <span className='inline-flex items-center gap-1'>
                  {getStatusIcon(status)}
                  {STATUS_LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1)}: {count}
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryTab;
