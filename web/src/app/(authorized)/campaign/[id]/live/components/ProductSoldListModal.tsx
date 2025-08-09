'use client';

import React, { useMemo, useState } from 'react';

import { Pencil, Plus, Search, Trash2 } from 'lucide-react';

import Table, { type TableColumn } from '@/components/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { CampaignsProduct } from '@/types/api/campaigns_products';

type ProductSoldListModalProps = {
  campaignProduct: CampaignsProduct;
};

type CustomerOrderItem = {
  id: string;
  name: string;
  quantity: number;
};

const ProductSoldListModal: React.FC<ProductSoldListModalProps> = ({ campaignProduct }) => {
  const [search, setSearch] = useState('');

  const productName = campaignProduct.product?.name ?? '-';
  const productPrice = campaignProduct.product?.selling_price ?? 0;
  const quantity = campaignProduct.quantity ?? 0;

  const rows = useMemo<CustomerOrderItem[]>(
    () => [
      { id: crypto.randomUUID(), name: 'Khun Kate', quantity: 2 },
      { id: crypto.randomUUID(), name: 'Noi Jaidees', quantity: 1 },
      { id: crypto.randomUUID(), name: 'Mai Leela', quantity: 1 },
      { id: crypto.randomUUID(), name: 'Dada Pholwattana', quantity: 1 },
      { id: crypto.randomUUID(), name: 'Naiyanetr Wong-ngam', quantity: 1 },
    ],
    []
  );

  const filteredRows = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) {
      return rows;
    }
    return rows.filter((r) => r.name.toLowerCase().includes(s));
  }, [rows, search]);

  const columns: TableColumn<CustomerOrderItem>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'ชื่อลูกค้า',
        width: '60%',
        render: (row) => <span className='line-clamp-1'>{row.name}</span>,
        headerAlign: 'left',
        bodyAlign: 'left',
      },
      {
        key: 'quantity',
        label: 'จำนวน',
        width: 120,
        render: (row) => <span className='tabular-nums'>{row.quantity}</span>,
        headerAlign: 'center',
        bodyAlign: 'center',
      },
      {
        key: 'actions',
        label: 'จัดการ',
        width: 160,
        render: () => (
          <div className='flex items-center justify-center gap-2'>
            <Button
              aria-label='edit'
              size='icon'
              variant='ghost'
            >
              <Pencil className='size-4' />
            </Button>
            <Button
              aria-label='delete'
              size='icon'
              variant='ghost'
            >
              <Trash2 className='size-4' />
            </Button>
          </div>
        ),
        headerAlign: 'center',
        bodyAlign: 'center',
      },
    ],
    []
  );

  return (
    <Card className='flex h-[560px] w-[720px] flex-col gap-3 p-4'>
      <div className='flex items-start justify-between'>
        <div className='flex min-w-0 flex-1 flex-col'>
          <p className='truncate text-base font-semibold'>{productName}</p>
          <div className='text-muted-foreground mt-1 flex items-center gap-6 text-xs'>
            <span>ราคา {productPrice.toLocaleString()} บาท</span>
            <span>
              ขายแล้ว: <span className='tabular-nums'>0</span>
              {' / '}
              <span className='tabular-nums'>{quantity}</span>
              ชิ้น
            </span>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button>
            <Plus className='mr-1 size-4' /> เพิ่มลูกค้า
          </Button>
          <div className='flex items-center gap-2'>
            <Input
              className='w-44'
              placeholder='ค้นหา'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <Button variant='outline'>
              <Search className='size-4' />
            </Button>
          </div>
        </div>
      </div>

      <div className='mt-1 flex flex-1 flex-col overflow-hidden'>
        <Table<CustomerOrderItem>
          columns={columns}
          data={filteredRows}
          isLoading={false}
        />
      </div>
    </Card>
  );
};

export default ProductSoldListModal;
