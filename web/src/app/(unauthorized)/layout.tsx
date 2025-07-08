import PublicGuard from '@/guards/PublicGuard';
import type { NextJSChildren } from '@/types';

const UnauthorizedLayout = ({ children }: NextJSChildren) => {
  return (
    <PublicGuard>
      <div className='flex h-screen w-screen flex-col'>{children}</div>
    </PublicGuard>
  );
};

export default UnauthorizedLayout;
