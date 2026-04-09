"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link, LocateFixed } from "lucide-react";

type LogoProps = { dark?: boolean };

const Logo: React.FC<LogoProps> = ({ dark = false }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 8, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120 } },
  };

  const iconClass = dark ? "text-white" : "text-primary";
  const accentClass = dark ? "text-white" : "text-accent";
  const titleClass = dark ? "text-white" : "text-foreground";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center"
    >
      <motion.div className="flex items-center space-x-2" variants={itemVariants}>
        <LocateFixed className={`h-10 w-10 ${iconClass}`} />
        <Link className={`h-8 w-8 ${accentClass}`} />
      </motion.div>
      <motion.h1 className={`font-headline text-3xl font-bold tracking-tighter ${titleClass} sm:text-4xl`} variants={itemVariants}>
        Lost & Found
      </motion.h1>
    </motion.div>
  );
};

export default Logo;
 
