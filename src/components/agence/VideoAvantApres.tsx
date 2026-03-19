"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function VideoAvantApres() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Force video load on mobile (iOS/Safari block preload)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    const forceLoad = () => {
      video.play().then(() => {
        video.pause();
        video.currentTime = 0;
      }).catch(() => {});
    };
    if (video.readyState >= 2) {
      forceLoad();
    } else {
      video.addEventListener("loadeddata", forceLoad, { once: true });
    }
  }, []);

  // Scroll-driven video scrub
  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      const video = videoRef.current;
      if (!section || !video || !video.duration) return;

      const rect = section.getBoundingClientRect();
      const scrollableRange = rect.height - window.innerHeight;

      let prog = 0;
      if (rect.top <= 0 && rect.top >= -scrollableRange) {
        prog = Math.abs(rect.top) / scrollableRange;
      } else if (rect.top < -scrollableRange) {
        prog = 1;
      }

      prog = Math.min(Math.max(prog, 0), 1);
      video.currentTime = prog * video.duration;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-white"
      style={{ height: "200vh" }}
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <span className="inline-block text-sm font-semibold text-[#007AFF] uppercase tracking-wider mb-3">
              Transformation
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Avant <span className="text-[#9CA3AF]">/</span>{" "}
              <span className="text-[#007AFF]">Après</span>
            </h2>
            <p className="mt-4 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Du chaos digital à la clarté totale avec OpexIA
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex justify-center"
          >
            <div
              className="w-full max-w-2xl"
              style={{
                maskImage: 'radial-gradient(ellipse 80% 80% at center, black 50%, transparent 90%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at center, black 50%, transparent 90%)',
              }}
            >
              <video
                ref={videoRef}
                muted
                playsInline
                preload="auto"
                className="w-full h-auto"
              >
                <source src="/images/videoav.mp4" type="video/mp4" />
              </video>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
