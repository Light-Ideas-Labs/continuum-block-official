"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

const getStrength = (password: string) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
};

const STRENGTH_LABELS = ["Weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = [
  "bg-customgreys-darkerGrey",
  "bg-red-500",
  "bg-yellow-500",
  "bg-yellow-500",
  "bg-green-500",
];

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  className,
}) => {
  const strength = getStrength(password);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < strength ? STRENGTH_COLORS[strength] : "bg-customgreys-darkerGrey"
            )}
          />
        ))}
      </div>
      {password && (
        <p className="text-xs text-customgreys-dirtyGrey">
          {STRENGTH_LABELS[strength]}
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
