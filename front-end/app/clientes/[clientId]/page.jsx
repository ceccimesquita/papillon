"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Mail, Phone, FileText, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useClientDetailsStore } from "@/lib/client-store"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.clientId 
  const { clientDetails, loadClientDetails, loading, error } = useClientDetailsStore()

  useEffect(() => {
    loadClientDetails(Number(clientId))
  }, [clientId, loadClientDetails])

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  if (error || !clientDetails) {
    return (
      <div className="p-6">
        <p className="text-red-500">Erro: {error || "Cliente não encontrado."}</p>
        <Link href="/clientes">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container max-w-full mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="flex items-center mb-8">
        <Link href="/clientes">
          <Button variant="outline" size="sm" className="h-9">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight ml-4">{clientDetails.nome}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {clientDetails.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{clientDetails.email}</span>
              </div>
            )}
            {clientDetails.telefone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{clientDetails.telefone}</span>
              </div>
            )}
            {clientDetails.cpfCnpj && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{clientDetails.cpfCnpj}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos Relacionados</CardTitle>
            <CardDescription>Lista de eventos associados ao cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientDetails.eventos.length === 0 ? (
              <p className="text-muted-foreground">Nenhum evento associado.</p>
            ) : (
              clientDetails.eventos.map((evento,index) => (
                <Link href={`/events/${evento.name}`} key={index}  className="block">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{evento.nome}</h3>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {evento.status === "completed" ? "Concluído" : "Em andamento"}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
