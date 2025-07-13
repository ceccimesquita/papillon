"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEventStore } from "@/lib/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  description: z.string().min(2, {
    message: "A descrição deve ter pelo menos 2 caracteres.",
  }),
  amount: z.coerce.number().positive({
    message: "O valor deve ser maior que zero.",
  }),
  source: z.string().min(1, {
    message: "A fonte do dinheiro é obrigatória.",
  }),
  destination: z.string().min(1, {
    message: "O destinatário é obrigatório.",
  }),
})

interface TransactionFormProps {
  eventId: string
  onSuccess?: () => void
}

export function TransactionForm({ eventId, onSuccess }: TransactionFormProps) {
  const { toast } = useToast()
  const { addTransaction, getEvent, getEventSources, canSpendFromSource, getSourceBalance } = useEventStore()
  const [availableSources, setAvailableSources] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedSourceBalance, setSelectedSourceBalance] = useState<number | null>(null)

  // Usar useMemo para evitar recálculos desnecessários
  const event = useMemo(() => {
    try {
      return getEvent(eventId)
    } catch (err) {
      console.error("Erro ao obter evento:", err)
      return undefined
    }
  }, [eventId, getEvent])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      source: "",
      destination: "",
    },
  })

  // Extrair fontes de dinheiro existentes
  useEffect(() => {
    if (event) {
      try {
        const sources = getEventSources(eventId)
        setAvailableSources(sources)
      } catch (err) {
        console.error("Erro ao obter fontes:", err)
        setAvailableSources([])
      }
    }
  }, [event, eventId, getEventSources])

  // Usar valores do formulário de forma segura
  const source = form.watch("source")
  const amount = form.watch("amount")

  // Atualizar o saldo disponível quando a fonte muda
  useEffect(() => {
    if (source) {
      try {
        const sourceBalance = getSourceBalance(eventId, source)
        setSelectedSourceBalance(sourceBalance.available)
      } catch (err) {
        console.error("Erro ao obter saldo da fonte:", err)
        setSelectedSourceBalance(null)
      }
    } else {
      setSelectedSourceBalance(null)
    }
  }, [source, eventId, getSourceBalance])

  // Verificar se o valor é maior que o saldo disponível
  useEffect(() => {
    if (source && amount) {
      try {
        if (!canSpendFromSource(eventId, source, amount)) {
          setError(`Saldo insuficiente na fonte "${source}". Disponível: R$ ${selectedSourceBalance?.toFixed(2)}`)
        } else {
          setError(null)
        }
      } catch (err) {
        console.error("Erro ao verificar saldo disponível:", err)
        setError("Erro ao verificar saldo disponível. Tente novamente.")
      }
    } else {
      setError(null)
    }
  }, [source, amount, canSpendFromSource, eventId, selectedSourceBalance])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      // Verificar se há saldo suficiente para gastos
      if (!canSpendFromSource(eventId, values.source, values.amount)) {
        setError(`Saldo insuficiente na fonte "${values.source}". Disponível: R$ ${selectedSourceBalance?.toFixed(2)}`)
        return
      }

      const newTransaction = {
        id: Date.now().toString(),
        description: values.description,
        amount: values.amount,
        type: "expense" as const,
        source: values.source,
        destination: values.destination,
        date: new Date(),
      }

      addTransaction(eventId, newTransaction)

      toast({
        title: "Despesa adicionada",
        description: `Despesa de R$ ${values.amount.toFixed(2)} adicionada com sucesso.`,
      })

      form.reset({
        description: "",
        amount: 0,
        source: "",
        destination: "",
      })

      setError(null)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("Erro ao adicionar transação:", err)
      toast({
        variant: "destructive",
        title: "Erro ao adicionar despesa",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Compra de materiais" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
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
              <FormLabel>Fonte do Orçamento *</FormLabel>
              <FormControl>
                {availableSources.length > 0 ? (
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fonte do orçamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSources.map((source) => {
                        try {
                          const balance = getSourceBalance(eventId, source)
                          return (
                            <SelectItem key={source} value={source}>
                              {source} (Disponível: R$ {balance.available.toFixed(2)})
                            </SelectItem>
                          )
                        } catch (err) {
                          console.error(`Erro ao obter saldo para fonte ${source}:`, err)
                          return (
                            <SelectItem key={source} value={source}>
                              {source}
                            </SelectItem>
                          )
                        }
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground p-2 border rounded-md">
                    Não há fontes de orçamento disponíveis. Adicione orçamento ao evento primeiro.
                  </div>
                )}
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Selecione de qual fonte de orçamento está saindo o dinheiro para este gasto
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedSourceBalance !== null && (
          <div className="text-sm">
            <span className="font-medium">Saldo disponível na fonte:</span> R$ {selectedSourceBalance.toFixed(2)}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destinatário *</FormLabel>
              <FormControl>
                <Input placeholder="Digite o destinatário" {...field} />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Informe para onde está indo o dinheiro (ex: Fornecedor, Loja, etc.)
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={!!error || availableSources.length === 0}>
          Adicionar Despesa
        </Button>
      </form>
    </Form>
  )
}
