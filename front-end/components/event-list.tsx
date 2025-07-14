"use client"

import { useEventStore } from "@/lib/store"
import { CalendarIcon, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import type { Event } from "@/lib/store"
import { isPast, isToday } from "date-fns"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useEffect } from "react"

interface EventListProps {
  eventsToShow?: Event[]
  showPastEvents?: boolean
}

export function EventList({ eventsToShow, showPastEvents = false }: EventListProps) {
  const { events: allEvents, fetchEvents } = useEventStore()

  // Carregar eventos quando o componente for montado
  useEffect(() => {
    const loadEvents = async () => {
      try {
        console.log("Iniciando carregamento de eventos...")
        await fetchEvents()
        console.log("Eventos carregados com sucesso!")
      } catch (error) {
        console.error("Erro ao carregar eventos:", error)
      }
    }
    
    loadEvents()
  }, [fetchEvents])

  let events = eventsToShow || allEvents
  console.log("Eventos para exibir:", events)

  // Filtrar eventos com base no parâmetro showPastEvents
  events = events.filter((event) => {
    console.log("Processando evento:", event)
    
    try {
      const eventDate = new Date(event.data)
      console.log("Data do evento convertida:", eventDate)
      
      const isPastEvent = isPast(eventDate) && !isToday(eventDate)
      console.log("É evento passado?", isPastEvent)
      
      return showPastEvents ? isPastEvent : !isPastEvent
    } catch (error) {
      console.error("Erro ao processar data do evento:", error)
      return false
    }
  })

  console.log("Eventos após filtro:", events)

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
              <h3 className="font-medium">{event.nome}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <CalendarIcon className="mr-1 h-3 w-3" />

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