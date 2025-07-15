"use client"

import { useEventStore } from "@/lib/store"
import { CalendarIcon, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import type { Event } from "@/lib/store"
import { isPast, isToday, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useEffect } from "react"

interface EventListProps {
  eventsToShow?: Event[]
  showPastEvents?: boolean
}

export function EventList({ eventsToShow, showPastEvents = false }: EventListProps) {
  const { events: allEvents, fetchEvents } = useEventStore()

  useEffect(() => {
    const loadEvents = async () => {
      try {
        await fetchEvents()
      } catch (error) {
        console.error("Erro ao carregar eventos:", error)
      }
    }
    loadEvents()
  }, [fetchEvents])

  const filteredEvents = (eventsToShow || allEvents)
    .filter(event => {
      try {
        const eventDate = new Date(event.data)
        const isPastEvent = isPast(eventDate) && !isToday(eventDate)
        return showPastEvents ? isPastEvent : !isPastEvent
      } catch {
        return false
      }
    })
    .sort((a, b) => {
      // Ordena eventos passados do mais recente para o mais antigo
      // Ou eventos futuros do mais próximo para o mais distante
      return showPastEvents 
        ? new Date(b.data).getTime() - new Date(a.data).getTime()
        : new Date(a.data).getTime() - new Date(b.data).getTime()
    })

  if (filteredEvents.length === 0) {
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
      {filteredEvents.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`} className="block">
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex flex-col">
              <h3 className="font-medium">{event.nome}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {
                  format(new Date(event.data), "dd/MM/yyyy", { locale: ptBR })
                }   
              </div>
              {event.cliente && (
                <div className="text-xs text-muted-foreground mt-1">
                  Cliente: {event.cliente.nome}
                </div>
              )}
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