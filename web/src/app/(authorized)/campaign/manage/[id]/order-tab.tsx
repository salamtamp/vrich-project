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
import { getStatusIcon, STATUS_COLORS, STATUS_LABELS } from '@/constants/order-status';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import dayjs from '@/lib/dayjs';
import type { PaginationResponse } from '@/types/api/api-response';
import type { Order, OrderStatus } from '@/types/api/order';
import { ORDER_PROCESS_STATUSES, ORDER_STATUSES } from '@/types/api/order';

const getOrderRowId = (row: Order) => String(row.id);
type OrderTabProps = { campaignId: string };

const StatusLegend = () => (
  <div className='mb-4 rounded-lg border bg-white p-4'>
    <h3 className='mb-3 text-sm font-semibold text-gray-700'>Order Status</h3>
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8'>
      {ORDER_STATUSES.map((status) => {
        return (
          <div
            key={status}
            className='flex items-center gap-2'
          >
            <Badge className={STATUS_COLORS[status] || 'border-gray-200 bg-gray-100'}>
              <span className='inline-flex items-center gap-1'>
                {getStatusIcon(status)}
                {STATUS_LABELS[status] || status}
              </span>
            </Badge>
          </div>
        );
      })}
    </div>
  </div>
);

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

  const handleSingleStatusUpdate = useMemo(
    () => async (orderId: string, currentStatus: OrderStatus) => {
      const nextStatus = getNextOrderStatus(currentStatus);
      if (!nextStatus) {
        return;
      }
      try {
        await handleBatchStatusUpdate({ data: { ids: [orderId], status: nextStatus } });
      } catch {
        console.error('Failed to update order status.');
      } finally {
        void handleOrderRequest();
      }
    },
    [handleBatchStatusUpdate, handleOrderRequest]
  );

  const handleStatusFilterChange = (value: string) => {
    setSelectedStatus(value);
    setSelectedOrderIds([]);
  };

  const hindButton = selectedStatus === 'confirmed' || selectedStatus === 'completed';

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
          {STATUS_LABELS[row.status] || row.status}
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
      headerAlign: 'center',
      width: 180,
      render: (row) => {
        const hindButtonByData = row.status === 'confirmed' || row.status === 'completed';
        return (
          <div className='flex items-center justify-center gap-2'>
            {ORDER_PROCESS_STATUSES.includes(row.status) &&
            getNextOrderStatus(row.status) &&
            !hindButtonByData ? (
              <Button
                className={STATUS_COLORS[getNextOrderStatus(row.status) ?? '']}
                disabled={isBatchUpdating}
                size='sm'
                variant='outline'
                onClick={() => {
                  const nextStatus = getNextOrderStatus(row.status);
                  if (nextStatus) {
                    void handleSingleStatusUpdate(row.id, row.status);
                  }
                }}
              >
                {getStatusIcon(getNextOrderStatus(row.status) ?? '')}
              </Button>
            ) : null}
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                modal.open({
                  content: (
                    <div className='flex max-h-[600px] min-h-[400px] min-w-[300px]'>
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
        );
      },
    },
  ];

  const onApproveSelected = canBatchApprove
    ? () => {
        void handleApproveSelected();
      }
    : undefined;

  const nextStatus = selectedStatus !== 'all' ? getNextOrderStatus(selectedStatus as OrderStatus) : undefined;

  const approveButtonLabel =
    canBatchApprove && nextStatus ? STATUS_LABELS[nextStatus] || nextStatus : undefined;

  return (
    <div className='flex size-full flex-col gap-1 overflow-hidden'>
      <StatusLegend />
      <div className='mb-2 flex items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Select
            value={selectedStatus}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue>
                {selectedStatus && selectedStatus !== 'all'
                  ? STATUS_LABELS[selectedStatus] || selectedStatus
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
                  {STATUS_LABELS[status] || status}
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
              className={STATUS_COLORS[getNextOrderStatus(nextStatus) ?? '']}
              disabled={selectedOrderIds.length === 0}
              variant='outline'
              onClick={onApproveSelected}
            >
              {getStatusIcon(nextStatus)}
              <span className='ml-2'>{approveButtonLabel}</span>
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
