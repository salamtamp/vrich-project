'use client';

import React, { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Eye } from 'lucide-react';

import ContentPagination from '@/components/content/pagination';
import Table, { type TableColumn } from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import dayjs from '@/lib/dayjs';
import type { PaginationResponse } from '@/types/api/api-response';
import type { Order } from '@/types/api/order';

const STATUS_COLORS: Record<string, string> = {
  pending: 'border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700',
  confirmed: 'border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900',
  paid: 'border-yellow-200 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:text-yellow-900',
  approved: 'border-indigo-200 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:text-indigo-900',
  shipped: 'border-cyan-200 bg-cyan-100 text-cyan-700 hover:bg-cyan-200 hover:text-cyan-900',
  delivered: 'border-green-200 bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-900',
  cancelled: 'border-red-200 bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-900',
  completed: 'border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-900',
};

const getOrderRowId = (row: Order) => String(row.id);
type OrderTabProps = { campaignId: string };

const OrderTab: React.FC<OrderTabProps> = ({ campaignId }) => {
  const router = useRouter();
  const {
    data: orderData,
    isLoading: orderLoading,
    handleRequest: handleOrderRequest,
  } = usePaginatedRequest<PaginationResponse<Order>>({
    url: API.ORDER,
    orderBy: 'created_at',
    defaultStartDate: dayjs().subtract(50, 'years'),
    additionalParams: { campaign_id: campaignId },
    requireFields: ['campaign_id'],
  });

  const { handleRequest: handleBatchStatusUpdate, isLoading: isBatchUpdating } = useRequest({
    request: {
      url: `${API.ORDER}/batch-update-status`,
      method: 'PUT',
    },
  });

  // Selection state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const orders = useMemo(() => orderData?.docs ?? [], [orderData]);
  const allOrderIds = useMemo(() => orders.map((row) => getOrderRowId(row)), [orders]);

  const handleSelectRow = (rowId: string, checked: boolean) => {
    setSelectedOrderIds((prev) => (checked ? [...prev, rowId] : prev.filter((id) => id !== rowId)));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedOrderIds(checked ? allOrderIds : []);
  };

  const handleApproveSelected = useMemo(
    () => async () => {
      if (selectedOrderIds.length === 0) {
        return;
      }
      const idsToApprove = orders
        .filter((order) => selectedOrderIds.includes(order.id) && order.status !== 'approved')
        .map((order) => order.id);
      try {
        if (!!idsToApprove.length) {
          await handleBatchStatusUpdate({ data: { ids: idsToApprove, status: 'approved' } });
          setSelectedOrderIds([]);
        }
      } catch {
        console.error('Failed to approve selected orders.');
      } finally {
        void handleOrderRequest();
      }
    },
    [handleBatchStatusUpdate, handleOrderRequest, selectedOrderIds, orders]
  );

  const orderColumns: TableColumn<Order>[] = [
    {
      key: 'profile',
      label: 'Profile',
      align: 'left',
      width: 200,
      render: (row) => <p className='truncate'>{row.profile?.name ?? '-'} </p>,
    },
    { key: 'code', label: 'Order Code', bold: true, width: 140 },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      width: 100,
      render: (row) => (
        <Badge className={STATUS_COLORS[row.status] || 'border-gray-200 bg-gray-100 text-gray-500'}>
          {row.status?.charAt(0)?.toUpperCase() + row.status?.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'orders_products',
      label: 'Items',
      align: 'center',
      width: 80,
      render: (row) => row.orders_products?.length ?? 0,
    },
    {
      key: 'total_selling_price',
      label: 'Total Price',
      align: 'center',
      width: 120,
      render: (row) => {
        const total =
          row.orders_products?.reduce((sum, op) => {
            const price = op.campaign_product?.product?.selling_price ?? 0;
            return sum + price * (op.quantity ?? 1);
          }, 0) ?? 0;
        return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
    },
    {
      key: 'purchase_date',
      label: 'Purchase Date',
      align: 'center',
      width: 120,
      render: (row) => (row.purchase_date ? dayjs(row.purchase_date).format('YYYY-MM-DD') : '-'),
    },
    {
      key: 'shipping_date',
      label: 'Shipping Date',
      align: 'center',
      width: 120,
      render: (row) => (row.shipping_date ? dayjs(row.shipping_date).format('YYYY-MM-DD') : '-'),
    },
    {
      key: 'delivery_date',
      label: 'Delivery Date',
      align: 'center',
      width: 120,
      render: (row) => (row.delivery_date ? dayjs(row.delivery_date).format('YYYY-MM-DD') : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      width: 80,
      render: (row) => (
        <div className='flex items-center justify-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              router.push(`/orders/${row.id}`);
            }}
          >
            <Eye className='size-4' />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='flex w-full flex-col gap-1 overflow-hidden'>
      <div className='flex-1 overflow-scroll'>
        <Table
          bodyRowProps={{ className: 'bg-white hover:bg-gray-50' }}
          columns={orderColumns}
          data={orders}
          emptyStateComponent={<div>No orders found</div>}
          isLoading={orderLoading || isBatchUpdating}
          rowIdKey='id'
          selectedRowIds={selectedOrderIds}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          onApproveSelected={() => {
            void handleApproveSelected();
          }}
        />
      </div>
      <ContentPagination total={orderData?.total ?? 0} />
    </div>
  );
};

export default OrderTab;
