'use client';

import React, { useCallback, useEffect, useMemo } from 'react';

import dayjs from 'dayjs';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import ProfileBox from '@/components/profile-box';
import { API } from '@/constants/api.constant';
import { PaginationProvider } from '@/contexts';
import { useNotificationContext } from '@/contexts';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import { useLocalDocsWithProfileUpdate } from '@/hooks/useLocalDocsWithProfileUpdate';
import { getRelativeTimeInThai } from '@/lib/utils';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookInboxResponse } from '@/types/api/facebook-inbox';

const MessageContent: React.FC<{ message: FacebookInboxResponse }> = ({ message }) => (
  <p className='line-clamp-4 text-md-medium'>{message.message ?? 'ไม่มีข้อความ'}</p>
);

const Inbox = () => {
  const { open, close } = useModalContext();
  const { lastInboxEvent } = useNotificationContext();

  const { handleResetToDefault, data, isLoading, handleConfirmPeriod } = usePaginatedRequest<
    PaginationResponse<FacebookInboxResponse>
  >({
    url: API.INBOX,
  });

  const {
    updated: updatedInboxes,
    markProfileUpdated,
    handleProfileUpdateIfNeeded,
  } = useLocalDocsWithProfileUpdate<FacebookInboxResponse>(
    data?.docs,
    (item) => item.profile?.id,
    (item, profile) =>
      item.profile
        ? {
            ...item,
            profile: {
              ...item.profile,
              name: profile.name,
              profile_picture_url: profile.profile_picture_url ?? item.profile.profile_picture_url,
            },
          }
        : item
  );

  const itemData = useMemo(
    () =>
      updatedInboxes.map((message) => {
        return {
          id: message.profile?.id ?? `inbox-${message.id}`,
          content: <MessageContent message={message} />,
          lastUpdate: getRelativeTimeInThai(message.published_at),
          profile_picture_url: message.profile?.profile_picture_url,
          name: message.profile?.name ?? '',
        };
      }),
    [updatedInboxes]
  );

  const handleCardClick = useCallback(
    (id: string, data: CardData) => {
      open({
        content: (
          <PaginationProvider defaultValue={{ limit: 20 }}>
            <ProfileBox
              cardData={data}
              defaultTab='inbox'
              id={id}
              onUpdate={markProfileUpdated}
            />
          </PaginationProvider>
        ),
        onClose: () => {
          handleProfileUpdateIfNeeded();
          close();
        },
      });
    },
    [open, close, markProfileUpdated, handleProfileUpdateIfNeeded]
  );

  useEffect(() => {
    handleResetToDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastInboxEvent]);

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
