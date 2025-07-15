"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, PlusCircle, Settings, CreditCard, Users, Utensils, RefreshCw, BarChart } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { InsumoList } from "@/components/transaction-list"
import { useEventStore } from "@/lib/store"
import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DaysRemaining } from "@/components/days-remaining"
import { EditEventForm } from "@/components/edit-event-form"
import { AddBudgetForm } from "@/components/add-budget-form"
import { ExpensePieChart } from "@/components/expense-pie-chart"
import { BalanceLineChart } from "@/components/balance-line-chart"
import { SourcesList } from "@/components/sources-list"
import { EventStatusBadge } from "@/components/event-status-badge"
import { EventStatusSelector } from "@/components/event-status-selector"
import { PaymentMethodsForm } from "@/components/payment-methods-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SimplifiedExpenseForm } from "@/components/simplified-expense-form"
import { useClientStore } from "@/lib/client-store"
import { useToast } from "@/components/ui/use-toast"
import { EventSummary } from "@/components/event-summary"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const eventId = params.eventId as string

  // Obter o estado do store
  const { getEvent, getEventBalance, lastUpdate } = useEventStore()
  const { getClient } = useClientStore()

  // Estado local para forçar atualizações
  const [refreshKey, setRefreshKey] = useState(0)

  // Usar useEffect para observar mudanças no lastUpdate
  useEffect(() => {
    // Forçar atualização do componente quando lastUpdate mudar
    setRefreshKey((prev) => prev + 1)
  }, [lastUpdate])

  // Usar useMemo para evitar recálculos desnecessários
  const event = useMemo(() => getEvent(eventId), [eventId, getEvent, refreshKey])
  const balance = useMemo(() => getEventBalance(eventId), [eventId, getEventBalance, refreshKey])

  console.log(event)

  // Obter cliente associado ao evento
  const clientDetails = useMemo(() => {
    if (event?.cliente?.id) {
      return getClient(event.cliente.id)
    }
    return null
  }, [event, getClient, refreshKey])

  const [transactionOpen, setTransactionOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [paymentMethodsOpen, setPaymentMethodsOpen] = useState(false)

  // Função para forçar atualização manual
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
    toast({
      title: "Dados atualizados",
      description: "Os dados do evento foram atualizados com sucesso.",
    })
  }

  if (!event) {
    return (
      <div className="container max-w-screen-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="h-9">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight ml-4">Evento não encontrado</h1>
        </div>
      </div>
    )
  }

  // Calcular o total de salários
  const totalSalaries = event.funcionarios ? event.funcionarios.reduce((sum, person) => sum + person.valor, 0) : 0

  return (
    <div className="container max-w-screen-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="outline" size="sm" className="h-9">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="ml-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{event.nome}</h1>
              <EventStatusBadge status={event.status} />
              <Button variant="ghost" size="sm" onClick={handleRefresh} title="Atualizar dados">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <DaysRemaining eventDate={event.data} />
              <EventStatusSelector eventId={eventId} currentStatus={event.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-2">
            <CardDescription>Pagamentos</CardDescription>
            <CardTitle className="text-2xl text-blue-600">R$ {(event?.valor ?? 0) * (event?.qtdPessoas ?? 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-2">
            <CardDescription>Gastos</CardDescription>
            <CardTitle className="text-2xl text-red-600">R$ {balance.expenses.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-2">
            <CardDescription>Saldo</CardDescription>
            <CardTitle className={`text-2xl ${balance.total >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {(((event?.valor ?? 0) * (event?.qtdPessoas ?? 0)) - Number(balance.expenses)).toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Informações do cliente */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-4 flex flex-row items-center justify-between">
            <CardTitle>Informações do Cliente</CardTitle>
            {clientDetails && (
              <Link href={`/clientes/${clientDetails.id}`}>
                <Button variant="outline" size="sm">
                  Ver Perfil
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Nome</dt>
                <dd className="mt-1">{event.cliente.nome}</dd>
              </div>
              {(event.cliente.cpfCnpj || (clientDetails && clientDetails.document)) && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">CPF/CNPJ</dt>
                  <dd className="mt-1">{event.cliente.cpfCnpj || (clientDetails && clientDetails.document)}</dd>
                </div>
              )}
              {(event.cliente.email || (clientDetails && clientDetails.email)) && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1">{event.cliente.email || (clientDetails && clientDetails.email)}</dd>
                </div>
              )}
              {(event.cliente.telefone || (clientDetails && clientDetails.phone)) && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Telefone</dt>
                  <dd className="mt-1">{event.cliente.telefone || (clientDetails && clientDetails.phone)}</dd>
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
                        <dd className="mt-1">{format(new Date(event.data), "PPP", { locale: ptBR })}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Número de Pessoas</dt>
                        <dd className="mt-1">{event.data}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Valor Total</dt>
                        <dd className="mt-1 text-xl font-semibold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                          }).format((event?.valor ?? 0) * (event?.qtdPessoas ?? 0))}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
      </div>

      {/* Seção de Cardápios com Abas */}
{event.cardapios && (
  <Card className="overflow-hidden mb-8">
    <CardHeader className="bg-muted/50 pb-4">
      <div className="flex items-center">
        <Utensils className="mr-2 h-5 w-5" />
        <CardTitle>Cardápios</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="pt-6">
      <Tabs defaultValue="pratos" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="pratos">Pratos</TabsTrigger>
          <TabsTrigger value="bebidas">Bebidas</TabsTrigger>
        </TabsList>

        <TabsContent value="pratos" className="mt-4">
          {event.cardapios.some(menu => 
            menu.itens.some(item => item.tipo === "prato")
          ) ? (
            <div className="space-y-6">
              {event.cardapios.map((cardapio, cardapioIndex) => {
                const pratos = cardapio.itens.filter(item => item.tipo === "prato");
                return pratos.length > 0 ? (
                  <div key={`pratos-${cardapioIndex}`}>
                    <h3 className="text-lg font-medium mb-2">{cardapio.nome}</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Descrição</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pratos.map((prato, index) => (
                            <TableRow key={`prato-${cardapioIndex}-${index}`}>
                              <TableCell className="font-medium">{prato.nome}</TableCell>
                              <TableCell>{prato.descricao || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum prato cadastrado nos cardápios.</p>
          )}
        </TabsContent>

        <TabsContent value="bebidas" className="mt-4">
          {event.cardapios.some(menu => 
            menu.itens.some(item => item.tipo === "bebida")
          ) ? (
            <div className="space-y-6">
              {event.cardapios.map((cardapio, cardapioIndex) => {
                const bebidas = cardapio.itens.filter(item => item.tipo === "bebida");
                return bebidas.length > 0 ? (
                  <div key={`bebidas-${cardapioIndex}`}>
                    <h3 className="text-lg font-medium mb-2">{cardapio.nome}</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Descrição</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bebidas.map((bebida, index) => (
                            <TableRow key={`bebida-${cardapioIndex}-${index}`}>
                              <TableCell className="font-medium">{bebida.nome}</TableCell>
                              <TableCell>{bebida.descricao || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhuma bebida cadastrada nos cardápios.</p>
          )}
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
)}

      {/* Seção de Pessoas */}
      {event.funcionarios && event.funcionarios.length > 0 && (
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
                  {event.funcionarios.map((person, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{person.nome}</TableCell>
                      <TableCell>{person.funcao}</TableCell>
                      <TableCell className="text-right">R$ {person.valor.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="transactions" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
          </TabsList>

          <Dialog open={transactionOpen} onOpenChange={setTransactionOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Despesa</DialogTitle>
              </DialogHeader>
              <SimplifiedExpenseForm
                eventId={eventId}
                onSuccess={() => {
                  setTransactionOpen(false)
                  setRefreshKey((prev) => prev + 1)
                  toast({
                    title: "Despesa adicionada",
                    description: "A despesa foi adicionada com sucesso.",
                  })
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="transactions" className="mt-0">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle>Transações do Evento</CardTitle>
              <CardDescription>Visualize todas as transações realizadas.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <InsumoList eventId={eventId} key={`transaction-list-${refreshKey}`} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="sources" className="mt-0">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>Visualize todos os métodos de pagamento e suas transações.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <SourcesList eventId={eventId} key={`sources-list-${refreshKey}`} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-4">
                <CardTitle>Distribuição de Gastos por Destinatário</CardTitle>
                <CardDescription>Visualize como seus gastos estão distribuídos.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 h-[300px]">
                <ExpensePieChart eventId={eventId} key={`expense-chart-${refreshKey}`} />
              </CardContent>
            </Card>

            <Card className="md:col-span-2 overflow-hidden">
              <CardHeader className="bg-muted/50 pb-4">
                <CardTitle>Evolução do Saldo</CardTitle>
                <CardDescription>Acompanhe a evolução do saldo ao longo do tempo.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 h-[300px]">
                <BalanceLineChart eventId={eventId} key={`balance-chart-${refreshKey}`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="mt-0">
          <EventSummary eventId={eventId} key={`event-summary-${refreshKey}`} />
        </TabsContent> */}
      </Tabs>
    </div>
  )
}
