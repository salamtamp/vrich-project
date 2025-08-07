import Sidebar from '@/components/sidebar';
import { ModalProvider, NotificationProvider, PaginationProvider, SocketProvider } from '@/contexts';
import AuthGuard from '@/guards/AuthGuard';
import type { NextJSChildren } from '@/types';

const AuthorizedLayout = ({ children }: NextJSChildren) => {
  return (
    <AuthGuard>
      <SocketProvider>
        <NotificationProvider>
          <div className='flex h-screen w-screen'>
            <div className=''>
              <Sidebar />
            </div>
            <div className='flex flex-1 flex-col overflow-hidden rounded-2xl'>
              <PaginationProvider>
                <ModalProvider>{children}</ModalProvider>
              </PaginationProvider>
            </div>
          </div>
        </NotificationProvider>
      </SocketProvider>
    </AuthGuard>
  );
};

export default AuthorizedLayout;
