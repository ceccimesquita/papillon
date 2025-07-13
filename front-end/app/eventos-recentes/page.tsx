"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEventStore } from "@/lib/store"
import { EventList } from "@/components/event-list"
import { EventCalendar } from "@/components/event-calendar"
import { isToday, isFuture } from "date-fns"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EventosRecentesPage() {
  const { events } = useEventStore()

  // Filtrar apenas eventos futuros (hoje ou futuro)
  const futureEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    return isToday(eventDate) || isFuture(eventDate)
  })

  // Ordenar eventos por data (mais próximos primeiro)
  const sortedEvents = [...futureEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Pegar apenas os 5 eventos mais próximos
  const recentEvents = sortedEvents.slice(0, 5)

  return (
    <div className="container max-w-screen-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Eventos Recentes</h1>

      <div className="grid gap-6 lg:grid-cols-3">
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
              {recentEvents.length > 0 ? (
                <EventList eventsToShow={recentEvents} showPastEvents={false} />
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Nenhum evento futuro encontrado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
