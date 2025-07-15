"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, XCircle, CreditCard, Users, Edit, Utensils } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Budget, useEventStore } from "@/lib/store"
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
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { PaymentMethodsForm } from "@/components/payment-methods-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BudgetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const budgetId = params.budgetId as string
  const { getBudget, updateBudget, updateBudgetStatus } = useEventStore()
  const [budget, setBudget] = useState<Budget | undefined>(undefined)

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  useEffect(() => {
  const fetchBudget = async () => {
    const data = await getBudget(budgetId)
    console.log("Fetched budget:", data)
    setBudget(data)
  }

  fetchBudget()
}, [budgetId, getBudget]) 

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

  const handleAcceptBudget = async () => {
    try {
      await updateBudgetStatus(budgetId, 'ACEITO')
      setConfirmDialogOpen(false)
      
      toast({
        title: "Orçamento aceito",
        description: "O orçamento foi marcado como aceito com sucesso.",
      })
      
      // Se houver eventId, redireciona para a página do evento
      if (budget.eventId) {
        router.push(`/events/${budget.eventId}`)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao aceitar o orçamento.",
        variant: "destructive"
      })
    }
  }

  const handleRejectBudget = async () => {
    try {
      await updateBudgetStatus(budgetId, 'RECUSADO')
      setRejectDialogOpen(false)
      
      toast({
        title: "Orçamento rejeitado",
        description: "O orçamento foi marcado como rejeitado.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao rejeitar o orçamento.",
        variant: "destructive"
      })
    }
  }

  const handleEditBudget = () => {
    router.push(`/orcamentos/editar/${budgetId}`)
  }

  const statusColors = {
    PENDENTE: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100",
    ACEITO: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100",
    RECUSADO: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100",
  }

  const statusLabels = {
    PENDENTE: "PENDENTE",
    ACEITO: "ACEITO",
    RECUSADO: "RECUSADO",
  }

  // Calcular o total de valores dos funcionários
  const totalFuncionarios = budget.funcionarios.reduce((sum, func) => sum + func.valor, 0)

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
            <h1 className="text-3xl font-bold tracking-tight">Orçamento para {budget.cliente.nome}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={statusColors[budget.status]}>
                {statusLabels[budget.status]}
              </Badge>
            </div>
          </div>
        </div>

        {budget.status === "PENDENTE" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={handleEditBudget}>
              <Edit className="mr-2 h-4 w-4" />
              Baixar PDF
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
                    Ao aceitar este orçamento, ele será marcado como aceito. Deseja continuar?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAcceptBudget}>Aceitar Orçamento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {budget.status === "ACEITO" && budget.eventId && (
          <div className="flex gap-2">
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
                <dd className="mt-1">{budget.cliente.nome}</dd>
              </div>
              {budget.cliente.cpfCnpj && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">CPF/CNPJ</dt>
                  <dd className="mt-1">{budget.cliente.cpfCnpj}</dd>
                </div>
              )}
              {budget.cliente.email && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1">{budget.cliente.email}</dd>
                </div>
              )}
              {budget.cliente.telefone && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Telefone</dt>
                  <dd className="mt-1">{budget.cliente.telefone}</dd>
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
                <dd className="mt-1">{format(new Date(budget.dataDoEvento), "PPP", { locale: ptBR })}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Número de Pessoas</dt>
                <dd className="mt-1">{budget.quantidadePessoas}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Valor Total</dt>
                <dd className="mt-1 text-xl font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  }).format(budget.valorTotal)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {budget.cardapios && budget.cardapios.length > 0 && (
  <Card className="overflow-hidden mb-8">
    <CardHeader className="bg-muted/50 pb-4 flex flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center">
          <Utensils className="mr-2 h-5 w-5" />
          Cardápios
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent className="pt-6 space-y-10">
      {/* Pratos */}
      <div>
        <h3 className="text-lg font-medium mb-4">Pratos</h3>
        {budget.cardapios.filter(item => item.tipo === "prato").length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.cardapios
                  .filter(item => item.tipo === "prato")
                  .map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum prato cadastrado.</p>
        )}
      </div>

      {/* Bebidas */}
      <div>
        <h3 className="text-lg font-medium mb-4">Bebidas</h3>
        {budget.cardapios.filter(item => item.tipo === "bebida").length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.cardapios
                  .filter(item => item.tipo === "bebida")
                  .map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma bebida cadastrada.</p>
        )}
      </div>
    </CardContent>
  </Card>
)}


      {/* Seção de Funcionários */}
      <Card className="overflow-hidden mb-8">
        <CardHeader className="bg-muted/50 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Funcionários do Evento
            </CardTitle>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Total de Valores</p>
            <p className="text-lg font-semibold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL"
              }).format(totalFuncionarios)}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {budget.funcionarios.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budget.funcionarios.map((funcionario, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{funcionario.nome}</TableCell>
                      <TableCell>{funcionario.funcao}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL"
                        }).format(funcionario.valor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum funcionário cadastrado para este evento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}