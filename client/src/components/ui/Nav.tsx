// app/(protected)/_components/Nav.tsx
'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SignOutButton } from '@/lib/SignOutButton'

export default function Nav() {
  return (
    <header className="h-12 px-4 border-b flex items-center justify-between">
      {/* Left side: brand + mobile menu */}
      <div className="flex items-center">
        {/* Mobile hamburger menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden mr-3">
            <button aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="pt-8 space-y-3">
            <Link href="/dashboard" prefetch={false} className="block py-2">
              Dashboard
            </Link>
            <SignOutButton />
          </SheetContent>
        </Sheet>

        {/* Brand link */}
        <Link href="/dashboard" prefetch={false} className="font-semibold">
          Web Crawler
        </Link>
      </div>

      {/* Right side: desktop actions */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/dashboard"
          prefetch={false}
          className="text-sm hover:underline"
        >
          Dashboard
        </Link>
        <SignOutButton />
      </div>
    </header>
  )
}
