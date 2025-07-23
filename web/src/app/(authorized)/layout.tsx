import Sidebar from '@/components/sidebar';
import { ModalProvider, NotificationProvider, PaginationProvider, SocketProvider } from '@/contexts';
import AuthGuard from '@/guards/AuthGuard';
import type { NextJSChildren } from '@/types';

const AuthorizedLayout = ({ children }: NextJSChildren) => {
  return (
    <AuthGuard>
      <SocketProvider>
        <NotificationProvider>
          <div className='flex h-screen w-screen gap-8 px-7 pb-7 pt-5'>
            <div className=''>
              <Sidebar />
            </div>
            <div className='mb-0 mr-2 mt-2 flex flex-1 flex-col overflow-hidden rounded-2xl'>
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
