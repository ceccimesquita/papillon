"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useClientStore } from "@/lib/client-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z
    .string()
    .email({
      message: "Email inválido.",
    })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  document: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

interface ClientFormProps {
  clientId?: string
  onSuccess?: () => void
}

export function ClientForm({ clientId, onSuccess }: ClientFormProps) {
  const { toast } = useToast()
  const { addClient, updateClient, getClient } = useClientStore()
  const isEditing = !!clientId

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      isEditing && clientId
        ? {
            name: getClient(clientId)?.name || "",
            email: getClient(clientId)?.email || "",
            phone: getClient(clientId)?.phone || "",
            document: getClient(clientId)?.document || "",
            notes: getClient(clientId)?.notes || "",
          }
        : {
            name: "",
            email: "",
            phone: "",
            document: "",
            notes: "",
          },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isEditing && clientId) {
        updateClient(clientId, {
          ...getClient(clientId)!,
          ...values,
        })
        toast({
          title: "Cliente atualizado",
          description: "As informações do cliente foram atualizadas com sucesso.",
        })
      } else {
        addClient({
          id: Date.now().toString(),
          name: values.name,
          email: values.email || undefined,
          phone: values.phone || undefined,
          document: values.document || undefined,
          notes: values.notes || undefined,
          events: [],
        })
        toast({
          title: "Cliente adicionado",
          description: "O cliente foi adicionado com sucesso.",
        })
      }

      form.reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar cliente",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
      })
    }
  }

  // Formatar CPF/CNPJ
  const formatDocument = (value: string) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, "")

    if (numericValue.length <= 11) {
      // Formatar como CPF: 000.000.000-00
      return numericValue
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    } else {
      // Formatar como CNPJ: 00.000.000/0000-00
      return numericValue
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Nome do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF/CNPJ</FormLabel>
              <FormControl>
                <Input
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(formatDocument(e.target.value))}
                  maxLength={18}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre o cliente"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {isEditing ? "Atualizar Cliente" : "Adicionar Cliente"}
        </Button>
      </form>
    </Form>
  )
}
