'use client';

import React, { useCallback, useMemo, useState } from 'react';

import { Check, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import Table, { type TableColumn } from '@/components/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import useModalContext from '@/hooks/useContext/useModalContext';
import type { CampaignsProduct } from '@/types/api/campaigns_products';

import AddSoldCustomerModal from './AddSoldCustomerModal';

import styles from './ProductSoldListModal.module.scss';

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
  const [rows, setRows] = useState<CustomerOrderItem[]>(() => [
    { id: crypto.randomUUID(), name: 'Khun Kate', quantity: 2 },
    { id: crypto.randomUUID(), name: 'Noi Jaidees', quantity: 1 },
    { id: crypto.randomUUID(), name: 'Mai Leela', quantity: 1 },
    { id: crypto.randomUUID(), name: 'Dada Pholwattana', quantity: 1 },
    { id: crypto.randomUUID(), name: 'Naiyanetr Wong-ngam', quantity: 1 },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftQty, setDraftQty] = useState<number>(0);

  const productName = campaignProduct.product?.name ?? '-';
  const productPrice = campaignProduct.product?.selling_price ?? 0;
  const quantity = campaignProduct.quantity ?? 0;
  const { open, close } = useModalContext();

  const handleStartEdit = useCallback((row: CustomerOrderItem) => {
    setEditingId(row.id);
    setDraftQty(row.quantity);
  }, []);

  const handleSave = useCallback(() => {
    if (editingId === null) {
      return;
    }
    const safeQty = Number.isFinite(draftQty) && draftQty >= 0 ? Math.floor(draftQty) : 0;
    setRows((prev) => prev.map((r) => (r.id === editingId ? { ...r, quantity: safeQty } : r)));
    setEditingId(null);
  }, [draftQty, editingId]);

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
        render: (row) => <span className={styles.customerName}>{row.name}</span>,
        headerAlign: 'left',
        bodyAlign: 'left',
      },
      {
        key: 'quantity',
        label: 'จำนวน',
        width: 120,
        render: (row) =>
          row.id === editingId ? (
            <div className={styles.editQuantityContainer}>
              <Input
                aria-label='edit-quantity'
                className={styles.editQuantityInput}
                containerClassName={styles.editQuantityInputContainer}
                inputMode='numeric'
                min={0}
                type='number'
                value={draftQty}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDraftQty(Number.isNaN(val) ? 0 : val);
                }}
              />
            </div>
          ) : (
            <span className={styles.quantity}>{row.quantity}</span>
          ),
        headerAlign: 'center',
        bodyAlign: 'center',
      },
      {
        key: 'actions',
        label: 'จัดการ',
        width: 160,
        render: (row) => (
          <div className={styles.tableActions}>
            {editingId === row.id ? (
              <Button
                aria-label='save'
                size='icon'
                variant='ghost'
                onClick={handleSave}
              >
                <Check className={styles.actionIcon} />
              </Button>
            ) : (
              <Button
                aria-label='edit'
                size='icon'
                variant='ghost'
                onClick={() => {
                  handleStartEdit(row);
                }}
              >
                <Pencil className={styles.actionIcon} />
              </Button>
            )}
            <Button
              aria-label='delete'
              size='icon'
              variant='ghost'
            >
              <Trash2 className={styles.actionIcon} />
            </Button>
          </div>
        ),
        headerAlign: 'center',
        bodyAlign: 'center',
      },
    ],
    [draftQty, editingId, handleSave, handleStartEdit]
  );

  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <div className={styles.productInfo}>
          <p className={styles.productName}>{productName}</p>
          <div className={styles.productMeta}>
            <span>ราคา {productPrice.toLocaleString()} บาท</span>
            <span>
              ขายแล้ว: <span className={styles.sold}>0</span>
              {' / '}
              <span className={styles.sold}>{quantity}</span>
              ชิ้น
            </span>
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            onClick={() => {
              const opts = [
                { id: campaignProduct.product?.id ?? 'unknown', name: campaignProduct.product?.name ?? '-' },
              ];
              const defaultId = campaignProduct.product?.id ?? null;
              open({
                content: (
                  <AddSoldCustomerModal
                    defaultProductId={defaultId}
                    productOptions={opts}
                    onSubmitAdd={() => {
                      close();
                    }}
                  />
                ),
              });
            }}
          >
            <Plus className={styles.addCustomerIcon} /> เพิ่มลูกค้า
          </Button>
          <div className={styles.searchContainer}>
            <Input
              className={styles.searchInput}
              placeholder='ค้นหา'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <Button variant='outline'>
              <Search className={styles.searchIcon} />
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
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
