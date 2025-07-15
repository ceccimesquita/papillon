"use client"

import type React from "react"

import { useState } from "react"
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
import { useRouter } from "next/navigation"

interface SimpleEventFormProps {
  onSuccess?: () => void
}

export function SimpleEventForm({ onSuccess }: SimpleEventFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { addEvent } = useEventStore()

  // Estados do formulário
  const [name, setName] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [initialValue, setInitialValue] = useState("")
  const [clientName, setClientName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

    if (!clientName.trim()) {
      setError("O nome do cliente é obrigatório")
      return false
    }

    const valueNum = Number(initialValue)
    if (isNaN(valueNum) || valueNum < 0) {
      setError("O valor inicial deve ser um número válido")
      return false
    }

    setError(null)
    return true
  }

  // Enviar formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)

      const eventId = Date.now().toString()
      const valueNum = Number(initialValue) || 0

      // Criar novo evento
      const newEvent = {
        id: eventId,
        name,
        date: date as Date,
        initialValue: valueNum,
        status: "pending" as const,
        client: {
          name: clientName,
        },
        transactions: [],
      }

      // Se houver valor inicial, adicionar como transação
      if (valueNum > 0) {
        newEvent.transactions.push({
          id: `${eventId}-initial`,
          description: "Valor inicial",
          amount: valueNum,
          type: "budget" as const,
          source: "Valor inicial",
          destination: null,
          date: new Date(),
        })
      }

      // Adicionar evento
      addEvent(newEvent)

      toast({
        title: "Evento criado",
        description: "O evento foi criado com sucesso.",
      })

      // Redirecionar para a página do evento
      router.push(`/events/${eventId}`)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("Erro ao criar evento:", err)
      setError("Ocorreu um erro ao criar o evento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
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
        <Label htmlFor="clientName">Nome do Cliente *</Label>
        <Input
          id="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Nome do cliente"
        />
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

      <div className="space-y-2">
        <Label htmlFor="initialValue">Valor Inicial (R$)</Label>
        <Input
          id="initialValue"
          type="number"
          step="0.01"
          min="0"
          value={initialValue}
          onChange={(e) => setInitialValue(e.target.value)}
          placeholder="0.00"
        />
        <p className="text-xs text-muted-foreground">Valor inicial do orçamento (opcional)</p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Criando..." : "Criar Evento"}
      </Button>
    </form>
  )
}
