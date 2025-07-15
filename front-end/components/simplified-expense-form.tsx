"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEventStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface SimplifiedExpenseFormProps {
  eventId: string
  onSuccess?: () => void
}

export function SimplifiedExpenseForm({ eventId, onSuccess }: SimplifiedExpenseFormProps) {
  const { toast } = useToast()
  const { addTransaction, getEventSources, getSourceBalance } = useEventStore()

  // Estados do formulário
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [source, setSource] = useState("")
  const [destination, setDestination] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Obter fontes disponíveis
  const availableSources = getEventSources(eventId)

  // Verificar saldo disponível na fonte selecionada
  const selectedSourceBalance = source ? getSourceBalance(eventId, source).available : null

  // Validar formulário
  const validateForm = () => {
    if (!description.trim()) {
      setError("A descrição é obrigatória")
      return false
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("O valor deve ser maior que zero")
      return false
    }

    if (!source) {
      setError("Selecione uma fonte de orçamento")
      return false
    }

    if (!destination.trim()) {
      setError("O destinatário é obrigatório")
      return false
    }

    // Verificar se há saldo suficiente
    if (selectedSourceBalance !== null && amountValue > selectedSourceBalance) {
      setError(`Saldo insuficiente na fonte "${source}". Disponível: R$ ${selectedSourceBalance.toFixed(2)}`)
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
      const newTransaction = {
        id: Date.now().toString(),
        description,
        amount: Number.parseFloat(amount),
        type: "expense" as const,
        source,
        destination,
        date: new Date(),
      }

      addTransaction(eventId, newTransaction)

      toast({
        title: "Despesa adicionada",
        description: `Despesa de R$ ${Number.parseFloat(amount).toFixed(2)} adicionada com sucesso.`,
      })

      // Limpar formulário
      setDescription("")
      setAmount("")
      setSource("")
      setDestination("")
      setError(null)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("Erro ao adicionar despesa:", err)
      setError("Ocorreu um erro ao adicionar a despesa. Tente novamente.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          placeholder="Compra de materiais"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor (R$) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Fonte do Orçamento *</Label>
        {availableSources.length > 0 ? (
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger id="source">
              <SelectValue placeholder="Selecione a fonte do orçamento" />
            </SelectTrigger>
            <SelectContent>
              {availableSources.map((sourceOption) => {
                const balance = getSourceBalance(eventId, sourceOption)
                return (
                  <SelectItem key={sourceOption} value={sourceOption}>
                    {sourceOption} (Disponível: R$ {balance.available.toFixed(2)})
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm text-muted-foreground p-2 border rounded-md">
            Não há fontes de orçamento disponíveis. Adicione orçamento ao evento primeiro.
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Selecione de qual fonte de orçamento está saindo o dinheiro para este gasto
        </p>
      </div>

      {selectedSourceBalance !== null && (
        <div className="text-sm">
          <span className="font-medium">Saldo disponível na fonte:</span> R$ {selectedSourceBalance.toFixed(2)}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="destination">Destinatário *</Label>
        <Input
          id="destination"
          placeholder="Digite o destinatário"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Informe para onde está indo o dinheiro (ex: Fornecedor, Loja, etc.)
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={availableSources.length === 0}>
        Adicionar Despesa
      </Button>
    </form>
  )
}
