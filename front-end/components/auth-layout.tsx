// components/auth-layout.tsx
"use client"

import { useAuthStore } from "@/lib/auth-store"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isAuthenticated } = useAuthStore()
  const pathname = usePathname()

  if (!isAuthenticated || pathname === "/login") {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="w-full">
          <div className="flex-1 flex flex-col w-full">
            <main className="flex-1 pb-8 w-full">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}