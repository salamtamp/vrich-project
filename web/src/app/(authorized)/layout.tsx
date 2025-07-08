import Sidebar from '@/components/sidebar';
import { ModalProvider, PaginationProvider } from '@/contexts';
import AuthGuard from '@/guards/AuthGuard';
import type { NextJSChildren } from '@/types';

const AuthorizedLayout = ({ children }: NextJSChildren) => {
  return (
    <AuthGuard>
      <div className='flex h-screen w-screen gap-8 px-7 pb-7 pt-5'>
        <div className='my-2 ml-2'>
          <Sidebar />
        </div>
        <div className='mb-0 mr-2 mt-2 flex flex-1 flex-col overflow-hidden rounded-2xl'>
          <PaginationProvider>
            <ModalProvider>{children}</ModalProvider>
          </PaginationProvider>
        </div>
      </div>
    </AuthGuard>
  );
};

export default AuthorizedLayout;
