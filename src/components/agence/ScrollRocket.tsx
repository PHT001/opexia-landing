"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function ScrollRocket() {
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 25,
    mass: 0.8,
  });

  // Rocket moves from bottom to top
  const rocketY = useTransform(smoothProgress, [0, 1], ["90vh", "-15vh"]);

  // Gentle horizontal sway
  const rocketX = useTransform(
    smoothProgress,
    [0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88, 1],
    ["0px", "40px", "-30px", "35px", "-25px", "30px", "-35px", "20px", "0px"]
  );

  // Slight tilt following direction
  const rocketRotate = useTransform(
    smoothProgress,
    [0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88, 1],
    [0, 4, -3, 3.5, -2, 3, -3.5, 2, 0]
  );

  // Visible opacity
  const rocketOpacity = useTransform(
    smoothProgress,
    [0, 0.02, 0.88, 1],
    [0, 0.7, 0.7, 0]
  );

  // Scale pulse
  const rocketScale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [1.2, 1.5, 1.3]
  );

  // Flame intensity
  const flameScale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [1, 1.3, 1]
  );

  // Trail length grows as you scroll more
  const trailHeight = useTransform(
    smoothProgress,
    [0, 0.1, 0.5, 1],
    [50, 120, 200, 150]
  );

  const trailOpacity = useTransform(
    smoothProgress,
    [0, 0.03, 0.88, 1],
    [0, 0.6, 0.6, 0]
  );

  return (
    <motion.div
      className="fixed pointer-events-none z-[2] hidden lg:block"
      style={{
        top: 0,
        right: "12%",
        x: rocketX,
        y: rocketY,
        rotate: rocketRotate,
        opacity: rocketOpacity,
        scale: rocketScale,
      }}
    >
      {/* Trail behind the rocket */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: 130,
          width: 6,
          height: trailHeight,
          opacity: trailOpacity,
          background: "linear-gradient(to bottom, rgba(255,165,0,0.6), rgba(0,122,255,0.3), transparent)",
          borderRadius: "0 0 50% 50%",
          filter: "blur(4px)",
        }}
      />

      {/* Glow orb behind rocket */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 120,
          height: 120,
          background: "radial-gradient(circle, rgba(0,122,255,0.25) 0%, rgba(0,122,255,0.08) 50%, transparent 70%)",
          filter: "blur(15px)",
        }}
      />

      {/* Rocket SVG */}
      <svg
        width="110"
        height="195"
        viewBox="0 0 64 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 0 25px rgba(0,122,255,0.6)) drop-shadow(0 5px 40px rgba(255,165,0,0.3))" }}
      >
        {/* Rocket body */}
        <path
          d="M32 4C32 4 12 30 12 60C12 80 18 95 32 95C46 95 52 80 52 60C52 30 32 4 32 4Z"
          fill="url(#bodyGrad)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="0.5"
        />

        {/* Nose cone highlight */}
        <path
          d="M32 4C32 4 22 24 20 45C20 45 32 20 38 45C35 24 32 4 32 4Z"
          fill="rgba(255,255,255,0.18)"
        />

        {/* Window ring */}
        <circle cx="32" cy="45" r="9" fill="url(#winOuter)" />
        <circle cx="32" cy="45" r="7" fill="url(#winInner)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
        {/* Window glare */}
        <ellipse cx="29.5" cy="42.5" rx="3" ry="2.2" fill="rgba(255,255,255,0.45)" />

        {/* Accent stripes */}
        <rect x="21" y="64" width="22" height="3.5" rx="1.75" fill="#007AFF" opacity="0.85" />
        <rect x="23" y="71" width="18" height="2.5" rx="1.25" fill="#007AFF" opacity="0.5" />

        {/* Left fin */}
        <path d="M12 75C12 75 1 92 3 102L12 93Z" fill="url(#finGrad)" />
        {/* Right fin */}
        <path d="M52 75C52 75 63 92 61 102L52 93Z" fill="url(#finGrad)" />

        {/* Nozzle */}
        <path d="M26 92L32 101L38 92Z" fill="#4a5568" />
        <ellipse cx="32" cy="95" rx="7" ry="2.5" fill="#2d3748" />

        {/* Flames */}
        <motion.g style={{ scale: flameScale, originX: "32px", originY: "95px" }}>
          {/* Outer flame */}
          <path d="M24 96C24 96 19 118 32 125C45 118 40 96 40 96" fill="url(#flOuter)" opacity="0.9">
            <animate attributeName="d" values="M24 96C24 96 19 118 32 125C45 118 40 96 40 96;M24 96C24 96 17 115 32 122C47 115 40 96 40 96;M24 96C24 96 19 118 32 125C45 118 40 96 40 96" dur="0.25s" repeatCount="indefinite" />
          </path>
          {/* Mid flame */}
          <path d="M27 96C27 96 23 113 32 118C41 113 37 96 37 96" fill="url(#flMid)" opacity="0.95">
            <animate attributeName="d" values="M27 96C27 96 23 113 32 118C41 113 37 96 37 96;M27 96C27 96 22 110 32 115C42 110 37 96 37 96;M27 96C27 96 23 113 32 118C41 113 37 96 37 96" dur="0.18s" repeatCount="indefinite" />
          </path>
          {/* Inner flame */}
          <path d="M29 96C29 96 27 107 32 111C37 107 35 96 35 96" fill="url(#flIn)">
            <animate attributeName="d" values="M29 96C29 96 27 107 32 111C37 107 35 96 35 96;M29 96C29 96 26 105 32 109C38 105 35 96 35 96;M29 96C29 96 27 107 32 111C37 107 35 96 35 96" dur="0.12s" repeatCount="indefinite" />
          </path>
        </motion.g>

        {/* Sparks / particles */}
        <circle cx="26" cy="115" r="1.8" fill="#FFA500" opacity="0.5">
          <animate attributeName="cy" values="115;132" dur="0.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0" dur="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="38" cy="117" r="1.3" fill="#FF6B00" opacity="0.4">
          <animate attributeName="cy" values="117;135" dur="0.7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0" dur="0.7s" repeatCount="indefinite" />
        </circle>
        <circle cx="32" cy="120" r="1.5" fill="#FFD700" opacity="0.45">
          <animate attributeName="cy" values="120;138" dur="0.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.45;0" dur="0.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="30" cy="113" r="1" fill="#fff" opacity="0.3">
          <animate attributeName="cy" values="113;128" dur="0.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0" dur="0.6s" repeatCount="indefinite" />
        </circle>

        <defs>
          <linearGradient id="bodyGrad" x1="18" y1="4" x2="46" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f0f4f8" />
            <stop offset="0.3" stopColor="#dce4ef" />
            <stop offset="0.7" stopColor="#c5cfe0" />
            <stop offset="1" stopColor="#a8b8cc" />
          </linearGradient>
          <radialGradient id="winOuter" cx="32" cy="45" r="9" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#007AFF" />
            <stop offset="1" stopColor="#003d80" />
          </radialGradient>
          <radialGradient id="winInner" cx="32" cy="45" r="7" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00d4ff" />
            <stop offset="0.5" stopColor="#007AFF" />
            <stop offset="1" stopColor="#002855" />
          </radialGradient>
          <linearGradient id="finGrad" x1="0" y1="75" x2="0" y2="102" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#007AFF" />
            <stop offset="1" stopColor="#0050c8" />
          </linearGradient>
          <linearGradient id="flOuter" x1="32" y1="96" x2="32" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FF6B00" />
            <stop offset="0.5" stopColor="#FF4500" />
            <stop offset="1" stopColor="#FF0000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flMid" x1="32" y1="96" x2="32" y2="118" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFD700" />
            <stop offset="0.6" stopColor="#FFA500" />
            <stop offset="1" stopColor="#FF6B00" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flIn" x1="32" y1="96" x2="32" y2="111" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.4" stopColor="#FFF8DC" />
            <stop offset="1" stopColor="#FFD700" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
