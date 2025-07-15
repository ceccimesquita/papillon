"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { TransactionList } from "@/components/transaction-list"
import { useEventStore } from "@/lib/store"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SimplifiedExpenseForm } from "@/components/simplified-expense-form"

export default function TopicPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const topicId = params.topicId as string
  const { getTopic, getTopicBalance } = useEventStore()
  const topic = getTopic(eventId, topicId)
  const balance = getTopicBalance(eventId, topicId)
  const [open, setOpen] = useState(false)

  if (!topic) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <Link href={`/events/${eventId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Evento
            </Button>
          </Link>
          <h1 className="text-3xl font-bold ml-4">Tópico não encontrado</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href={`/events/${eventId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Evento
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">{topic.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ganhos</CardDescription>
            <CardTitle className="text-2xl text-green-600">R$ {balance.income.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gastos</CardDescription>
            <CardTitle className="text-2xl text-red-600">R$ {balance.expenses.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo</CardDescription>
            <CardTitle className={`text-2xl ${balance.total >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {balance.total.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Transações do Tópico</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Transação</DialogTitle>
            </DialogHeader>
            <SimplifiedExpenseForm eventId={eventId} onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <TransactionList eventId={eventId} topicId={topicId} />
        </CardContent>
      </Card>
    </div>
  )
}
