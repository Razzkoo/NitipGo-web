import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardHoverProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  hoverY?: number;
  onClick?: () => void;
}

export function CardHover({ 
  className, 
  children, 
  hoverScale = 1.02, 
  hoverY = -4,
  onClick 
}: CardHoverProps) {
  return (
    <motion.div
      whileHover={{ 
        scale: hoverScale, 
        y: hoverY,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "rounded-2xl bg-card p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}