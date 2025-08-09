import { Sidebar, Topbar } from '@/components';

import {
  ModalProvider,
  NotificationProvider,
  PaginationProvider,
  SidebarProvider,
  SocketProvider,
} from '@/contexts';
import AuthGuard from '@/guards/AuthGuard';
import type { NextJSChildren } from '@/types';

const AuthorizedLayout = ({ children }: NextJSChildren) => {
  return (
    <AuthGuard>
      <SocketProvider>
        <NotificationProvider>
          <SidebarProvider>
            <div className='flex h-screen w-screen flex-1 flex-col overflow-hidden'>
              <Topbar />
              <div className='flex flex-1 overflow-hidden'>
                <Sidebar />
                <div className='flex-1 overflow-hidden pt-[56px]'>
                  <PaginationProvider>
                    <ModalProvider>{children}</ModalProvider>
                  </PaginationProvider>
                </div>
              </div>
            </div>
          </SidebarProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthGuard>
  );
};

export default AuthorizedLayout;
