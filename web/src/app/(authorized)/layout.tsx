import Sidebar from '@/components/sidebar';
import { PaginationProvider } from '@/contexts';
import type { NextJSChildren } from '@/types';

const AuthorizedLayout = ({ children }: NextJSChildren) => {
  return (
    <div className='flex h-screen w-screen gap-8 px-7 pb-7 pt-5'>
      <div className='my-2 ml-2'>
        <Sidebar />
      </div>
      <div className='mb-0 mr-2 mt-2 flex flex-1 flex-col rounded-2xl'>
        <PaginationProvider>{children}</PaginationProvider>
      </div>
    </div>
  );
};

export default AuthorizedLayout;
