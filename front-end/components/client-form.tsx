"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useClientStore } from "@/lib/client-store"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"

const clientSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  document: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  clientId?: string
  onSuccess?: () => void
}

export function ClientForm({ clientId, onSuccess }: ClientFormProps) {
  const { toast } = useToast()
  const { getClient, addClient, updateClient } = useClientStore()
  const isEditing = !!clientId

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      document: "",
      notes: "",
    },
  })

  // Preencher dados no modo edição
  useEffect(() => {
    if (isEditing && clientId) {
      const client = getClient(clientId)
      if (client) {
        form.reset({
          name: client.name,
          email: client.email || "",
          phone: client.phone || "",
          document: client.document || "",
          notes: client.notes || "",
        })
      }
    }
  }, [clientId, isEditing, getClient, form])

  const formatDocument = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    }
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
  }

  const handleSubmit = async (values: ClientFormData) => {
    try {
      if (isEditing && clientId) {
        await updateClient(clientId, values)
        toast({ title: "Cliente atualizado com sucesso" })
      } else {
        await addClient({
          name: values.name,
          email: values.email || undefined,
          phone: values.phone || undefined,
          document: values.document || undefined,
          notes: values.notes || undefined,
        })
        toast({ title: "Cliente adicionado com sucesso" })
      }

      form.reset()
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error("Erro ao salvar cliente:", err)
      toast({
        title: "Erro ao salvar cliente",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                <Input type="email" placeholder="email@exemplo.com" {...field} />
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
                <Input placeholder="(00) 00000-0000" {...field} />
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
                <Textarea placeholder="Informações adicionais" className="resize-none" {...field} />
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
