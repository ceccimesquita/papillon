"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEventStore } from "@/lib/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  amount: z.coerce.number().positive({
    message: "O valor deve ser maior que zero.",
  }),
  source: z.string().min(1, {
    message: "O método de pagamento é obrigatório.",
  }),
})

interface AddBudgetFormProps {
  eventId: string
  onSuccess?: () => void
}

export function AddBudgetForm({ eventId, onSuccess }: AddBudgetFormProps) {
  const { addTransaction } = useEventStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      source: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Adicionando transação:", values)

      const newTransaction = {
        id: Date.now().toString(),
        description: `Pagamento via ${values.source}`,
        amount: values.amount,
        type: "budget" as const,
        source: values.source,
        destination: null,
        date: new Date(),
      }

      addTransaction(eventId, newTransaction)
      console.log("Transação adicionada com sucesso")

      form.reset({
        amount: 0,
        source: "",
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Erro ao adicionar transação:", error)
      // Mostrar erro ao usuário
      alert("Erro ao adicionar pagamento. Tente novamente.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor a Adicionar (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pagamento *</FormLabel>
              <FormControl>
                <Input placeholder="Digite o método de pagamento" {...field} />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Informe o método de pagamento (ex: Cartão, PIX, Dinheiro).
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Adicionar Pagamento
        </Button>
      </form>
    </Form>
  )
}
