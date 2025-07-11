"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, XCircle, CreditCard, Users, Edit, Utensils } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEventStore } from "@/lib/store"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { PaymentMethodsForm } from "@/components/payment-methods-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import createReport from 'docx-templates';
import libreoficce from 'libreoffice-convert';

const path = require('path');

export default function BudgetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const budgetId = params.budgetId as string
  const { getBudget, updateBudget, convertBudgetToEvent } = useEventStore()
  const budget = getBudget(budgetId)

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [eventId, setEventId] = useState<string | undefined>(undefined)

  if (!budget) {
    return (
      <div className="container max-w-screen-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center mb-8">
          <Link href="/orcamentos">
            <Button variant="outline" size="sm" className="h-9">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight ml-4">Orçamento não encontrado</h1>
        </div>
      </div>
    )
  }

  const handleAcceptBudget = () => {
    const newEventId = convertBudgetToEvent(budgetId)
    setConfirmDialogOpen(false)

    if (newEventId) {
      setEventId(newEventId)
      setPaymentDialogOpen(true)

      toast({
        title: "Orçamento aceito",
        description:
          "O orçamento foi convertido em evento com sucesso. Agora você pode adicionar métodos de pagamento.",
      })
    }
  }

  const handleRejectBudget = () => {
    updateBudget(budgetId, { ...budget, status: "rejected" })
    setRejectDialogOpen(false)

    toast({
      title: "Orçamento rejeitado",
      description: "O orçamento foi marcado como rejeitado.",
    })
  }

  const handlePaymentSuccess = () => {
    setPaymentDialogOpen(false)

    if (eventId) {
      router.push(`/events/${eventId}`)
    }
  }

  const handleEditBudget = () => {
    router.push(`/orcamentos/editar/${budgetId}`)
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100",
    accepted: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100",
    rejected: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100",
  }

  const statusLabels = {
    pending: "Pendente",
    accepted: "Aceito",
    rejected: "Rejeitado",
  }

  // Calcular o total de salários
  const totalSalaries = budget.people ? budget.people.reduce((sum, person) => sum + person.salary, 0) : 0

  
  const handleDownloadPdf = async () => {
    try {
      /* 1. carrega o template .docx */
      const resp = await fetch('template.docx')
      if (!resp.ok) throw new Error('template.docx não encontrado')
      const template = await resp.arrayBuffer()
  
      /* 2. monta os dados do orçamento */
      const data = {
        nome_cliente: budget.client.name,
        data_evento: format(new Date(budget.eventDate), 'dd/MM'),
        quantidade_pessoas: budget.peopleCount,
        valor_por_pessoa: (budget.value / budget.peopleCount).toFixed(2),
        valor_total: budget.value.toFixed(2),
        drinks: budget.menus?.flatMap((m) =>
          m.items.filter((i) => i.type === 'drink').map((i) => i.name)
        ) ?? [],
        pratos: budget.menus?.flatMap((m) =>
          m.items.filter((i) => i.type === 'food').map((i) => i.name)
        ) ?? [],
      }
  
      /* 3. gera o DOCX em RAM */
      const docxBuffer = await createReport({
        template,
        data,
        cmdDelimiter: ['{', '}'],
        processLineBreaks: true,
      })
  
      /* 4. converte DOCX → PDF usando WebViewer */
      const WebViewer = (await loadWebViewer()).default
      const hiddenDiv = document.createElement('div')
      hiddenDiv.style.display = 'none'
      document.body.appendChild(hiddenDiv)
  
      const { UI } = await WebViewer(
        { path: '/webviewer/lib', fullAPI: true, loadAsPDF: true },
        hiddenDiv
      )
  
      const pdfArrayBuffer = await UI.iframeWindow.Core.officeToPDF(
        new Blob([docxBuffer])
      )
  
      /* 5. baixa o PDF */
      const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' })
      saveAs(pdfBlob, `orcamento-${budgetId}.pdf`)
  
      document.body.removeChild(hiddenDiv)
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PDF.',
        variant: 'destructive',
      })
    }
  }


  return (
    <div className="container max-w-full mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center">
          <Link href="/orcamentos">
            <Button variant="outline" size="sm" className="h-9">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="ml-4">
            <h1 className="text-3xl font-bold tracking-tight">Orçamento para {budget.client.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={statusColors[budget.status]}>
                {statusLabels[budget.status]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Criado em {format(new Date(budget.createdAt), "PPP", { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>

        {budget.status === "pending" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={handleEditBudget}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>

            <Button variant="outline" size="sm" className="h-9" onClick={handleDownloadPdf}>
              <Edit className="mr-2 h-4 w-4" />
              Baixar Orçamento
            </Button>

            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeitar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rejeitar Orçamento</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja rejeitar este orçamento? Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleRejectBudget}>
                    Rejeitar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aceitar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aceitar Orçamento</DialogTitle>
                  <DialogDescription>
                    Ao aceitar este orçamento, ele será convertido em um evento. Deseja continuar?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAcceptBudget}>Aceitar e Criar Evento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {budget.status === "accepted" && budget.eventId && (
          <div className="flex gap-2">
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Métodos de Pagamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Métodos de Pagamento</DialogTitle>
                  <DialogDescription>Defina os métodos de pagamento para este evento.</DialogDescription>
                </DialogHeader>
                <PaymentMethodsForm eventId={budget.eventId} onSuccess={handlePaymentSuccess} />
              </DialogContent>
            </Dialog>

            <Link href={`/events/${budget.eventId}`}>
              <Button size="sm" className="h-9">
                Ver Evento
              </Button>
            </Link>
          </div>
        )}
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
                <dd className="mt-1">{budget.client.name}</dd>
              </div>
              {budget.client.document && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">CPF/CNPJ</dt>
                  <dd className="mt-1">{budget.client.document}</dd>
                </div>
              )}
              {budget.client.email && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1">{budget.client.email}</dd>
                </div>
              )}
              {budget.client.phone && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Telefone</dt>
                  <dd className="mt-1">{budget.client.phone}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-4">
            <CardTitle>Detalhes do Evento</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Data do Evento</dt>
                <dd className="mt-1">{format(new Date(budget.eventDate), "PPP", { locale: ptBR })}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Número de Pessoas</dt>
                <dd className="mt-1">{budget.peopleCount}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Valor Total</dt>
                <dd className="mt-1 text-xl font-semibold">R$ {budget.value.toFixed(2)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Cardápios */}
      {budget.menus && budget.menus.length > 0 && (
        <Card className="overflow-hidden mb-8">
          <CardHeader className="bg-muted/50 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Utensils className="mr-2 h-5 w-5" />
                Cardápios
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue={budget.menus[0].id} className="w-full">
              <TabsList className="w-full flex overflow-x-auto">
                {budget.menus.map((menu) => (
                  <TabsTrigger key={menu.id} value={menu.id} className="flex-1">
                    {menu.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {budget.menus.map((menu) => (
                <TabsContent key={menu.id} value={menu.id} className="mt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Pratos</h3>
                      {menu.items.filter((item) => item.type === "food").length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {menu.items
                                .filter((item) => item.type === "food")
                                .map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Nenhum prato cadastrado neste cardápio.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Bebidas</h3>
                      {menu.items.filter((item) => item.type === "drink").length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {menu.items
                                .filter((item) => item.type === "drink")
                                .map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Nenhuma bebida cadastrada neste cardápio.</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Seção de Pessoas */}
      <Card className="overflow-hidden mb-8">
        <CardHeader className="bg-muted/50 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Pessoas do Evento
            </CardTitle>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Total de Salários</p>
            <p className="text-lg font-semibold">R$ {totalSalaries.toFixed(2)}</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {budget.people && budget.people.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="text-right">Salário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budget.people.map((person, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell>{person.role}</TableCell>
                      <TableCell className="text-right">R$ {person.salary.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhuma pessoa cadastrada para este evento.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={paymentDialogOpen && !!eventId} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Adicionar Métodos de Pagamento</DialogTitle>
            <DialogDescription>
              O orçamento foi aceito! Agora defina os métodos de pagamento para este evento.
            </DialogDescription>
          </DialogHeader>
          {eventId && <PaymentMethodsForm eventId={eventId} onSuccess={handlePaymentSuccess} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
