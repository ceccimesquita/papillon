import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverallBalanceChart } from "@/components/overall-balance-chart"
import { OverallExpensePieChart } from "@/components/overall-expense-pie-chart"

export default function ResumoPage() {
  return (
    <div className="container max-w-screen-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Resumo Financeiro</h1>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-4">
            <CardTitle>Distribuição de Gastos</CardTitle>
            <CardDescription>Visão geral de todos os seus gastos por destinatário.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[300px]">
            <OverallExpensePieChart />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 overflow-hidden">
          <CardHeader className="bg-muted/50 pb-4">
            <CardTitle>Balanço Geral</CardTitle>
            <CardDescription>Resumo financeiro de todos os eventos.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[300px]">
            <OverallBalanceChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
