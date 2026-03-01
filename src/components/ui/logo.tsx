import * as React from "react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg"
}

function Logo({ className, size = "default", ...props }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    default: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 font-bold text-white",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
        <span className="text-sm font-bold text-white">T</span>
      </div>
      <span>Tuval</span>
    </div>
  )
}

export { Logo }
