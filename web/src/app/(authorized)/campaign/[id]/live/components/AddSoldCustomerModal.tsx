'use client';

import React, { useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Plus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    <div className='flex w-[820px] flex-col gap-3 p-2'>
      <div className='grid grid-cols-[1fr_1fr_auto_auto] items-center gap-3'>
        <div className='text-muted-foreground text-sm'>ชื่อสินค้า</div>
        <div className='text-muted-foreground text-sm'>ชื่อลูกค้า</div>
        <div className='text-muted-foreground text-sm'>จำนวน</div>
        <div />
        <Controller
          control={control}
          name='productId'
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className='h-9'>
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
              className='h-9'
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
              className='h-9 w-20 text-center'
              containerClassName='w-fit'
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
          <Plus className='size-4' />
        </Button>
      </div>
    </div>
  );
};

export default AddSoldCustomerModal;
