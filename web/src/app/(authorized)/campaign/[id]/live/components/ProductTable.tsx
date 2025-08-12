'use client';

import React, { useEffect, useMemo } from 'react';

import { Plus } from 'lucide-react';

import ContentPagination from '@/components/content/pagination';
import type { TableColumn } from '@/components/table';
import Table from '@/components/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import type { PaginationResponse } from '@/types/api/api-response';
import type { Product } from '@/types/api/product';

import ProductSoldListModal from './ProductSoldListModal';

import styles from './ProductTable.module.scss';

type ProductTableProps = {
  campaignId: string;
  search: string;
  onSearchChange: (value: string) => void;
};

const ProductTable: React.FC<ProductTableProps> = ({ campaignId, search, onSearchChange }) => {
  const { open } = useModalContext();
  const { update: updatePagination } = usePaginationContext();

  const { data: productData, isLoading } = usePaginatedRequest<PaginationResponse<Product>>({
    url: API.PRODUCTS,
    additionalParams: {
      campaign_id: campaignId,
    },
    requireFields: ['campaign_id'],
  });

  useEffect(() => {
    updatePagination({ search });
  }, [search, updatePagination]);

  const products = productData?.docs ?? [];
  const total = productData?.total ?? 0;

  const columns: TableColumn<Product>[] = useMemo(
    () => [
      {
        key: 'code',
        label: 'รหัส',
        width: 100,
        render: (row) => row?.code ?? '-',
        headerAlign: 'left',
        bodyAlign: 'left',
      },
      {
        key: 'name',
        label: 'ชื่อสินค้า',
        width: '60%',
        render: (row) => <span className={styles.productName}>{row?.name ?? '-'}</span>,
        headerAlign: 'left',
        bodyAlign: 'left',
      },
      {
        key: 'price',
        label: 'ราคา',
        width: 120,
        render: (row) => <span className={styles.price}>{row?.selling_price?.toLocaleString() ?? '-'}</span>,
        headerAlign: 'right',
        bodyAlign: 'right',
      },
      {
        key: 'sold_total',
        label: 'ขาย / ทั้งหมด',
        width: 140,
        render: (row) => (
          <button
            className={styles.soldButton}
            type='button'
            onClick={() => {
              open({
                content: <ProductSoldListModal product={row} />,
              });
            }}
          >
            0/{row.quantity ?? 0}
          </button>
        ),
        headerAlign: 'center',
        bodyAlign: 'center',
      },
    ],
    [open]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.title}>สินค้าในแคมเปญ</p>

        <div className={styles.actions}>
          <Button variant='outline'>
            <Plus /> เพิ่มสินค้า
          </Button>
          <Input
            className={styles.searchInput}
            placeholder='ค้นหา'
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <Table<Product>
          columns={columns}
          data={products}
          isLoading={isLoading}
        />
        <ContentPagination
          className={styles.pagination}
          total={total}
        />
      </div>
    </div>
  );
};

export default ProductTable;
