'use client';

import React, { useCallback, useMemo } from 'react';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import TextList from '@/components/text-list';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import { getRelativeTimeInThai } from '@/lib/utils';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookMessengerResponse } from '@/types/api/facebook-messenger';

const MessageContent: React.FC<{ message: FacebookMessengerResponse }> = ({ message }) => (
  <p className='line-clamp-4 text-md-medium'>{message.message ?? 'ไม่มีข้อความ'}</p>
);

const Inbox = () => {
  const { open } = useModalContext();

  const { handleConfirm, data, isLoading } = usePaginatedRequest<
    PaginationResponse<FacebookMessengerResponse>
  >({
    url: API.MESSAGE.PAGINATION,
  });

  const itemData = useMemo(
    () =>
      data?.docs?.map((message) => {
        return {
          id: message.messenger_id,
          content: <MessageContent message={message} />,
          lastUpdate: getRelativeTimeInThai(message.created_at),
        };
      }),
    [data?.docs]
  );

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
      skeletonSize='medium'
      title='Inbox'
      total={data?.total}
      onCardClick={handleCardClick}
      onConfirm={handleConfirm}
    />
  );
};
export default Inbox;
