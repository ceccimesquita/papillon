// components/auth-check.tsx
"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"

interface AuthCheckProps {
  children: React.ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login")
    }
    if (isAuthenticated && pathname === "/login") {
      router.push("/")
    }
  }, [isAuthenticated, router, pathname])

  // Se não autenticado e não na página de login, não renderiza nada (será redirecionado)
  if (!isAuthenticated && pathname !== "/login") {
    return null
  }

  // Se autenticado e tentando acessar /login, não renderiza nada (será redirecionado)
  if (isAuthenticated && pathname === "/login") {
    return null
  }

  // Caso contrário, renderiza os children normalmente
  return <>{children}</>
}