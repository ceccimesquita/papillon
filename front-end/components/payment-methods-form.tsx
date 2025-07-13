"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEventStore } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PaymentMethodsFormProps {
  eventId: string
  onSuccess?: () => void
}

// Tipos de métodos de pagamento disponíveis
const PAYMENT_METHODS = [
  { value: "credit", label: "Cartão de Crédito" },
  { value: "debit", label: "Cartão de Débito" },
  { value: "cash", label: "Dinheiro (à vista)" },
  { value: "pix", label: "PIX" },
  { value: "transfer", label: "Transferência Bancária" },
  { value: "check", label: "Cheque" },
  { value: "other", label: "Outro" },
]

export function PaymentMethodsForm({ eventId, onSuccess }: PaymentMethodsFormProps) {
  const { toast } = useToast()
  const { addTransaction } = useEventStore()

  // Estado para os campos do formulário
  const [paymentMethods, setPaymentMethods] = useState([{ method: "", amount: "", customName: "" }])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Adicionar um novo método de pagamento
  const addPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { method: "", amount: "", customName: "" }])
  }

  // Remover um método de pagamento
  const removePaymentMethod = (index: number) => {
    const newPaymentMethods = [...paymentMethods]
    newPaymentMethods.splice(index, 1)
    setPaymentMethods(newPaymentMethods)
  }

  // Atualizar um método de pagamento
  const updatePaymentMethod = (index: number, field: string, value: any) => {
    const newPaymentMethods = [...paymentMethods]
    newPaymentMethods[index] = { ...newPaymentMethods[index], [field]: value }
    setPaymentMethods(newPaymentMethods)
  }

  // Validar o formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    paymentMethods.forEach((payment, index) => {
      if (!payment.method && !payment.customName) {
        newErrors[`method-${index}`] = "Selecione um método de pagamento ou digite um nome personalizado"
        isValid = false
      }

      const amount = Number(payment.amount)
      if (isNaN(amount) || amount <= 0) {
        newErrors[`amount-${index}`] = "Valor deve ser maior que zero"
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  // Enviar o formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Adicionar cada método de pagamento como uma transação
      paymentMethods.forEach((payment) => {
        const methodName =
          payment.customName || PAYMENT_METHODS.find((m) => m.value === payment.method)?.label || payment.method

        const newTransaction = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          description: `Pagamento via ${methodName}`,
          amount: Number(payment.amount),
          type: "budget" as const,
          source: methodName,
          destination: null,
          date: new Date(),
        }

        try {
          addTransaction(eventId, newTransaction)
          console.log("Transação adicionada:", newTransaction)
        } catch (error) {
          console.error("Erro ao adicionar transação:", error)
          throw error
        }
      })

      toast({
        title: "Métodos de pagamento adicionados",
        description: `${paymentMethods.length} método(s) de pagamento foram adicionados com sucesso.`,
      })

      // Resetar o formulário
      setPaymentMethods([{ method: "", amount: "", customName: "" }])

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Erro ao adicionar métodos de pagamento:", error)
      toast({
        variant: "destructive",
        title: "Erro ao adicionar métodos de pagamento",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ScrollArea className="max-h-[60vh]">
        <div className="space-y-4 pr-4">
          {paymentMethods.map((payment, index) => (
            <div key={index} className="p-4 border rounded-md bg-muted/20">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Método de Pagamento {index + 1}</h4>
                {paymentMethods.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePaymentMethod(index)}
                    className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Método *</label>
                  <Select value={payment.method} onValueChange={(value) => updatePaymentMethod(index, "method", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um método" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Ou digite um nome personalizado abaixo</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Personalizado</label>
                  <Input
                    value={payment.customName}
                    onChange={(e) => updatePaymentMethod(index, "customName", e.target.value)}
                    placeholder="Ex: Parcelado 3x, Entrada 50%, etc."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Valor (R$) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={payment.amount}
                    onChange={(e) => updatePaymentMethod(index, "amount", e.target.value)}
                    placeholder="0.00"
                  />
                  {errors[`amount-${index}`] && <p className="text-sm text-red-500">{errors[`amount-${index}`]}</p>}
                </div>
              </div>

              {errors[`method-${index}`] && <p className="text-sm text-red-500 mt-2">{errors[`method-${index}`]}</p>}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={addPaymentMethod} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Outro Método
        </Button>

        <Button type="submit">Salvar Métodos de Pagamento</Button>
      </div>
    </form>
  )
}
