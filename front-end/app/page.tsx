import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { EventList } from "@/components/event-list"
import { EventCalendar } from "@/components/event-calendar"
import { OverallBalanceChart } from "@/components/overall-balance-chart"

export default function Home() {
  return (
    <div className="container max-w-screen-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Controle de Gastos de Eventos</h1>
        <div className="flex gap-2">
          <Link href="/orcamentos/novo">
            <Button size="sm" className="h-9">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-4">
            <CardTitle>Resumo Financeiro Geral</CardTitle>
            <CardDescription>Visão geral de todos os seus eventos.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <OverallBalanceChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-4">
              <div>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>Eventos atuais e futuros.</CardDescription>
              </div>
              <Link href="/historico">
                <Button variant="outline" size="sm" className="h-8">
                  Ver Histórico
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              <EventList showPastEvents={false} />
            </CardContent>
            <CardFooter className="border-t bg-muted/20 py-3">
              <p className="text-sm text-muted-foreground">
                Clique em um evento para ver detalhes ou crie um novo orçamento.
              </p>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-full">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle>Calendário de Eventos</CardTitle>
              <CardDescription>Visualize seus eventos no calendário.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex justify-center">
              <div className="w-full max-w-[300px]">
                <EventCalendar />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
