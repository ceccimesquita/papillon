"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEventStore } from "@/lib/store"
import { useState, useRef } from "react"
import { Upload, AlertCircle, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Event } from "@/lib/store"

interface ImportEventsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportEventsDialog({ open, onOpenChange }: ImportEventsDialogProps) {
  const { addEvent } = useEventStore()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [importedEvents, setImportedEvents] = useState<Event[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Resetar estado quando o diálogo é aberto/fechado
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFile(null)
      setError(null)
      setSuccess(null)
      setImportedEvents([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
    onOpenChange(open)
  }

  // Lidar com a seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) {
      setFile(null)
      return
    }

    // Verificar se é um arquivo JSON
    if (selectedFile.type !== "application/json" && !selectedFile.name.endsWith(".json")) {
      setError("Por favor, selecione um arquivo JSON válido.")
      setFile(null)
      return
    }

    setFile(selectedFile)
    setError(null)
    setSuccess(null)

    // Ler o conteúdo do arquivo
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const data = JSON.parse(content)

        // Validar o formato do arquivo
        if (!data.events || !Array.isArray(data.events)) {
          throw new Error("Formato de arquivo inválido. O arquivo deve conter uma propriedade 'events' que é um array.")
        }

        // Validar cada evento
        const events = data.events as Event[]
        events.forEach((event) => {
          if (!event.id || !event.name || !event.date || !Array.isArray(event.transactions)) {
            throw new Error("Um ou mais eventos no arquivo estão em formato inválido.")
          }
        })

        setImportedEvents(events)
      } catch (err) {
        setError(`Erro ao processar o arquivo: ${err instanceof Error ? err.message : "Formato inválido"}.`)
        setImportedEvents([])
      }
    }

    reader.onerror = () => {
      setError("Erro ao ler o arquivo. Tente novamente.")
    }

    reader.readAsText(selectedFile)
  }

  // Importar os eventos
  const handleImport = () => {
    if (importedEvents.length === 0) {
      setError("Nenhum evento válido para importar.")
      return
    }

    try {
      // Adicionar cada evento ao store
      importedEvents.forEach((event) => {
        // Converter datas de string para objeto Date
        const safeEvent = {
          ...event,
          date: new Date(event.date),
          transactions: event.transactions.map((t) => ({
            ...t,
            date: new Date(t.date),
          })),
        }

        addEvent(safeEvent)
      })

      setSuccess(`${importedEvents.length} evento(s) importado(s) com sucesso!`)
      setImportedEvents([])
      setFile(null)

      // Limpar o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Fechar o diálogo após 2 segundos
      setTimeout(() => {
        handleOpenChange(false)
      }, 2000)
    } catch (err) {
      setError(`Erro ao importar eventos: ${err instanceof Error ? err.message : "Erro desconhecido"}.`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Eventos</DialogTitle>
          <DialogDescription>Selecione um arquivo JSON contendo eventos exportados anteriormente.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 mb-4">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-center mb-4">Arraste e solte um arquivo JSON aqui, ou clique para selecionar</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
          </div>

          {file && (
            <div className="flex items-center p-2 bg-muted rounded-md">
              <div className="flex-1 truncate">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB • {importedEvents.length} evento(s) encontrado(s)
                </p>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertTitle>Sucesso</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={importedEvents.length === 0}>
            <Upload className="mr-2 h-4 w-4" />
            Importar Eventos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
