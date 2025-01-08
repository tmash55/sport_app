"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

export const DotBackground = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      if (!ref.current) return;
      const { clientX, clientY } = ev;
      const { left, top } = ref.current.getBoundingClientRect();
      const x = clientX - left;
      const y = clientY - top;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  const { x, y } = mousePosition;

  return (
    <div
      ref={ref}
      className={cn(
        "h-full w-full bg-white dark:bg-black relative overflow-hidden",
        containerClassName
      )}
    >
      <motion.div
        className={cn("absolute inset-0 opacity-[0.03]", className)}
        style={{
          backgroundImage: `radial-gradient(circle at ${x}px ${y}px, #00FF00 0%, transparent 15%)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "-19px -19px",
        }}
      />
      <div className="absolute inset-0 bg-dot-white/[0.2] dark:bg-dot-black/[0.2]" />
      {children}
    </div>
  );
};
