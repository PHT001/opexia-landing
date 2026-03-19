"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface LazyVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function LazyVideo({ src, className, style }: LazyVideoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      node.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <div ref={ref} className={className} style={style}>
      {visible && (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
