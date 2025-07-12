import { useSocketContext } from '@/contexts';

// This hook is now deprecated. Use useSocketContext instead.
// Keeping for backward compatibility but it now just returns the socket context.
export const useSocket = () => {
  return useSocketContext();
};
