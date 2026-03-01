"use client"

import * as React from "react"
import { Bell } from "lucide-react"

import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"
import { SearchBar } from "@/components/ui/search-bar"
import { EtoroAuthButton, EtoroAuthButtonMobile } from "@/components/etoro-auth"

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

function Header({ className, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-[#0d1421]/95 backdrop-blur-sm",
        "border-b border-[#2a3a4d]",
        "pt-[env(safe-area-inset-top)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Logo size="sm" />

        {/* Search - hidden on mobile, shown on larger screens */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <SearchBar placeholder="Search stocks, crypto..." />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={cn(
              "p-2 rounded-full transition-colors",
              "text-[#8b9eb3] hover:text-white hover:bg-[#1a2332]"
            )}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          {/* eToro Auth - Desktop */}
          <div className="hidden md:block">
            <EtoroAuthButton />
          </div>
          {/* eToro Auth - Mobile */}
          <div className="md:hidden">
            <EtoroAuthButtonMobile />
          </div>
        </div>
      </div>

      {/* Mobile Search - shown only on mobile */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar placeholder="Search stocks, crypto..." />
      </div>
    </header>
  )
}

export { Header }
