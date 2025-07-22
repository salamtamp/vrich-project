'use client';

import React, { useMemo } from 'react';

import { useRouter } from 'next/navigation';

import { Edit, Trash2 } from 'lucide-react';

import ContentPagination from '@/components/content/pagination';
import type { TableColumn } from '@/components/table';
import Table from '@/components/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API } from '@/constants/api.constant';
import { PaginationProvider } from '@/contexts';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
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
    orderBy: 'createdAt',
  });

  const { handleRequest: handleDeleteRequest, isLoading: isDeleting } = useRequest<Product>({
    request: {
      url: API.PRODUCTS,
      method: 'DELETE',
    },
  });

  const products = useMemo(() => data?.docs ?? [], [data?.docs]);
  const total = data?.total ?? 0;

  const handleGoToCreateProduct = () => {
    router.push('/product/create');
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await handleDeleteRequest({ patchId: productId });
        await handlePaginatedRequest();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
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
              void handleDeleteProduct(row.id);
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
            <CardTitle className='text-2xl font-semibold tracking-tight text-blue-700'>Products</CardTitle>
            <Button
              className='rounded-lg border-blue-100 bg-blue-50 px-4 py-2 font-medium text-blue-700 shadow-none hover:bg-blue-100 hover:text-blue-800'
              variant='outline'
              onClick={handleGoToCreateProduct}
            >
              <span className='text-base'>+ Create Product</span>
            </Button>
          </CardHeader>
          <CardContent className='p-0'>
            <Table
              columns={columns}
              data={products}
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

export default ProductPage;
