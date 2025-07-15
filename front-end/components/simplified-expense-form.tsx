"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEventStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface SimplifiedExpenseFormProps {
  eventId: string
  onSuccess?: () => void
}

export function SimplifiedExpenseForm({ eventId, onSuccess }: SimplifiedExpenseFormProps) {
  const { toast } = useToast()
  const { addTransaction, getEventBalance } = useEventStore()
  const [insumos, setInsumos] = useState<{id: string, nome: string}[]>([])

  // Estados do formulário
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [pagamento, setPagamento] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Obter saldo total do evento
  const eventBalance = getEventBalance(eventId)

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

    setError(null)
    return true
  }

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      const newTransaction = {
        nome: description,
        valor: Number.parseFloat(amount),
        eventoId: eventId,
        metodoPagamento: pagamento,
      }

      await addTransaction(eventId, newTransaction)

      toast({
        title: "Despesa adicionada",
        description: `Despesa de R$ ${Number.parseFloat(amount).toFixed(2)} adicionada com sucesso.`,
      })

      // Limpar formulário
      setDescription("")
      setAmount("")
      setError(null)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("Erro ao adicionar despesa:", err)
      setError("Ocorreu um erro ao adicionar a despesa. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description">Nome *</Label>
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
        <Label htmlFor="description">Método de pagamento *</Label>
        <Input
          id="pagamento"
          placeholder="Método de pagamento"
          value={pagamento}
          onChange={(e) => setPagamento(e.target.value)}
        />
      </div>


      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || Number(eventBalance) <= 0}
      >
        {isLoading ? "Processando..." : "Adicionar Despesa"}
      </Button>
    </form>
  )
}