'use client';

import { Bell, FileText, MessageSquare, User } from 'lucide-react';

import { useNotificationContext } from '@/contexts';

const Notification = () => {
  const { notifications } = useNotificationContext();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className='size-4 text-blue-500' />;
      case 'message':
        return <MessageSquare className='size-4 text-green-500' />;
      case 'comment':
        return <User className='size-4 text-purple-500' />;
      default:
        return <Bell className='size-4 text-gray-500' />;
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

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Notifications</h1>
        <p className='text-gray-600'>Total Notifications: {notifications.length}</p>
      </div>

      {notifications.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12'>
          <Bell className='mb-4 size-12 text-gray-400' />
          <p className='text-lg text-gray-500'>No notifications yet</p>
          <p className='text-sm text-gray-400'>New Facebook updates will appear here</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
            >
              <div className='flex items-start space-x-3'>
                <div className='mt-1 flex-shrink-0'>{getNotificationIcon(notification.type)}</div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-medium text-gray-900'>{notification.title}</h3>
                    <span className='text-xs text-gray-500'>{formatTimestamp(notification.timestamp)}</span>
                  </div>
                  <p className='mt-1 text-sm text-gray-600'>{notification.content}</p>
                  {notification.data.profile ? (
                    <p className='mt-2 text-xs text-gray-500'>From: {notification.data.profile.name}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notification;
