'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Bell, FileText, MessageSquare, User, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { API } from '@/constants/api.constant';
import { useNotificationContext } from '@/contexts';
import useRequest from '@/hooks/request/useRequest';
import { getRelativeTimeInThai } from '@/lib/utils';
import type { NotificationsApiResponse } from '@/types/api/api-response';
import type { FacebookComment } from '@/types/api/facebook-comment';
import type { FacebookInbox } from '@/types/api/facebook-inbox';
import type { FacebookPost } from '@/types/api/facebook-post';

type NotificationBellProps = {
  className?: string;
};

type NotificationData = FacebookPost | FacebookInbox | FacebookComment;

type NotificationClickHandler = {
  id: string;
  type: string;
  title: string;
  content: string;
  timestamp: Date;
  data: NotificationData;
  isNew?: boolean;
};

const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const { notifications, unreadCount, markAllAsRead, isAnimating, clearAllNotifications } =
    useNotificationContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayNotifications, setDisplayNotifications] = useState<NotificationClickHandler[]>([]);
  const [isClearing, setIsClearing] = useState(false);

  const {
    handleRequest,
    data,
    isLoading: getLoading,
  } = useRequest<NotificationsApiResponse>({
    request: {
      url: API.NOTIFICATIONS.GET_LAST,
      method: 'GET',
    },
  });

  const { handleRequest: handleClearRequest, isLoading: clearLoading } = useRequest({
    request: {
      url: API.NOTIFICATIONS.CLEAR,
      method: 'DELETE',
    },
  });

  const isLoading = getLoading || clearLoading;
  const router = useRouter();

  const apiNotifications = useMemo(() => {
    if (!data) {
      return [];
    }

    const transformed: NotificationClickHandler[] = [];

    data.posts?.forEach((post) => {
      transformed.push({
        id: `post-${post.id}`,
        type: 'post',
        title: 'Facebook Post',
        content: post.message?.substring(0, 100) ?? 'New post created',
        timestamp: new Date(post.published_at),
        data: post,
        isNew: false,
      });
    });

    data.messages?.forEach((message) => {
      transformed.push({
        id: `message-${message.id}`,
        type: 'message',
        title: 'Facebook Message',
        content: message.message?.substring(0, 100) ?? 'New message received',
        timestamp: new Date(message.created_at),
        data: message,
        isNew: false,
      });
    });

    data.comments?.forEach((comment) => {
      transformed.push({
        id: `comment-${comment.id}`,
        type: 'comment',
        title: 'Facebook Comment',
        content: comment.message?.substring(0, 100) ?? 'New comment added',
        timestamp: new Date(comment.created_at),
        data: comment,
        isNew: false,
      });
    });

    return transformed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [data]);

  const combinedNotifications = useMemo(() => {
    const contextIds = new Set(apiNotifications.map((n) => n.id));
    const newContextNotifications = notifications.filter((n) => !contextIds.has(n.id));
    return [...newContextNotifications, ...apiNotifications].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [apiNotifications, notifications]);

  useEffect(() => {
    if (!isClearing) {
      setDisplayNotifications(combinedNotifications);
    }
  }, [combinedNotifications, isClearing]);

  const handleGetNoti = useCallback(async () => {
    try {
      await handleRequest();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [handleRequest]);

  const handleClearAll = useCallback(async () => {
    if (isClearing || clearLoading) {
      return;
    }

    setIsClearing(true);
    try {
      await handleClearRequest();
      clearAllNotifications();
      setIsDropdownOpen(false);
      await handleRequest();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      setDisplayNotifications(combinedNotifications);
    } finally {
      setIsClearing(false);
    }
  }, [
    isClearing,
    clearLoading,
    handleClearRequest,
    clearAllNotifications,
    handleRequest,
    combinedNotifications,
  ]);

  const handleClearAllClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      void handleClearAll();
    },
    [handleClearAll]
  );

  useEffect(() => {
    void handleGetNoti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const getNotificationIcon = (type: string) => {
    const baseStyle = 'flex size-8 items-center justify-center rounded-full shadow-sm';
    switch (type) {
      case 'post':
        return (
          <div className={`${baseStyle} bg-blue-400`}>
            <FileText className='size-4 text-white' />
          </div>
        );
      case 'message':
        return (
          <div className={`${baseStyle} bg-green-400`}>
            <MessageSquare className='size-4 text-white' />
          </div>
        );
      case 'comment':
        return (
          <div className={`${baseStyle} bg-purple-400`}>
            <User className='size-4 text-white' />
          </div>
        );
      default:
        return (
          <div className={`${baseStyle} bg-slate-400`}>
            <Bell className='size-4 text-white' />
          </div>
        );
    }
  };

  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      markAllAsRead();
    }
  };

  const handleNotificationClick = (notification: NotificationClickHandler) => {
    if (notification.type === 'message') {
      router.push('/inbox');
    } else if (notification.type === 'post') {
      const post = notification.data as FacebookPost;
      if (post.link) {
        window.open(post.link, '_blank');
      }
    } else if (notification.type === 'comment') {
      const comment = notification.data as FacebookComment;
      if (comment.post?.link) {
        window.open(comment.post.link, '_blank');
      }
    }
  };

  const renderNotifications = () => {
    if (isLoading) {
      return (
        <div className='flex items-center justify-center py-8'>
          <div className='size-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-400' />
        </div>
      );
    }

    if (displayNotifications.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-8'>
          <div className='mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100'>
            <Bell className='size-6 text-slate-400' />
          </div>
          <h3 className='mb-1 text-sm font-medium text-slate-900'>No notifications yet</h3>
          <p className='text-xs text-slate-400'>New Facebook updates will appear here</p>
        </div>
      );
    }

    return (
      <div className='divide-y divide-slate-100'>
        {displayNotifications.slice(0, 8).map((notification) => {
          const isClickable =
            notification.type === 'message' ||
            (notification.type === 'post' && 'link' in notification.data && !!notification.data.link) ||
            (notification.type === 'comment' &&
              'post' in notification.data &&
              !!notification.data.post?.link);

          const NotificationContent = (
            <div className='flex items-start gap-3'>
              <div className='flex-shrink-0'>{getNotificationIcon(notification.type)}</div>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-sm font-medium text-slate-900'>{notification.title}</h4>
                  <span className='text-xs text-slate-400'>
                    {getRelativeTimeInThai(notification.timestamp)}
                  </span>
                </div>
                <p className='mt-1 line-clamp-2 text-sm text-slate-600'>{notification.content}</p>
                {notification.data.profile ? (
                  <p className='mt-1 text-xs text-slate-400'>From {notification.data.profile.name}</p>
                ) : null}
                {notification.isNew ? (
                  <div className='mt-2 inline-flex items-center gap-1 rounded-full bg-blue-400 px-2 py-0.5 text-xs font-medium text-white'>
                    New
                  </div>
                ) : null}
              </div>
            </div>
          );

          let itemClassName = 'group px-4 py-3 transition-colors duration-150';
          itemClassName += isClickable ? ' cursor-pointer hover:bg-slate-50' : ' cursor-default opacity-70';
          if (notification.isNew) {
            itemClassName += ' bg-blue-50/50';
          }

          return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              key={`${notification.id}-${crypto.randomUUID()}`}
              className={itemClassName}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onClick={
                isClickable
                  ? () => {
                      handleNotificationClick(notification);
                    }
                  : undefined
              }
              onKeyDown={
                isClickable
                  ? (e: React.KeyboardEvent<HTMLDivElement>) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleNotificationClick(notification);
                      }
                    }
                  : undefined
              }
            >
              {NotificationContent}
            </div>
          );
        })}
      </div>
    );
  };

  const effectiveUnreadCount = isClearing ? 0 : unreadCount;

  return (
    <div className='notification-dropdown relative'>
      <Button
        variant='outline'
        className={`group relative !rounded-full border border-slate-200 !bg-slate-50 !p-3 transition-all duration-200 hover:border-slate-300 hover:!bg-slate-100 ${className} ${
          isAnimating ? 'animate-pulse' : ''
        }`}
        onClick={handleBellClick}
      >
        <Bell
          className={`size-5 text-slate-600 transition-transform duration-200 group-hover:scale-110 ${
            isAnimating ? 'animate-bounce' : ''
          }`}
        />
        {effectiveUnreadCount > 0 && (
          <span className='absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-xs font-medium text-white shadow-sm ring-2 ring-white'>
            {effectiveUnreadCount > 99 ? '99+' : effectiveUnreadCount}
          </span>
        )}
      </Button>

      {isDropdownOpen ? (
        <div className='absolute right-0 top-full z-50 mt-2 w-80 transform duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'>
          <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg'>
            <div className='border-b border-slate-200 bg-slate-50 px-4 py-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='flex size-6 items-center justify-center rounded-full bg-blue-400'>
                    <Bell className='size-3 text-white' />
                  </div>
                  <div>
                    <h3 className='font-medium text-slate-900'>Notifications</h3>
                    {effectiveUnreadCount > 0 && (
                      <p className='text-xs text-slate-400'>{effectiveUnreadCount} new updates</p>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  {displayNotifications.length > 0 && (
                    <Button
                      className='h-7 px-2 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      disabled={isClearing || clearLoading}
                      size='sm'
                      variant='ghost'
                      onClick={handleClearAllClick}
                    >
                      {isClearing || clearLoading ? 'Clearing...' : 'Clear all'}
                    </Button>
                  )}
                  <Button
                    className='size-7 p-0 hover:bg-slate-100'
                    size='sm'
                    variant='ghost'
                    onClick={() => {
                      setIsDropdownOpen(false);
                    }}
                  >
                    <X className='size-3' />
                  </Button>
                </div>
              </div>
            </div>

            <div className='max-h-80 overflow-y-auto'>{renderNotifications()}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationBell;
