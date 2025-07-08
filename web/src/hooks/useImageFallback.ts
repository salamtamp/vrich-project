import { useCallback, useState } from 'react';

const useImageFallback = () => {
  const [showFallback, setShowFallback] = useState(false);

  const handleImgError = useCallback(() => {
    setShowFallback(true);
  }, []);

  const resetFallback = useCallback(() => {
    setShowFallback(false);
  }, []);

  return { showFallback, handleImgError, resetFallback };
};

export default useImageFallback;
