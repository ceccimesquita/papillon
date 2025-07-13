"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useEventStore } from "@/lib/store"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Download } from "lucide-react"

interface ExportEventsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportEventsDialog({ open, onOpenChange }: ExportEventsDialogProps) {
  const { events } = useEventStore()
  const [selectedEvents, setSelectedEvents] = useState<Record<string, boolean>>({})
  const [selectAll, setSelectAll] = useState(false)

  // Resetar seleções quando o diálogo é aberto
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedEvents({})
      setSelectAll(false)
    }
    onOpenChange(open)
  }

  // Selecionar ou desselecionar todos os eventos
  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)

    const newSelectedEvents: Record<string, boolean> = {}
    events.forEach((event) => {
      newSelectedEvents[event.id] = newSelectAll
    })
    setSelectedEvents(newSelectedEvents)
  }

  // Selecionar ou desselecionar um evento específico
  const handleSelectEvent = (eventId: string) => {
    setSelectedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }))

    // Verificar se todos estão selecionados para atualizar o "Selecionar Todos"
    const allSelected = events.every(
      (event) => selectedEvents[event.id] || (event.id === eventId && !selectedEvents[event.id]),
    )
    setSelectAll(allSelected)
  }

  // Exportar eventos selecionados
  const handleExport = () => {
    // Filtrar apenas os eventos selecionados
    const eventsToExport = events.filter((event) => selectedEvents[event.id])

    if (eventsToExport.length === 0) {
      alert("Selecione pelo menos um evento para exportar.")
      return
    }

    // Criar o objeto de exportação
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      events: eventsToExport,
    }

    // Converter para JSON
    const jsonString = JSON.stringify(exportData, null, 2)

    // Criar um blob e link para download
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `eventos-exportados-${format(new Date(), "dd-MM-yyyy")}.json`
    document.body.appendChild(link)
    link.click()

    // Limpar
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // Fechar o diálogo
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar Eventos</DialogTitle>
          <DialogDescription>
            Selecione os eventos que deseja exportar. O arquivo JSON gerado poderá ser importado posteriormente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox id="select-all" checked={selectAll} onCheckedChange={handleSelectAll} />
            <Label htmlFor="select-all" className="font-medium">
              Selecionar Todos
            </Label>
          </div>

          <div className="max-h-[300px] overflow-y-auto border rounded-md p-2">
            {events.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">Nenhum evento encontrado.</p>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                    <Checkbox
                      id={`event-${event.id}`}
                      checked={selectedEvents[event.id] || false}
                      onCheckedChange={() => handleSelectEvent(event.id)}
                    />
                    <Label htmlFor={`event-${event.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{event.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.date), "PPP", { locale: ptBR })}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={events.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Selecionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
