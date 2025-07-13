"use client"

import { BudgetForm } from "@/components/budget-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EditBudgetPage() {
  const params = useParams()
  const budgetId = params.budgetId as string
  const [error, setError] = useState<string | null>(null)

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    // Rolar para o topo para mostrar o erro
    window.scrollTo(0, 0)
  }

  return (
    <div className="container max-w-full mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="flex items-center mb-8">
        <Link href={`/orcamentos/id/${budgetId}`}>
          <Button variant="outline" size="sm" className="h-9">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight ml-4">Editar Orçamento</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden w-full">
        <CardHeader className="bg-muted/50 pb-4">
          <CardTitle>Detalhes do Orçamento</CardTitle>
          <CardDescription>Edite as informações do orçamento.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <BudgetForm budgetId={budgetId} onError={handleError} />
        </CardContent>
      </Card>
    </div>
  )
}
