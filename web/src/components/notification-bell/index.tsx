'use client';

import React, { useEffect, useState } from 'react';

import { Bell, FileText, MessageSquare, User, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { useSocket } from '@/hooks/useSocket';
import type { FacebookComment } from '@/types/api/facebook-comment';
import type { FacebookMessenger } from '@/types/api/facebook-messenger';
import type { FacebookPost } from '@/types/api/facebook-post';

type NotificationItem = {
  id: string;
  type: 'post' | 'message' | 'comment';
  title: string;
  content: string;
  timestamp: Date;
  data: FacebookPost | FacebookMessenger | FacebookComment;
  isNew?: boolean;
};

type NotificationBellProps = {
  className?: string;
};

const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const { data: session, status } = useSession();
  const { socket, isConnected, joinRoom } = useSocket({
    token: session?.accessToken ?? '',
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isAuthenticated] = useState(status === 'authenticated' && session?.accessToken);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [animatingBell, setAnimatingBell] = useState(false);

  // Animate bell when new notification arrives
  const animateBell = () => {
    setAnimatingBell(true);
    setTimeout(() => {
      setAnimatingBell(false);
    }, 600);
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    // Listen for Facebook data events from server
    socket.on('facebook_post.created', (data: FacebookPost) => {
      const newNotification: NotificationItem = {
        id: `post-${Date.now()}`,
        type: 'post',
        title: 'New Facebook Post',
        content: data.message?.substring(0, 100) ?? 'New post created',
        timestamp: new Date(),
        data,
        isNew: true,
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      animateBell();
    });

    socket.on('facebook_messenger.created', (data: FacebookMessenger) => {
      const newNotification: NotificationItem = {
        id: `message-${Date.now()}`,
        type: 'message',
        title: 'New Facebook Message',
        content: data.message.substring(0, 100),
        timestamp: new Date(),
        data,
        isNew: true,
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      animateBell();
    });

    socket.on('facebook_comment.created', (data: FacebookComment) => {
      const newNotification: NotificationItem = {
        id: `comment-${Date.now()}`,
        type: 'comment',
        title: 'New Facebook Comment',
        content: data.message?.substring(0, 100) ?? 'New comment added',
        timestamp: new Date(),
        data,
        isNew: true,
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      animateBell();
    });

    return () => {
      socket.off('facebook_post.created');
      socket.off('facebook_messenger.created');
      socket.off('facebook_comment.created');
    };
  }, [socket]);

  useEffect(() => {
    if (isConnected && isAuthenticated) {
      joinRoom('facebook-updates');
    }
  }, [isConnected, isAuthenticated, joinRoom]);

  // Close dropdown when clicking outside
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

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'post':
        return (
          <div className='flex size-8 items-center justify-center rounded-full bg-blue-400 shadow-sm'>
            <FileText className='size-4 text-white' />
          </div>
        );
      case 'message':
        return (
          <div className='flex size-8 items-center justify-center rounded-full bg-green-400 shadow-sm'>
            <MessageSquare className='size-4 text-white' />
          </div>
        );
      case 'comment':
        return (
          <div className='flex size-8 items-center justify-center rounded-full bg-purple-400 shadow-sm'>
            <User className='size-4 text-white' />
          </div>
        );
      default:
        return (
          <div className='flex size-8 items-center justify-center rounded-full bg-slate-400 shadow-sm'>
            <Bell className='size-4 text-white' />
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return 'Just now';
    }
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return `${days}d ago`;
  };

  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      setUnreadCount(0); // Mark as read when opening
      // Mark all notifications as read
      setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })));
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className='notification-dropdown relative'>
      <Button
        variant='outline'
        className={`group relative !rounded-full border border-slate-200 !bg-slate-50 !p-3 transition-all duration-200 hover:border-slate-300 hover:!bg-slate-100 ${className} ${
          animatingBell ? 'animate-pulse' : ''
        }`}
        onClick={handleBellClick}
      >
        <Bell
          className={`size-5 text-slate-600 transition-transform duration-200 group-hover:scale-110 ${
            animatingBell ? 'animate-bounce' : ''
          }`}
        />
        {unreadCount > 0 && (
          <span className='absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-xs font-medium text-white shadow-sm ring-2 ring-white'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isDropdownOpen ? (
        <div className='absolute right-0 top-full z-50 mt-2 w-80 transform duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'>
          <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg'>
            {/* Header */}
            <div className='border-b border-slate-200 bg-slate-50 px-4 py-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='flex size-6 items-center justify-center rounded-full bg-blue-400'>
                    <Bell className='size-3 text-white' />
                  </div>
                  <div>
                    <h3 className='font-medium text-slate-900'>Notifications</h3>
                    {unreadCount > 0 && <p className='text-xs text-slate-400'>{unreadCount} new updates</p>}
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  {notifications.length > 0 && (
                    <Button
                      className='h-7 px-2 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      size='sm'
                      variant='ghost'
                      onClick={clearAllNotifications}
                    >
                      Clear all
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

            {/* Notifications List */}
            <div className='max-h-80 overflow-y-auto'>
              {notifications.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-8'>
                  <div className='mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100'>
                    <Bell className='size-6 text-slate-400' />
                  </div>
                  <h3 className='mb-1 text-sm font-medium text-slate-900'>No notifications yet</h3>
                  <p className='text-xs text-slate-400'>New Facebook updates will appear here</p>
                </div>
              ) : (
                <div className='divide-y divide-slate-100'>
                  {notifications.slice(0, 8).map((notification) => (
                    <div
                      key={notification.id}
                      className={`group cursor-pointer px-4 py-3 transition-colors duration-150 hover:bg-slate-50 ${
                        notification.isNew ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        <div className='flex-shrink-0'>{getNotificationIcon(notification.type)}</div>
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center justify-between'>
                            <h4 className='text-sm font-medium text-slate-900'>{notification.title}</h4>
                            <span className='text-xs text-slate-400'>
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className='mt-1 line-clamp-2 text-sm text-slate-600'>{notification.content}</p>
                          {notification.data.profile ? (
                            <p className='mt-1 text-xs text-slate-400'>
                              From {notification.data.profile.name}
                            </p>
                          ) : null}
                          {notification.isNew ? (
                            <div className='mt-2 inline-flex items-center gap-1 rounded-full bg-blue-400 px-2 py-0.5 text-xs font-medium text-white'>
                              New
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length > 8 && (
                    <div className='bg-slate-50 px-4 py-3 text-center'>
                      <p className='text-sm text-slate-600'>
                        Showing 8 of {notifications.length} notifications
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationBell;
