"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEventStore } from "@/lib/store"
import { EventList } from "@/components/event-list"
import { EventCalendar } from "@/components/event-calendar"
import { isToday, isFuture, isValid } from "date-fns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect } from "react"

export default function EventosRecentesPage() {
  const { events, fetchEvents } = useEventStore()

  // Carregar eventos ao montar o componente
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Filtrar e ordenar eventos
  const recentEvents = events
    .filter((event) => {
      try {
        const eventDate = new Date(event.data)
        if (!isValid(eventDate)) {
          console.warn(`Data inválida para evento ${event.id}: ${event.data}`)
          return false
        }
        return isToday(eventDate) || isFuture(eventDate)
      } catch (error) {
        console.error(`Erro ao processar evento ${event.id}:`, error)
        return false
      }
    })
    .sort((a, b) => {
      try {
        return new Date(a.data).getTime() - new Date(b.data).getTime()
      } catch (error) {
        console.error("Erro ao ordenar eventos:", error)
        return 0
      }
    })
    .slice(0, 5) // Pegar apenas os 5 eventos mais próximos

  return (
    <div className="container max-w-screen-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Eventos Recentes</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card de Próximos Eventos */}
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
              {(
                <EventList showPastEvents={false} />
              ) }
            </CardContent>
          </Card>
        </div>

        {/* Card do Calendário */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden h-full">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle>Calendário</CardTitle>
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