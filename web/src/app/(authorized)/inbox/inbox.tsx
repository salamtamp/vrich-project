'use client';

import React, { useCallback, useMemo } from 'react';

import dayjs from 'dayjs';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import TextList from '@/components/text-list';
import { API } from '@/constants/api.constant';
import { PaginationProvider } from '@/contexts';
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

  const { handleConfirmPeriod, data, isLoading } = usePaginatedRequest<
    PaginationResponse<FacebookMessengerResponse>
  >({
    url: API.MESSAGE,
  });

  const itemData = useMemo(
    () =>
      data?.docs?.map((message) => {
        return {
          id: message.profile?.id ?? `message-${message.id}`,
          title: message.profile?.name ?? 'Unknown User',
          content: <MessageContent message={message} />,
          lastUpdate: getRelativeTimeInThai(message.created_at),
          profile_picture_url: message.profile?.profile_picture_url,
          name: message.profile?.name ?? 'Unknown User',
        };
      }),
    [data?.docs]
  );

  const handleCardClick = useCallback(
    (id: string, data: CardData) => {
      open({
        content: (
          <PaginationProvider defaultValue={{ limit: 20 }}>
            <TextList
              cardData={data}
              defaultTab='inbox'
              id={id}
            />
          </PaginationProvider>
        ),
      });
    },
    [open]
  );

  return (
    <FilterCard
      data={itemData}
      defaultEndDate={dayjs()}
      defaultStartDate={dayjs().subtract(6, 'day')}
      isLoading={isLoading}
      skeletonSize='medium'
      title='Inbox'
      total={data?.total}
      onCardClick={handleCardClick}
      onConfirmPeriod={handleConfirmPeriod}
    />
  );
};
export default Inbox;
