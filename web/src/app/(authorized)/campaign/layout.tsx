import type { NextJSChildren } from '@/types';

const CampaignLayout = ({ children }: NextJSChildren) => {
  return <div className='size-full'>{children}</div>;
};

export default CampaignLayout;
