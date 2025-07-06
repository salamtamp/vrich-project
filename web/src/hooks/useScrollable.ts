import { useEffect, useRef, useState } from 'react';

export function useScrollable<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isScrollable, setIsScrollable] = useState<boolean | undefined>();

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const checkScroll = () => {
      setIsScrollable(el.scrollHeight > el.clientHeight);
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return { ref, isScrollable };
}
