"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEventStore } from "@/lib/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

const sourceSchema = z.object({
  name: z.string().min(1, { message: "A fonte é obrigatória" }),
  amount: z.coerce.number().positive({ message: "O valor deve ser maior que zero" }),
})

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  date: z.date({
    required_error: "A data do evento é obrigatória.",
  }),
  sources: z.array(sourceSchema).min(1, {
    message: "Adicione pelo menos uma fonte de orçamento",
  }),
})

export function EventForm() {
  const router = useRouter()
  const { addEvent, addTransaction } = useEventStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      date: new Date(),
      sources: [{ name: "", amount: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sources",
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const eventId = Date.now().toString()

    // Calcular o valor inicial total somando todas as fontes
    const initialValue = values.sources.reduce((total, source) => total + source.amount, 0)

    const newEvent = {
      id: eventId,
      name: values.name,
      date: values.date,
      initialValue: initialValue,
      transactions: [],
    }

    // Adicionar o evento
    addEvent(newEvent)

    // Adicionar uma transação para cada fonte (como orçamento inicial)
    values.sources.forEach((source, index) => {
      const initialTransaction = {
        id: `${eventId}-source-${index}`,
        description: `Orçamento inicial: ${source.name}`,
        amount: source.amount,
        type: "budget" as const,
        source: source.name,
        destination: null,
        date: new Date(),
      }

      addTransaction(eventId, initialTransaction)
    })

    router.push(`/events/${eventId}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Evento</FormLabel>
              <FormControl>
                <Input placeholder="Festa de Aniversário" {...field} />
              </FormControl>
              <FormDescription>Digite um nome descritivo para o seu evento.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Evento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormDescription>Selecione a data em que o evento ocorrerá.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Fontes de Orçamento</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", amount: 0 })}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Fonte
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-start mb-4">
              <div className="flex-1 space-y-2">
                <FormField
                  control={form.control}
                  name={`sources.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Nome da fonte (ex: Patrocínio)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-1/3 space-y-2">
                <FormField
                  control={form.control}
                  name={`sources.${index}.amount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Valor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {fields.length > 1 && (
                <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}

          {form.formState.errors.sources?.root && (
            <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.sources.root.message}</p>
          )}

          <p className="text-sm text-muted-foreground mt-2">
            Adicione todas as fontes de orçamento para o evento e seus respectivos valores.
          </p>
        </div>

        <Button type="submit" className="w-full">
          Criar Evento
        </Button>
      </form>
    </Form>
  )
}
