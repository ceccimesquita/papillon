"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEventStore } from "@/lib/store"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface EditEventFormProps {
  eventId: string
  onSuccess?: () => void
}

export function EditEventForm({ eventId, onSuccess }: EditEventFormProps) {
  const { toast } = useToast()
  const { getEvent, updateEvent } = useEventStore()
  const event = getEvent(eventId)

  // Estados do formulário
  const [name, setName] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar dados do evento
  useEffect(() => {
    if (event) {
      setName(event.name)
      setDate(new Date(event.date))
    }
  }, [event])

  // Validar formulário
  const validateForm = () => {
    if (!name.trim()) {
      setError("O nome do evento é obrigatório")
      return false
    }

    if (!date) {
      setError("A data do evento é obrigatória")
      return false
    }

    setError(null)
    return true
  }

  // Enviar formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !event) {
      return
    }

    try {
      setIsLoading(true)

      // Criar objeto atualizado mantendo todos os dados originais
      const updatedEvent = {
        ...event,
        name,
        date,
      }

      // Atualizar evento
      updateEvent(eventId, updatedEvent)

      toast({
        title: "Evento atualizado",
        description: "As informações do evento foram atualizadas com sucesso.",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("Erro ao atualizar evento:", err)
      setError("Ocorreu um erro ao atualizar o evento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!event) {
    return <div>Evento não encontrado</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Evento *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do evento" />
      </div>

      <div className="space-y-2">
        <Label>Data do Evento *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  )
}
