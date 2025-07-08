'use client';

import React from 'react';

import type { BreadcrumbItem } from '@/components/content/breadcrumb';
import BreadcrumbContent from '@/components/content/breadcrumb';
import { PaginationProvider } from '@/contexts';

import type { PostCard } from '../post';

import CommentList from './comment-list';

import styles from './post-detail.module.scss';

type PostDetailProps = {
  onCheckedChange?: (checked: boolean) => void;
  breadcrumbItems: BreadcrumbItem[];
  selectedPost?: PostCard;
};

const PostDetail: React.FC<PostDetailProps> = ({ onCheckedChange, breadcrumbItems, selectedPost }) => {
  return (
    <PaginationProvider defaultValue={{ limit: 50 }}>
      <div className='flex size-full max-w-full flex-1 flex-col justify-between overflow-hidden'>
        <div className={styles.detailBreadcrumbContainer}>
          <BreadcrumbContent
            items={breadcrumbItems}
            labelClassName='text-xl-semibold'
          />
        </div>
        <div className={styles.detailContainer}>
          <CommentList
            image={selectedPost?.profile_picture_url}
            link={selectedPost?.link}
            status={selectedPost?.status}
            title={selectedPost?.title}
            onCheckedChange={onCheckedChange}
          />
        </div>
      </div>
    </PaginationProvider>
  );
};
export default PostDetail;
