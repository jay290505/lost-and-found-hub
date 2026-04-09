"use client";

import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";

const Confetti = () => {
  const [windowDimension, setDimension] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if(windowDimension.width === 0) return null;

  return (
    <ReactConfetti
      width={windowDimension.width}
      height={windowDimension.height}
      recycle={false}
      numberOfPieces={500}
      tweenDuration={5000}
    />
  );
};

export default Confetti;
