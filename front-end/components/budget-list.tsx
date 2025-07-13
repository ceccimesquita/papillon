"use client"

import { useRouter } from "next/navigation"
import { ChevronRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Budget } from "@/lib/store"

interface BudgetListProps {
  budgets: Budget[]
}

export function BudgetList({ budgets }: BudgetListProps) {
  const router = useRouter()

  if (budgets.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhum orçamento encontrado.</p>
      </div>
    )
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

  return (
    <div className="space-y-4">
      {budgets.map((budget) => (
        <div
          key={budget.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => router.push(`/orcamentos/id/${budget.id}`)}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{budget.cliente.nome}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={statusColors[budget.status]}>
                  {statusLabels[budget.status]}
                </Badge>
                
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">R$ {budget.valorPorPessoa.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{budget.quantidadePessoas} pessoas</p>
            </div>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
