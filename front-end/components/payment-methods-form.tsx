"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { createMetodoPagamento } from "@/lib/api/pagamentoService"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function PaymentMethodsForm() {
  const { toast } = useToast()
  const [paymentMethods, setPaymentMethods] = useState([{ 
    nome: "", 
    valor: 0, 
    data: new Date() 
  }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { nome: "", valor: 0, data: new Date() }])
  }

  const removePaymentMethod = (index: number) => {
    const newMethods = [...paymentMethods]
    newMethods.splice(index, 1)
    setPaymentMethods(newMethods)
  }

  const updatePaymentMethod = (index: number, field: string, value: any) => {
    const newMethods = [...paymentMethods]
    newMethods[index] = { ...newMethods[index], [field]: value }
    setPaymentMethods(newMethods)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      for (const method of paymentMethods) {
        await createMetodoPagamento({
          nome: method.nome,
          valor: method.valor,
          data: method.data.toISOString().split('T')[0] // Formato YYYY-MM-DD
        })
      }

      toast({
        title: "Sucesso",
        description: "Métodos de pagamento criados com sucesso.",
      })
      setPaymentMethods([{ nome: "", valor: 0, data: new Date() }])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar métodos",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {paymentMethods.map((method, index) => (
        <div key={index} className="p-4 border rounded space-y-2">
          <div className="flex justify-between">
            <h3 className="font-medium">Método {index + 1}</h3>
            {paymentMethods.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePaymentMethod(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome*</label>
              <Input
                value={method.nome}
                onChange={(e) => updatePaymentMethod(index, "nome", e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Valor*</label>
              <Input
                type="number"
                value={method.valor}
                onChange={(e) => updatePaymentMethod(index, "valor", Number(e.target.value))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data*</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {format(method.data, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={method.data}
                    onSelect={(date) => date && updatePaymentMethod(index, "data", date)}
                    disabled={isSubmitting}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={addPaymentMethod}
          disabled={isSubmitting}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Método
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Métodos"}
        </Button>
      </div>
    </form>
  )
}