'use client';

import React, { useCallback, useMemo } from 'react';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import TextList from '@/components/text-list';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import dayjs from '@/lib/dayjs';
import { getRelativeTimeInThai } from '@/lib/utils';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookProfileResponse } from '@/types/api/facebook-profile';

const ProfileContent: React.FC<{ profile: FacebookProfileResponse }> = ({ profile }) => (
  <div className='flex max-w-[200px] flex-col gap-1'>
    <p>Type: {profile.type}</p>
    <p className='truncate'>ID: {profile.facebook_id}</p>
  </div>
);

const Profile = () => {
  const { open } = useModalContext();

  const { handleConfirmPeriod, data, isLoading } = usePaginatedRequest<
    PaginationResponse<FacebookProfileResponse>
  >({
    url: API.PROFILE,
  });

  const itemData = useMemo(
    () =>
      data?.docs?.map((profile) => ({
        id: profile.facebook_id,
        title: profile.name,
        content: <ProfileContent profile={profile} />,
        lastUpdate: getRelativeTimeInThai(profile.created_at),
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
      skeletonSize='large'
      title='Profile'
      total={data?.total}
      onCardClick={handleCardClick}
      onConfirmPeriod={handleConfirmPeriod}
    />
  );
};
export default Profile;
