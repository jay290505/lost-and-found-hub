"use client";

import { motion } from "framer-motion";
import Logo from "./logo";

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.2,
          duration: 0.8,
          type: "spring",
          stiffness: 100,
        }}
      >
        <Logo />
      </motion.div>
    </motion.div>
  );
}
