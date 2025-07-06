import Link from 'next/link';

import { PATH } from '@/constants/path.constant';

const SignIn = () => {
  return (
    <div className='mt-[200px] flex size-full flex-col items-center'>
      <Link
        className='rounded-lg bg-gray-300 px-4 py-2'
        href={PATH.MESSAGE}
      >
        sign in
      </Link>
    </div>
  );
};

export default SignIn;
