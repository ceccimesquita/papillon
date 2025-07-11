"use client"

import { Calendar } from "@/components/ui/calendar"
import { useEventStore } from "@/lib/store"
import { isSameDay, isToday, isPast } from "date-fns"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"

export function EventCalendar() {
  const { events } = useEventStore()
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Função para verificar se um dia tem eventos
  const hasEventOnDay = useCallback(
    (day: Date) => {
      return events.some((event) => isSameDay(new Date(event.date), day))
    },
    [events],
  )

  // Função para verificar se um dia tem eventos passados
  const hasPastEventOnDay = useCallback(
    (day: Date) => {
      return events.some((event) => isSameDay(new Date(event.date), day) && isPast(day) && !isToday(day))
    },
    [events],
  )

  // Função para verificar se um dia tem eventos futuros
  const hasFutureEventOnDay = useCallback(
    (day: Date) => {
      return events.some((event) => isSameDay(new Date(event.date), day) && (isToday(day) || !isPast(day)))
    },
    [events],
  )

  // Função para obter todos os eventos de um dia específico
  const getEventsForDay = useCallback(
    (day: Date) => {
      return events.filter((event) => isSameDay(new Date(event.date), day))
    },
    [events],
  )

  // Função para navegar para o evento quando um dia é clicado
  const handleDayClick = (day: Date) => {
    const eventsOnDay = getEventsForDay(day)
    if (eventsOnDay.length === 1) {
      // Se houver apenas um evento nesse dia, navegue diretamente para ele
      router.push(`/events/${eventsOnDay[0].id}`)
    } else if (eventsOnDay.length > 1) {
      // Se houver múltiplos eventos, poderia mostrar uma lista ou navegar para o primeiro
      // Por simplicidade, vamos navegar para o primeiro
      router.push(`/events/${eventsOnDay[0].id}`)
    }
    // Se não houver eventos, apenas atualize a data selecionada
    setDate(day)
  }

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={(day) => {
        if (day) handleDayClick(day)
      }}
      className="rounded-md border w-full"
      modifiers={{
        hasFutureEvent: (date) => hasFutureEventOnDay(date) && !isToday(date),
        hasPastEvent: (date) => hasPastEventOnDay(date),
        today: (date) => isToday(date),
      }}
      modifiersClassNames={{
        hasFutureEvent: "bg-blue-100 text-blue-900 font-bold dark:bg-blue-800 dark:text-blue-100",
        hasPastEvent: "bg-gray-100 text-gray-700 font-medium dark:bg-gray-800 dark:text-gray-300",
        today: "bg-orange-100 text-orange-900 font-bold dark:bg-orange-800 dark:text-orange-100",
      }}
      footer={
        <div className="text-xs text-center text-muted-foreground mt-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-800"></div>
            <span>Eventos futuros</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-800"></div>
            <span>Eventos passados</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full bg-orange-100 dark:bg-orange-800"></div>
            <span>Hoje</span>
          </div>
        </div>
      }
    />
  )
}
