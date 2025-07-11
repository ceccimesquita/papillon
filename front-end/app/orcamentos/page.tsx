"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useEventStore } from "@/lib/store"
import { BudgetList } from "@/components/budget-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BudgetsPage() {
  const { budgets } = useEventStore()

  const pendingBudgets = budgets.filter((budget) => budget.status === "pending")
  const acceptedBudgets = budgets.filter((budget) => budget.status === "accepted")
  const rejectedBudgets = budgets.filter((budget) => budget.status === "rejected")

  return (
    <div className="container max-w-full mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
        <Link href="/orcamentos/novo">
          <Button size="sm" className="h-9">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pendentes ({pendingBudgets.length})</TabsTrigger>
          <TabsTrigger value="accepted">Aceitos ({acceptedBudgets.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitados ({rejectedBudgets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle>Orçamentos Pendentes</CardTitle>
              <CardDescription>Orçamentos que aguardam aprovação do cliente.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <BudgetList budgets={pendingBudgets} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accepted" className="mt-0">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle>Orçamentos Aceitos</CardTitle>
              <CardDescription>Orçamentos aprovados pelos clientes e convertidos em eventos.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <BudgetList budgets={acceptedBudgets} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-0">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle>Orçamentos Rejeitados</CardTitle>
              <CardDescription>Orçamentos que foram recusados pelos clientes.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <BudgetList budgets={rejectedBudgets} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
