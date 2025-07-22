'use client';

import React, { useMemo } from 'react';

import { useRouter } from 'next/navigation';

import { Edit, Trash2 } from 'lucide-react';

import ContentPagination from '@/components/content/pagination';
import type { TableColumn } from '@/components/table';
import Table from '@/components/table';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import dayjs from '@/lib/dayjs';
import type { PaginationResponse } from '@/types/api/api-response';
import type { Product } from '@/types/api/product';

const ProductPage = () => {
  const router = useRouter();
  const {
    data,
    isLoading,
    handleRequest: handlePaginatedRequest,
  } = usePaginatedRequest<PaginationResponse<Product>>({
    url: API.PRODUCTS,
    orderBy: 'created_at',
    defaultStartDate: dayjs().subtract(50, 'years'),
  });

  const { handleRequest: handleDeleteRequest, isLoading: isDeleting } = useRequest<Product>({
    request: {
      url: API.PRODUCTS,
      method: 'DELETE',
    },
  });

  const { open, close } = useModalContext();

  const products = useMemo(() => data?.docs ?? [], [data?.docs]);
  const total = data?.total ?? 0;

  const handleGoToCreateProduct = () => {
    router.push('/product/create');
  };

  const handleDeleteProduct = (productId: string) => {
    open({
      content: (
        <div className='flex flex-col items-center justify-center gap-4 p-4'>
          <div className='text-lg font-semibold'>Are you sure you want to delete this product?</div>
          <div className='mt-2 flex gap-4'>
            <Button
              className='bg-red-600 text-white hover:bg-red-700'
              onClick={() => {
                void (async () => {
                  await handleDeleteRequest({ patchId: productId });
                  await handlePaginatedRequest();
                  close();
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

  const columns: TableColumn<Product>[] = [
    { key: 'code', label: 'Code', bold: true },
    { key: 'name', label: 'Name' },
    {
      key: 'quantity',
      label: 'Quantity',
      align: 'center',
      render: (row) => `${row.quantity} ${row.unit ?? ''}`.trim(),
    },
    {
      key: 'selling_price',
      label: 'Price',
      align: 'center',
      render: (row) => `${row.selling_price?.toFixed(2)}`,
    },
    {
      key: 'product_category',
      label: 'Category',
      align: 'center',
      render: (row) => row.product_category ?? '-',
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
            onClick={() => (window.location.href = `/product/edit/${row.id}`)}
          >
            <Edit className='size-4' />
          </Button>
          <Button
            className='text-red-600 hover:text-red-700'
            size='sm'
            variant='outline'
            onClick={() => {
              handleDeleteProduct(row.id);
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
        <CardTitle className='text-lg-semibold text-blue-700'>Products</CardTitle>
        <Button
          className='rounded-lg border-blue-100 bg-blue-50 px-4 py-2 font-medium text-blue-700 shadow-none hover:bg-blue-100 hover:text-blue-800'
          variant='outline'
          onClick={handleGoToCreateProduct}
        >
          <span className='text-base'>+ Create Product</span>
        </Button>
      </div>
      <div className='mt-4 flex flex-1 flex-col gap-4 overflow-hidden'>
        <Table
          bodyRowProps={{ className: 'bg-white hover:bg-gray-50 ' }}
          columns={columns}
          data={products}
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

export default ProductPage;
