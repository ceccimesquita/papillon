import { Badge } from "@/components/ui/badge"
import type { EventStatus } from "@/lib/store"

interface EventStatusBadgeProps {
  status: EventStatus
}

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pendente",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100",
    },
    confirmed: {
      label: "Confirmado",
      className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100",
    },
    canceled: {
      label: "Cancelado",
      className: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100",
    },
    completed: {
      label: "Concluído",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100",
    },
  }

  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
