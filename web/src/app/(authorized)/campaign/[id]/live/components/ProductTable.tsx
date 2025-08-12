'use client';

import React, { useEffect, useMemo } from 'react';

import { Plus } from 'lucide-react';

import ContentPagination from '@/components/content/pagination';
import type { TableColumn } from '@/components/table';
import Table from '@/components/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useModalContext from '@/hooks/useContext/useModalContext';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import type { CampaignsProduct } from '@/types/api/campaigns_products';

import ProductSoldListModal from './ProductSoldListModal';
import styles from './ProductTable.module.scss';

type ProductTableProps = {
  products: CampaignsProduct[];
  search: string;
  onSearchChange: (value: string) => void;
};

const ProductTable: React.FC<ProductTableProps> = ({ products, search, onSearchChange }) => {
  const { pagination, update } = usePaginationContext();
  const { limit, offset, page } = pagination;
  const { open } = useModalContext();

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
        render: (row) => <span className={styles.productName}>{row.product?.name ?? '-'}</span>,
        headerAlign: 'left',
        bodyAlign: 'left',
      },
      {
        key: 'price',
        label: 'ราคา',
        width: 120,
        render: (row) => (
          <span className={styles.price}>{row.product?.selling_price?.toLocaleString() ?? '-'}</span>
        ),
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
                content: <ProductSoldListModal campaignProduct={row} />,
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
        <Table<CampaignsProduct>
          columns={columns}
          data={[...paginatedProducts, ...paginatedProducts]}
          isLoading={false}
        />
        <ContentPagination
          className={styles.pagination}
          total={filteredProducts.length}
        />
      </div>
    </div>
  );
};

export default ProductTable;
