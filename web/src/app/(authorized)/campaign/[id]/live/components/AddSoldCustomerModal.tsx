'use client';

import React, { useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Plus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import styles from './AddSoldCustomerModal.module.scss';

type ProductOption = { id: string; name: string };

export type AddSoldCustomerPayload = {
  productId: string;
  customerName: string;
  quantity: number;
};

type AddSoldCustomerModalProps = {
  productOptions: ProductOption[];
  defaultProductId: string | null;
  onSubmitAdd: (payload: AddSoldCustomerPayload) => void;
};

const schema = yup.object({
  productId: yup.string().required('จำเป็น'),
  customerName: yup.string().trim().required('จำเป็น'),
  quantity: yup
    .number()
    .typeError('ต้องเป็นตัวเลข')
    .integer('ต้องเป็นจำนวนเต็ม')
    .min(1, 'อย่างน้อย 1')
    .required('จำเป็น'),
});

type FormValues = yup.InferType<typeof schema>;

const AddSoldCustomerModal: React.FC<AddSoldCustomerModalProps> = ({
  productOptions,
  defaultProductId,
  onSubmitAdd,
}) => {
  const defaultValues = useMemo<FormValues>(
    () => ({ productId: defaultProductId ?? productOptions[0]?.id ?? '', customerName: '', quantity: 1 }),
    [defaultProductId, productOptions]
  );

  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues,
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = (values: FormValues) => {
    setSubmitting(true);
    onSubmitAdd(values);
    setSubmitting(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.header}>ชื่อสินค้า</div>
        <div className={styles.header}>ชื่อลูกค้า</div>
        <div className={styles.header}>จำนวน</div>
        <div />
        <Controller
          control={control}
          name='productId'
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className={styles.selectTrigger}>
                <SelectValue placeholder='เลือกสินค้า' />
              </SelectTrigger>
              <SelectContent>
                {productOptions.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.id}
                  >
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <Controller
          control={control}
          name='customerName'
          render={({ field }) => (
            <Input
              className={styles.input}
              placeholder='ชื่อลูกค้า'
              {...field}
            />
          )}
        />

        <Controller
          control={control}
          name='quantity'
          render={({ field }) => (
            <Input
              className={styles.quantityInput}
              containerClassName={styles.quantityContainer}
              inputMode='numeric'
              min={1}
              type='number'
              {...field}
            />
          )}
        />

        <Button
          aria-label='confirm-add'
          disabled={submitting}
          size='icon'
          type='button'
          variant='outline'
          onClick={() => {
            void handleSubmit(onSubmit)();
          }}
        >
          <Plus className={styles.plusIcon} />
        </Button>
      </div>
    </div>
  );
};

export default AddSoldCustomerModal;

