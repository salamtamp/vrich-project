import type { NextJSChildren } from '@/types';

const UnauthorizedLayout = ({ children }: NextJSChildren) => {
  return <div className='flex h-screen w-screen flex-col'>{children}</div>;
};

export default UnauthorizedLayout;
