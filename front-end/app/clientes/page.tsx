"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useClientStore } from "@/lib/client-store"
import { useEventStore } from "@/lib/store"
import { PlusCircle, Search, User, Phone, Mail, FileText } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { ClientForm } from "@/components/client-form"
import { Skeleton } from "@/components/ui/skeleton"

export default function ClientsPage() {
  const { clients, getAllClients, loading, error } = useClientStore()
  const { events } = useEventStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)

  // Load clients on initial render
  useEffect(() => {
    const loadClients = async () => {
      try {
        await getAllClients()
      } catch (err) {
        console.error("Failed to load clients:", err)
      }
    }
    
    loadClients()
  }, [getAllClients])

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients

    const term = searchTerm.toLowerCase().trim()
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        (client.email && client.email.toLowerCase().includes(term)) ||
        (client.phone && client.phone.toLowerCase().includes(term)) ||
        (client.document && client.document.toLowerCase().includes(term))
    )
  }, [clients, searchTerm])

  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredClients])

  if (loading && clients.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar clientes</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {error}
          </p>
          <Button onClick={() => getAllClients()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus clientes e veja seus eventos.</p>
        </div>

        <div className="flex gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar clientes..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha os dados do cliente abaixo.
                </DialogDescription>
              </DialogHeader>
              <ClientForm 
                onSuccess={() => {
                  setIsAddClientOpen(false)
                  getAllClients() // Refresh the list after adding
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {sortedClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchTerm
              ? "Não encontramos nenhum cliente com os termos da sua busca."
              : "Comece adicionando seu primeiro cliente."}
          </p>
          <Button onClick={() => setIsAddClientOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Cliente
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedClients.map((client) => {
            const clientEvents = events.filter(
              (event) => event.cliente?.id === client.id || client.events?.includes(event.id)
            )

            return (
              <Card key={client.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {client.name}
                  </CardTitle>
                  <CardDescription>
                    {clientEvents.length > 0
                      ? `${clientEvents.length} evento${clientEvents.length > 1 ? "s" : ""}`
                      : "Nenhum evento"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2 text-sm">
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                    )}
                    {client.document && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{client.document}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/clientes/${client.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}