"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEventStore } from "@/lib/store"
import { CheckCircle, ChevronDown, Clock, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { EventStatus } from "@/lib/store"

interface EventStatusSelectorProps {
  eventId: string
  currentStatus: EventStatus
}

export function EventStatusSelector({ eventId, currentStatus }: EventStatusSelectorProps) {
  const { updateEventStatus } = useEventStore()
  const { toast } = useToast()

  const handleStatusChange = (status: EventStatus) => {
    if (status === currentStatus) return

    updateEventStatus(eventId, status)

    toast({
      title: "Status atualizado",
      description: `O status do evento foi alterado para ${getStatusLabel(status)}.`,
    })
  }

  const getStatusLabel = (status: EventStatus) => {
    const statusLabels = {
      pending: "Pendente",
      confirmed: "Confirmado",
      canceled: "Cancelado",
      completed: "Concluído",
    }
    return statusLabels[status]
  }

  const getStatusIcon = (status: EventStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 mr-2" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4 mr-2" />
      case "canceled":
        return <XCircle className="h-4 w-4 mr-2" />
      case "completed":
        return <CheckCircle className="h-4 w-4 mr-2" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Alterar Status <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange("pending")} disabled={currentStatus === "pending"}>
          {getStatusIcon("pending")}
          <span>Pendente</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("confirmed")} disabled={currentStatus === "confirmed"}>
          {getStatusIcon("confirmed")}
          <span>Confirmado</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("canceled")} disabled={currentStatus === "canceled"}>
          {getStatusIcon("canceled")}
          <span>Cancelado</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("completed")} disabled={currentStatus === "completed"}>
          {getStatusIcon("completed")}
          <span>Concluído</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
