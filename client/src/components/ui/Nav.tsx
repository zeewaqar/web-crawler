'use client'
import { Menu } from 'lucide-react'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'

export default function Nav() {
  return (
    <header className="h-12 flex items-center px-4 border-b">
      <Sheet>
        <SheetTrigger className="md:hidden mr-3">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left">
          <a href="/dashboard" className="block py-2">Dashboard</a>
          <a href="/login" className="block py-2">Logout</a>
        </SheetContent>
      </Sheet>
      <h1 className="font-semibold">Web Crawler</h1>
    </header>
  )
}
