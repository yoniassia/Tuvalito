"use client"

import * as React from "react"
import { Home, Star, PieChart, Compass, Wallet } from "lucide-react"

import { cn } from "@/lib/utils"

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "alpha", label: "Alpha", icon: PieChart, href: "/alpha" },
  { id: "watchlist", label: "Watchlist", icon: Star, href: "/watchlist" },
  { id: "discover", label: "Discover", icon: Compass, href: "/discover" },
  { id: "wallet", label: "Wallet", icon: Wallet, href: "/wallet" },
]

interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  activeItem?: string
}

function BottomNav({ className, activeItem = "home", ...props }: BottomNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-[#0d1421]/95 backdrop-blur-sm",
        "border-t border-[#2a3a4d]",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = activeItem === item.id
          const Icon = item.icon

          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center",
                "min-w-[60px] py-2 px-3 rounded-xl",
                "transition-all duration-200",
                isActive
                  ? "text-[#2ecc71]"
                  : "text-[#8b9eb3] hover:text-white"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-6 w-6 mb-1 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

export { BottomNav }
