"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarIcon, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventoShowDto, listAllEventos } from '@/lib/api/eventoService'

export function EventListAll() {
  const [events, setEvents] = useState<EventoShowDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadEvents() {
      try {
        const eventos = await listAllEventos()
        setEvents(eventos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Carregando eventos...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Erro: {error}</div>
  }

  if (events.length === 0) {
    return <div className="text-center py-8">Nenhum evento encontrado</div>
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
                {new Date(event.data).toLocaleDateString()}
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