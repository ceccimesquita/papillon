"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Calendar, Clock, Download, FileText, Home, LogOut, PieChart, Upload, Users } from "lucide-react"
import { useState } from "react"
import { ImportEventsDialog } from "./import-events-dialog"
import { ExportEventsDialog } from "./export-events-dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/lib/auth-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex h-16 items-center px-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              {/* <PieChart className="h-6 w-6 text-primary" />
              <span className="text-primary">Papillon</span> */}
              <img src="logo.png" alt="logo" />
            </Link>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Início">
                <Link href="/" className="flex items-center gap-3">
                  <Home className="h-5 w-5" />
                  <span>Início</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/orcamentos")} tooltip="Orçamentos">
                <Link href="/orcamentos" className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <span>Orçamentos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/clientes")} tooltip="Clientes">
                <Link href="/clientes" className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span>Clientes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/resumo"} tooltip="Resumo Financeiro">
                <Link href="/resumo" className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  <span>Resumo Financeiro</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/eventos-recentes"} tooltip="Eventos Recentes">
                <Link href="/eventos-recentes" className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <span>Eventos Recentes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/historico"} tooltip="Histórico">
                <Link href="/historico" className="flex items-center gap-3">
                  <Clock className="h-5 w-5" />
                  <span>Histórico</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarSeparator className="my-4" />

          <div className="px-4 py-2">
            <h3 className="text-xs font-medium text-muted-foreground">Importar/Exportar</h3>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setImportDialogOpen(true)} tooltip="Importar Eventos">
                <Upload className="h-5 w-5 mr-3" />
                <span>Importar Eventos</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setExportDialogOpen(true)} tooltip="Exportar Eventos">
                <Download className="h-5 w-5 mr-3" />
                <span>Exportar Eventos</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0) || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">{user?.name || "Administrador"}</span>
                      <span className="text-xs text-muted-foreground">{user?.email || "admin@papillon.com"}</span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem disabled className="flex flex-col items-start">
                  <span className="font-medium">{user?.name || "Administrador"}</span>
                  <span className="text-xs text-muted-foreground">{user?.email || "admin@papillon.com"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>

      <ImportEventsDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
      <ExportEventsDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />
    </>
  )
}
