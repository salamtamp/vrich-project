'use client';

import React, { useMemo, useState } from 'react';

import { Eye } from 'lucide-react';

import OrderDetailsClient from '@/app/orders/[id]/OrderDetailsClient';
import ContentPagination from '@/components/content/pagination';
import Table, { type TableColumn } from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import dayjs from '@/lib/dayjs';
import type { PaginationResponse } from '@/types/api/api-response';
import type { Order, OrderStatus } from '@/types/api/order';
import { ORDER_PROCESS_STATUSES, ORDER_STATUSES } from '@/types/api/order';

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
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const {
    data: orderData,
    isLoading: orderLoading,
    handleRequest: handleOrderRequest,
  } = usePaginatedRequest<PaginationResponse<Order>>({
    url: API.ORDER,
    orderBy: 'created_at',
    defaultStartDate: dayjs().subtract(50, 'years'),
    additionalParams: {
      campaign_id: campaignId,
      ...(selectedStatus && selectedStatus !== 'all' && { status: selectedStatus }),
    },
    requireFields: ['campaign_id'],
  });

  const { handleRequest: handleBatchStatusUpdate, isLoading: isBatchUpdating } = useRequest({
    request: {
      url: `${API.ORDER}/batch-update-status`,
      method: 'PUT',
    },
  });

  const modal = useModalContext();

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const orders = useMemo(() => orderData?.docs ?? [], [orderData]);

  const getNextOrderStatus = (currentStatus: OrderStatus) => {
    const idx = ORDER_PROCESS_STATUSES.indexOf(currentStatus);
    if (idx !== -1 && idx < ORDER_PROCESS_STATUSES.length - 1) {
      return ORDER_PROCESS_STATUSES[idx + 1];
    }
    return undefined;
  };

  // Only allow selection and batch approve for the filtered status
  const canBatchApprove =
    Boolean(selectedStatus) &&
    ORDER_PROCESS_STATUSES.includes(selectedStatus as OrderStatus) &&
    getNextOrderStatus(selectedStatus as OrderStatus);
  const filteredOrders = useMemo(() => {
    if (!selectedStatus || selectedStatus === 'all') {
      return orders;
    }
    return orders.filter((order) => order.status === selectedStatus);
  }, [orders, selectedStatus]);

  const handleSelectRow = (rowId: string, checked: boolean) => {
    setSelectedOrderIds((prev) => (checked ? [...prev, rowId] : prev.filter((id) => id !== rowId)));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedOrderIds(checked ? filteredOrders.map((row) => getOrderRowId(row)) : []);
  };

  const handleApproveSelected = useMemo(
    () => async () => {
      if (!canBatchApprove || selectedOrderIds.length === 0) {
        return;
      }
      const nextStatus = getNextOrderStatus(selectedStatus as OrderStatus);
      if (!nextStatus) {
        return;
      }
      try {
        await handleBatchStatusUpdate({ data: { ids: selectedOrderIds, status: nextStatus } });
        setSelectedOrderIds([]);
      } catch {
        console.error('Failed to approve selected orders.');
      } finally {
        void handleOrderRequest();
      }
    },
    [handleBatchStatusUpdate, handleOrderRequest, selectedOrderIds, selectedStatus, canBatchApprove]
  );

  const handleStatusFilterChange = (value: string) => {
    setSelectedStatus(value);
    setSelectedOrderIds([]);
  };

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
      width: 120,
      render: (row) => (
        <Badge className={STATUS_COLORS[row.status] || 'border-gray-200 bg-gray-100 text-gray-500'}>
          {row.status?.charAt(0)?.toUpperCase() + row.status?.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'orders_products',
      label: 'Product',
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
              modal.open({
                content: (
                  <div className='flex max-h-[600px]'>
                    <OrderDetailsClient
                      isAdmin
                      id={row.id}
                    />
                  </div>
                ),
                className: 'bg-gray-200',
              });
            }}
          >
            <Eye className='size-4' />
          </Button>
        </div>
      ),
    },
  ];

  const onApproveSelected = canBatchApprove
    ? () => {
        void handleApproveSelected();
      }
    : undefined;

  const nextStatus = selectedStatus !== 'all' ? getNextOrderStatus(selectedStatus as OrderStatus) : undefined;

  const approveButtonLabel =
    canBatchApprove && nextStatus ? nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1) : undefined;

  const getButtonColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'paid':
        return 'border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'approved':
        return 'border-indigo-200 bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'shipped':
        return 'border-cyan-200 bg-cyan-100 text-cyan-800 hover:bg-cyan-200';
      case 'delivered':
        return 'border-green-200 bg-green-100 text-green-800 hover:bg-green-200';
      case 'completed':
        return 'border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      default:
        return 'border-gray-200 bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const hindButton = selectedStatus === 'confirmed' || selectedStatus === 'completed';

  return (
    <div className='flex size-full flex-col gap-1 overflow-hidden'>
      {/* Status Filter */}
      <div className='my-2 flex items-center justify-between gap-4 rounded-lg border-b bg-gray-100 px-4 py-2'>
        <div className='flex items-center gap-4'>
          <Select
            value={selectedStatus}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue>
                {selectedStatus && selectedStatus !== 'all'
                  ? selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)
                  : 'All Status'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              {ORDER_STATUSES.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedStatus && selectedStatus !== 'all' ? (
            <Button
              className='text-gray-600 hover:text-gray-800'
              size='sm'
              variant='outline'
              onClick={() => {
                setSelectedStatus('all');
              }}
            >
              Clear Filter
            </Button>
          ) : null}
        </div>
        {onApproveSelected && approveButtonLabel && !hindButton && nextStatus ? (
          <div className='mb-2 flex justify-end'>
            <Button
              className={getButtonColor(nextStatus)}
              disabled={selectedOrderIds.length === 0}
              variant='outline'
              onClick={onApproveSelected}
            >
              {approveButtonLabel}
            </Button>
          </div>
        ) : null}
      </div>
      <div className='flex-1 overflow-scroll'>
        <Table
          bodyRowProps={{ className: 'bg-white hover:bg-gray-50' }}
          columns={orderColumns}
          data={filteredOrders}
          emptyStateComponent={<div>No orders found</div>}
          isLoading={orderLoading || isBatchUpdating}
          rowIdKey='id'
          selectedRowIds={selectedOrderIds}
          onSelectAll={selectedStatus !== 'all' ? handleSelectAll : undefined}
          onSelectRow={selectedStatus !== 'all' ? handleSelectRow : undefined}
        />
      </div>
      <ContentPagination total={orderData?.total ?? 0} />
    </div>
  );
};

export default OrderTab;
