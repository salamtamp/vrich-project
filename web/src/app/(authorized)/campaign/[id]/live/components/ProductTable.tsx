'use client';

import React, { useEffect, useMemo } from 'react';

import { Plus } from 'lucide-react';

import ContentPagination from '@/components/content/pagination';
import Table, { type TableColumn } from '@/components/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import type { CampaignsProduct } from '@/types/api/campaigns_products';

type ProductTableProps = {
  products: CampaignsProduct[];
  search: string;
  onSearchChange: (value: string) => void;
};

const ProductTable: React.FC<ProductTableProps> = ({ products, search, onSearchChange }) => {
  const { pagination, update } = usePaginationContext();
  const { limit, offset, page } = pagination;

  const columns: TableColumn<CampaignsProduct>[] = useMemo(
    () => [
      {
        key: 'code',
        label: 'รหัส',
        width: 100,
        render: (row) => row.product?.code ?? '-',
        headerAlign: 'left',
        bodyAlign: 'left',
      },
      {
        key: 'name',
        label: 'ชื่อสินค้า',
        width: '60%',
        render: (row) => <span className='line-clamp-2'>{row.product?.name ?? '-'}</span>,
        headerAlign: 'left',
        bodyAlign: 'left',
      },
      {
        key: 'price',
        label: 'ราคา',
        width: 120,
        render: (row) => (
          <span className='tabular-nums'>{row.product?.selling_price?.toLocaleString() ?? '-'}</span>
        ),
        headerAlign: 'right',
        bodyAlign: 'right',
      },
      {
        key: 'sold_total',
        label: 'ขาย / ทั้งหมด',
        width: 140,
        render: (row) => <span className='tabular-nums'>0/{row.quantity ?? 0}</span>,
        headerAlign: 'center',
        bodyAlign: 'center',
      },
    ],
    []
  );

  const filteredProducts = useMemo(() => {
    if (!search.trim()) {
      return products;
    }
    const s = search.toLowerCase();
    return products.filter(
      (cp) =>
        (cp.product?.name ?? '').toLowerCase().includes(s) ||
        (cp.product?.code ?? '').toLowerCase().includes(s)
    );
  }, [products, search]);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(offset, offset + limit);
  }, [filteredProducts, offset, limit]);

  useEffect(() => {
    update({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredProducts.length / limit);
    if (totalPages === 0 && page !== 1) {
      update({ page: 1 });
      return;
    }
    if (totalPages > 0 && page > totalPages) {
      update({ page: totalPages });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProducts.length, limit]);

  return (
    <div className='flex h-fit max-h-[520px] min-h-[520px] max-w-[680px] flex-col rounded-md border border-gray-200 p-4 shadow-sm'>
      <div className='flex items-center justify-between'>
        <p className='w-full text-lg-semibold'>สินค้าในแคมเปญ</p>

        <div className='flex gap-2'>
          <Button variant='outline'>
            <Plus /> เพิ่มสินค้า
          </Button>
          <Input
            className='w-40'
            placeholder='ค้นหา'
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
          />
        </div>
      </div>

      <div className='mt-3 flex h-full max-h-fit flex-1 flex-col gap-2 overflow-hidden'>
        <Table<CampaignsProduct>
          columns={columns}
          data={[...paginatedProducts, ...paginatedProducts]}
          isLoading={false}
        />
        <ContentPagination
          className='mb-0'
          total={filteredProducts.length}
        />
      </div>
    </div>
  );
};

export default ProductTable;
