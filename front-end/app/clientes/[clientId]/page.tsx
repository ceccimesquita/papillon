"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2, Mail, Phone, FileText, Calendar } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useClientStore } from "@/lib/client-store"
import { useEventStore } from "@/lib/store"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { ClientForm } from "@/components/client-form"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const clientId = params.clientId as string
  const { getClient, deleteClient } = useClientStore()
  const { getEvent } = useEventStore()
  const client = getClient(clientId)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Obter eventos do cliente
  const clientEvents = client?.events.map((eventId) => getEvent(eventId)).filter(Boolean) || []

  const handleDeleteClient = () => {
    if (client) {
      deleteClient(clientId)
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      })
      router.push("/clientes")
    }
  }

  if (!client) {
    return (
      <div className="container max-w-full mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center mb-8">
          <Link href="/clientes">
            <Button variant="outline" size="sm" className="h-9">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight ml-4">Cliente não encontrado</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-full mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center">
          <Link href="/clientes">
            <Button variant="outline" size="sm" className="h-9">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight ml-4">{client.name}</h1>
        </div>

        <div className="flex gap-2">
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Cliente</DialogTitle>
              </DialogHeader>
              <ClientForm clientId={clientId} onSuccess={() => setEditDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-red-600 hover:text-red-700 hover:bg-red-100">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir Cliente</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDeleteClient}>
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-4">
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Nome</dt>
                <dd className="mt-1">{client.name}</dd>
              </div>
              {client.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <dt className="sr-only">Email</dt>
                  <dd>{client.email}</dd>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <dt className="sr-only">Telefone</dt>
                  <dd>{client.phone}</dd>
                </div>
              )}
              {client.document && (
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <dt className="sr-only">CPF/CNPJ</dt>
                  <dd>{client.document}</dd>
                </div>
              )}
              {client.notes && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Observações</dt>
                  <dd className="mt-1 whitespace-pre-line">{client.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-4">
            <CardTitle>Eventos do Cliente</CardTitle>
            <CardDescription>Histórico de eventos relacionados a este cliente.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {clientEvents.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Este cliente ainda não possui eventos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`} className="block">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{event.name}</h3>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(event.date), "PPP", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`font-medium ${event.status === "completed" ? "text-green-600" : "text-blue-600"}`}
                      >
                        {event.status === "completed" ? "Concluído" : "Em andamento"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
