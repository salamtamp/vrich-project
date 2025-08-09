'use client';

import React, { useMemo } from 'react';

import { Plus } from 'lucide-react';

import Table, { type TableColumn } from '@/components/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CampaignsProduct } from '@/types/api/campaigns_products';

type ProductTableProps = {
  products: CampaignsProduct[];
  search: string;
  onSearchChange: (value: string) => void;
};

const ProductTable: React.FC<ProductTableProps> = ({ products, search, onSearchChange }) => {
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
        width: '45%',
        render: (row) => <span className='line-clamp-1'>{row.product?.name ?? '-'}</span>,
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

  return (
    <div className='h-fit max-h-[520px] min-h-[520px] max-w-[680px] rounded-md border border-gray-200 p-4 shadow-sm'>
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

      <div className='mt-3'>
        <Table<CampaignsProduct>
          columns={columns}
          data={filteredProducts}
          isLoading={false}
        />
      </div>
    </div>
  );
};

export default ProductTable;
