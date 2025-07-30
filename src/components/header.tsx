"use client"
import { Logo } from "@/components/icons/logo"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Logo className="h-8 w-8" />
          <span className="ml-2 font-headline text-lg font-bold">MarketMind</span>
        </div>
      </div>
    </header>
  )
}
