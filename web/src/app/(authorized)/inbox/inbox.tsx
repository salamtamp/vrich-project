'use client';

import React, { useCallback } from 'react';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import TextList from '@/components/text-list';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import dayjs from '@/lib/dayjs';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookMessenger } from '@/types/api/facebook-messenger';

const Inbox = () => {
  const { open } = useModalContext();

  const { handleConfirm, data, isLoading } = usePaginatedRequest<PaginationResponse<FacebookMessenger>>({
    url: API.MESSAGE.PAGINATION,
  });

  const itemData =
    data?.docs?.map((msg) => ({
      id: msg.messenger_id,
      content: msg.message,
      lastUpdate: dayjs(msg.sent_at).fromNow(),
    })) ?? [];

  const handleCardClick = useCallback(
    (id: string, data: CardData) => {
      open({
        content: (
          <TextList
            cardData={data}
            defaultTab='inbox'
            id={id}
          />
        ),
      });
    },
    [open]
  );

  return (
    <FilterCard
      data={itemData}
      isLoading={isLoading}
      title='Inbox'
      total={data?.total}
      onCardClick={handleCardClick}
      onConfirm={handleConfirm}
    />
  );
};
export default Inbox;
