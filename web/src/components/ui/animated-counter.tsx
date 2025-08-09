'use client';

import React, { useEffect, useState } from 'react';

type AnimatedCounterProps = {
  start: number;
  end: number;
  duration?: number;
  className?: string;
};

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  start,
  end,
  duration = 2000,
  className,
}) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (time: number) => {
      startTime ??= time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - (1 - progress) ** 4;
      setCount(Math.round(start + (end - start) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [start, end, duration]);

  return <span className={className}>{count.toLocaleString()}</span>;
};
