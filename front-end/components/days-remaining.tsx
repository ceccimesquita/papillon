"use client"

import { differenceInDays, isPast } from "date-fns"
import { useMemo } from "react"

interface DaysRemainingProps {
  eventDate: Date
}

export function DaysRemaining({ eventDate }: DaysRemainingProps) {
  // Converter para Date apenas uma vez
  const eventDateObj = useMemo(() => new Date(eventDate), [eventDate])
  const today = useMemo(() => new Date(), [])

  // Verifica se o evento já passou
  if (isPast(eventDateObj) && !isSameDay(today, eventDateObj)) {
    return (
      <div className="bg-muted px-4 py-2 rounded-md text-sm">
        <span className="font-medium">Evento finalizado</span>
      </div>
    )
  }

  // Calcula a diferença em dias
  const daysRemaining = differenceInDays(eventDateObj, today)

  // Determina a mensagem e a cor com base nos dias restantes
  let message: string
  let colorClass: string

  if (daysRemaining === 0) {
    message = "O evento é hoje!"
    colorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
  } else if (daysRemaining === 1) {
    message = "Falta 1 dia para o evento"
    colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
  } else {
    message = `Faltam ${daysRemaining} dias para o evento`
    colorClass =
      daysRemaining <= 7
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
  }

  return (
    <div className={`px-4 py-2 rounded-md text-sm ${colorClass}`}>
      <span className="font-medium">{message}</span>
    </div>
  )
}

// Função auxiliar para verificar se duas datas são o mesmo dia
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}
