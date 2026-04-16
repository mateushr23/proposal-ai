"use client";

import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  padding?: string;
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({
  children,
  padding = "p-6",
  hoverable = false,
  className = "",
  onClick,
}: GlassCardProps) {
  const hoverClasses = hoverable
    ? "transition-all duration-250 cursor-pointer hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
    : "";

  return (
    <div
      className={`glass-card ${padding} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
