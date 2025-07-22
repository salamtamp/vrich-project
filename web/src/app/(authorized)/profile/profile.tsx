'use client';

import React, { useCallback, useMemo } from 'react';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import ProfileBox from '@/components/profile-box';
import { API } from '@/constants/api.constant';
import { PaginationProvider } from '@/contexts';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import type { ProfileLike } from '@/hooks/useLocalDocsWithProfileUpdate';
import { useLocalDocsWithProfileUpdate } from '@/hooks/useLocalDocsWithProfileUpdate';
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
  const { open, close } = useModalContext();

  const { handleConfirmPeriod, data, isLoading } = usePaginatedRequest<
    PaginationResponse<FacebookProfileResponse>
  >({
    url: API.PROFILE,
  });

  const {
    updated: updatedProfiles,
    markProfileUpdated,
    handleProfileUpdateIfNeeded,
  } = useLocalDocsWithProfileUpdate<FacebookProfileResponse>(
    data?.docs,
    (item: FacebookProfileResponse) => item.id,
    (item: FacebookProfileResponse, profile: ProfileLike): FacebookProfileResponse => {
      return {
        ...item,
        name: profile.name,
        profile_picture_url: profile.profile_picture_url ?? item.profile_picture_url,
      };
    }
  );

  const itemData = useMemo(
    () =>
      updatedProfiles.map((profile) => ({
        id: profile.id,
        content: <ProfileContent profile={profile} />,
        lastUpdate: getRelativeTimeInThai(profile.created_at),
        profile_picture_url: profile.profile_picture_url,
        name: profile.name,
      })),
    [updatedProfiles]
  );

  const handleCardClick = useCallback(
    (id: string, data: CardData) => {
      open({
        content: (
          <PaginationProvider defaultValue={{ limit: 20 }}>
            <ProfileBox
              cardData={data}
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

  return (
    <FilterCard
      data={itemData}
      defaultEndDate={dayjs()}
      defaultStartDate={dayjs().subtract(1, 'month')}
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
