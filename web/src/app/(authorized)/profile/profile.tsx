'use client';

import React, { useCallback, useMemo } from 'react';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import TextList from '@/components/text-list';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import dayjs from '@/lib/dayjs';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookProfile } from '@/types/api/facebook-profile';

const ProfileContent: React.FC<{ profile: FacebookProfile }> = ({ profile }) => (
  <div className='flex flex-col gap-1'>
    <span>Type: {profile.type}</span>
    <span>ID: {profile.facebook_id}</span>
  </div>
);

const Profile = () => {
  const { open } = useModalContext();

  const { handleConfirm, data, isLoading } = usePaginatedRequest<PaginationResponse<FacebookProfile>>({
    url: API.PROFILE.PAGINATION,
  });

  const itemData = useMemo(
    () =>
      data?.docs?.map((profile) => ({
        id: profile.facebook_id,
        title: profile.name,
        content: <ProfileContent profile={profile} />,
        lastUpdate: '',
        profile_picture_url: profile.profile_picture_url,
        name: profile.name,
      })),
    [data?.docs]
  );

  const handleCardClick = useCallback(
    (id: string, data: CardData) => {
      open({
        content: (
          <TextList
            cardData={data}
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
      defaultEndDate={dayjs()}
      defaultStartDate={dayjs().subtract(6, 'day')}
      isLoading={isLoading}
      title='Profile'
      total={data?.total}
      onCardClick={handleCardClick}
      onConfirm={handleConfirm}
    />
  );
};
export default Profile;
