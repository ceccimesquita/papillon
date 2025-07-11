"use client"

import { useEventStore } from "@/lib/store"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import type { Event } from "@/lib/store"
import { isPast, isToday } from "date-fns"

interface EventListProps {
  eventsToShow?: Event[]
  showPastEvents?: boolean
}

export function EventList({ eventsToShow, showPastEvents = false }: EventListProps) {
  const { events: allEvents } = useEventStore()
  let events = eventsToShow || allEvents

  // Filtrar eventos com base no parâmetro showPastEvents
  events = events.filter((event) => {
    const eventDate = new Date(event.date)
    const isPastEvent = isPast(eventDate) && !isToday(eventDate)

    // Se showPastEvents for true, mostrar apenas eventos passados
    // Se showPastEvents for false, mostrar apenas eventos futuros (hoje ou futuro)
    return showPastEvents ? isPastEvent : !isPastEvent
  })

  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          {showPastEvents
            ? "Nenhum evento passado encontrado."
            : "Nenhum evento futuro encontrado. Crie seu primeiro evento!"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`} className="block">
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex flex-col">
              <h3 className="font-medium">{event.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {format(new Date(event.date), "PPP", { locale: ptBR })}
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Link>
      ))}
    </div>
  )
}
