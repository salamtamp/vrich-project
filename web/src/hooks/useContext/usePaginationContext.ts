import { useContext } from 'react';

import { PaginationContext } from '@/contexts';

const usePaginationContext = () => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error('usePaginationContext must be used within an PaginationProvider');
  }
  return context;
};

export default usePaginationContext;
