"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AgenceStickyMobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden"
        >
          <motion.a
            href="https://wa.me/33758803717?text=Bonjour%20!%20Je%20suis%20int%C3%A9ress%C3%A9%20par%20un%20audit%20IA%20gratuit."
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center rounded-full bg-[#007AFF] px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(0,122,255,0.5),0_0_40px_rgba(0,122,255,0.25)]"
          >
            Audit gratuit
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
