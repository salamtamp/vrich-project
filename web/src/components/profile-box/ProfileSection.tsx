import React from 'react';

import { Mail, MapPin, Phone, SquareArrowUpRight, User } from 'lucide-react';

import { ImageWithFallback } from '@/hooks/useImageFallback';
import type { FacebookProfileResponse } from '@/types/api';

import styles from './profile-section.module.scss';

// Mock profile data for demonstration
const mockProfile: FacebookProfileResponse = {
  id: '1',
  facebook_id: '123456789',
  type: 'user',
  name: 'Alexandra Chen',
  username: 'alexandra.chen',
  bio: "Creative designer & photographer capturing life's beautiful moments. Always exploring new places and meeting amazing people.",
  profile_picture_url:
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
  profile_contact: {
    id: '1',
    profile_id: '1',
    first_name: 'Alexandra',
    last_name: 'Chen',
    email: 'alex.chen@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Creative Street',
    city: 'San Francisco',
    country: 'United States',
    created_at: '2024-01-01T00:00:00Z',
  },
  created_at: '2024-01-01T00:00:00Z',
};

type ProfileSectionProps = {
  profile: FacebookProfileResponse;
  onOpenProfile?: () => void;
};

const ProfileSection = ({ profile = mockProfile, onOpenProfile }: ProfileSectionProps) => {
  return (
    <div className={styles.profile}>
      <div className='bg-gradient-to-br'>
        <div className='mb-6 flex justify-center'>
          <div className='relative'>
            <div className='rounded-full bg-white p-1 shadow-sm'>
              <ImageWithFallback
                alt={profile?.name ?? 'profile'}
                className='size-20 rounded-full object-cover'
                size={80}
                src={profile?.profile_picture_url}
                fallbackIcon={
                  <User
                    className='text-gray-400'
                    size={28}
                  />
                }
              />
            </div>

            <div className='absolute bottom-1 right-1 size-4 rounded-full border-2 border-white bg-green-400 shadow-sm' />
          </div>
        </div>

        <div className='text-center'>
          <h2 className='mb-1 text-xl font-semibold text-gray-900'>{profile.name ?? 'Unknown User'}</h2>
          {profile.username ? <p className='text-sm font-medium text-gray-500'>@{profile.username}</p> : null}
        </div>
      </div>

      {/* Content Section */}
      <div className='px-2 pb-8'>
        {/* Bio */}
        {profile.bio ? (
          <div className='mb-6 text-center'>
            <p className='text-sm leading-relaxed text-gray-600'>{profile.bio}</p>
          </div>
        ) : null}

        {profile.profile_contact ? (
          <div className='mb-6'>
            <div className='space-y-3 rounded-2xl bg-gray-100 p-5'>
              <h3 className='mb-3 text-xs font-medium uppercase tracking-wide text-gray-400'>
                Contact Information
              </h3>

              <div className='space-y-3'>
                {profile.profile_contact.email ? (
                  <div className='start flex gap-3'>
                    <Mail className='size-4 text-gray-400' />
                    <div>
                      <p className='text-xs uppercase tracking-wide text-gray-400'>Email</p>
                      <p className='line-clamp-1 text-sm font-medium text-gray-700'>
                        {profile.profile_contact.email}
                      </p>
                    </div>
                  </div>
                ) : null}

                {profile.profile_contact.phone ? (
                  <div className='start flex gap-3'>
                    <Phone className='size-4 text-gray-400' />
                    <div>
                      <p className='text-xs uppercase tracking-wide text-gray-400'>Phone</p>
                      <p className='text-sm font-medium text-gray-700'>{profile.profile_contact.phone}</p>
                    </div>
                  </div>
                ) : null}

                {profile.profile_contact.city || profile.profile_contact.country ? (
                  <div className='start flex gap-3'>
                    <MapPin className='size-4 text-gray-400' />
                    <div>
                      <p className='text-xs uppercase tracking-wide text-gray-400'>Location</p>
                      <p className='text-sm font-medium text-gray-700'>
                        {profile.profile_contact.city}
                        {profile.profile_contact.city && profile.profile_contact.country ? ', ' : null}
                        {profile.profile_contact.country}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className='flex gap-3'>
          <button
            className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-700 px-4 py-3 font-medium text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg active:scale-95'
            onClick={onOpenProfile}
          >
            <SquareArrowUpRight className='size-4' />
            User Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
