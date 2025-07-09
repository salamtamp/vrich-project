import { useCallback, useState } from 'react';

import Image from 'next/image';

import { User } from 'lucide-react';

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

const useImageWithFallback = () => {
  const { showFallback, handleImgError, resetFallback } = useImageFallback();
  const [imgLoading, setImgLoading] = useState(false);

  const handleImgLoadStart = useCallback(() => {
    setImgLoading(true);
  }, []);

  const handleImgLoad = useCallback(() => {
    setImgLoading(false);
  }, []);

  return {
    showFallback,
    handleImgError,
    resetFallback,
    imgLoading,
    handleImgLoadStart,
    handleImgLoad,
  };
};

type ImageWithFallbackProps = {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  fallbackIcon?: React.ReactNode;
  isValidImageUrl?: (url?: string) => boolean;
};

const defaultIsValidImageUrl = (url?: string) => {
  return !!url && /^https?:\/\//.test(url) && !url.includes('example.com');
};

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'profile',
  size = 40,
  className = '',
  style = {},
  fallbackIcon,
  isValidImageUrl = defaultIsValidImageUrl,
}) => {
  const { showFallback, handleImgError, imgLoading, handleImgLoadStart, handleImgLoad } =
    useImageWithFallback();

  if (!src || showFallback || !isValidImageUrl(src)) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gray-200 ${className}`}
        style={{ width: size, height: size, ...style }}
      >
        {fallbackIcon ?? <User size={size * 0.6} />}
      </div>
    );
  }

  return (
    <>
      {imgLoading ? (
        <div
          className={`flex items-center justify-center rounded-full bg-gray-200 ${className}`}
          style={{ width: size, height: size, ...style }}
        />
      ) : null}
      <Image
        alt={alt}
        className={`${className}${imgLoading ? 'hidden' : ''}`}
        height={size}
        src={src}
        style={{ borderRadius: '50%', ...style }}
        width={size}
        onError={handleImgError}
        onLoad={handleImgLoad}
        onLoadStart={handleImgLoadStart}
        onLoadingComplete={handleImgLoad}
      />
    </>
  );
};

export { useImageFallback, useImageWithFallback };
export default useImageFallback;
