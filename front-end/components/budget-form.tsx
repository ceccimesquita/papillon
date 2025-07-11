"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEventStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { X, Plus, CalendarIcon, Utensils, Wine } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Budget, MenuItem } from "@/lib/store"

// Vamos adicionar o parâmetro onError à interface BudgetFormProps
interface BudgetFormProps {
  budgetId?: string // Opcional para edição
  onError?: (message: string) => void
}

export function BudgetForm({ budgetId, onError }: BudgetFormProps = {}) {
  const router = useRouter()
  const { toast } = useToast()
  const { addBudget, getBudget, updateBudget } = useEventStore()
  const isEditing = !!budgetId

  // Estados para os campos do formulário
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientDocument, setClientDocument] = useState("")
  const [value, setValue] = useState("0")
  const [peopleCount, setPeopleCount] = useState("1")
  const [notes, setNotes] = useState("")
  const [eventDate, setEventDate] = useState<Date | undefined>(new Date())

  // Estado para as pessoas do evento - iniciar com uma pessoa com valores padrão
  const [people, setPeople] = useState<Array<{ name: string; role: string; salary: string }>>([
    { name: "Funcionário 1", role: "Garçom", salary: "100" },
  ])

  // Estado para os cardápios - iniciar com um cardápio com itens padrão
  const [menus, setMenus] = useState<
    Array<{
      id: string
      name: string
      items: Array<{ name: string; type: "food" | "drink" }>
    }>
  >([
    {
      id: Date.now().toString(),
      name: "Cardápio Principal",
      items: [
        { name: "Prato principal", type: "food" },
        { name: "Bebida", type: "drink" },
      ],
    },
  ])

  // Estados para erros
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Carregar dados do orçamento se estiver editando
  useEffect(() => {
    if (isEditing && budgetId) {
      const budget = getBudget(budgetId)
      if (budget) {
        setClientName(budget.client.name)
        setClientPhone(budget.client.phone || "")
        setClientEmail(budget.client.email || "")
        setClientDocument(budget.client.document || "")
        setValue(budget.value.toString())
        setPeopleCount(budget.peopleCount.toString())
        setNotes(budget.notes || "")
        setEventDate(new Date(budget.eventDate))

        // Carregar pessoas
        if (budget.people && budget.people.length > 0) {
          setPeople(
            budget.people.map((person) => ({
              name: person.name,
              role: person.role,
              salary: person.salary.toString(),
            })),
          )
        }

        // Carregar cardápios
        if (budget.menus && budget.menus.length > 0) {
          setMenus(budget.menus)
        }
      }
    }
  }, [isEditing, budgetId, getBudget])

  // Adicionar um novo cardápio
  const addMenu = () => {
    setMenus([
      ...menus,
      {
        id: Date.now().toString(),
        name: `Cardápio ${menus.length + 1}`,
        items: [
          { name: "", type: "food" },
          { name: "", type: "drink" },
        ],
      },
    ])
  }

  // Remover um cardápio
  const removeMenu = (menuId: string) => {
    setMenus(menus.filter((menu) => menu.id !== menuId))
  }

  // Atualizar nome do cardápio
  const updateMenuName = (menuId: string, name: string) => {
    setMenus(
      menus.map((menu) => {
        if (menu.id === menuId) {
          return { ...menu, name }
        }
        return menu
      }),
    )
  }

  // Adicionar um item ao cardápio
  const addMenuItem = (menuId: string, type: "food" | "drink") => {
    setMenus(
      menus.map((menu) => {
        if (menu.id === menuId) {
          return {
            ...menu,
            items: [...menu.items, { name: "", type }],
          }
        }
        return menu
      }),
    )
  }

  // Remover um item do cardápio
  const removeMenuItem = (menuId: string, index: number) => {
    setMenus(
      menus.map((menu) => {
        if (menu.id === menuId) {
          const newItems = [...menu.items]
          newItems.splice(index, 1)
          return { ...menu, items: newItems }
        }
        return menu
      }),
    )
  }

  // Atualizar um item do cardápio
  const updateMenuItem = (menuId: string, index: number, field: keyof MenuItem, value: string) => {
    setMenus(
      menus.map((menu) => {
        if (menu.id === menuId) {
          const newItems = [...menu.items]
          newItems[index] = { ...newItems[index], [field]: value }
          return { ...menu, items: newItems }
        }
        return menu
      }),
    )
  }

  // Adicionar uma nova pessoa
  const addPerson = () => {
    setPeople([...people, { name: "", role: "", salary: "" }])
  }

  // Remover uma pessoa
  const removePerson = (index: number) => {
    const newPeople = [...people]
    newPeople.splice(index, 1)
    setPeople(newPeople)
  }

  // Atualizar dados de uma pessoa
  const updatePerson = (index: number, field: string, value: string) => {
    const newPeople = [...people]
    newPeople[index] = { ...newPeople[index], [field]: value }
    setPeople(newPeople)
  }

  // Validar o formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    console.log("Validando formulário...", {
      clientName,
      value,
      peopleCount,
      eventDate,
      people,
      menus,
    })

    if (!clientName.trim()) {
      newErrors.clientName = "O nome do cliente é obrigatório"
    }

    if (clientEmail && !/\S+@\S+\.\S+/.test(clientEmail)) {
      newErrors.clientEmail = "Email inválido"
    }

    const valueNum = Number.parseFloat(value)
    if (isNaN(valueNum) || valueNum <= 0) {
      newErrors.value = "O valor deve ser maior que zero"
    }

    const peopleCountNum = Number.parseInt(peopleCount)
    if (isNaN(peopleCountNum) || peopleCountNum <= 0) {
      newErrors.peopleCount = "O número de pessoas deve ser maior que zero"
    }

    if (!eventDate) {
      newErrors.eventDate = "A data do evento é obrigatória"
    }

    // Validar pessoas - pelo menos uma pessoa com nome preenchido
    const validPeople = people.filter((person) => person.name.trim() !== "")
    if (validPeople.length === 0) {
      newErrors.people = "Adicione pelo menos uma pessoa"
    } else {
      // Validar cada pessoa que tenha nome preenchido
      people.forEach((person, index) => {
        if (person.name.trim() !== "") {
          if (person.role.trim() === "") {
            newErrors[`personRole-${index}`] = "Cargo é obrigatório"
          }

          const salary = Number.parseFloat(person.salary)
          if (isNaN(salary) || salary <= 0) {
            newErrors[`personSalary-${index}`] = "Salário deve ser maior que zero"
          }
        }
      })
    }

    // Validar cardápios - pelo menos um cardápio com nome preenchido
    const validMenus = menus.filter((menu) => menu.name.trim() !== "")
    if (validMenus.length === 0) {
      newErrors.menus = "Adicione pelo menos um cardápio"
    } else {
      // Validar cada cardápio que tenha nome preenchido
      menus.forEach((menu, menuIndex) => {
        if (menu.name.trim() !== "") {
          // Validar itens apenas se houver pelo menos um
          const validItems = menu.items.filter((item) => item.name.trim() !== "")
          if (validItems.length === 0) {
            newErrors[`menuItems-${menuIndex}`] = "Adicione pelo menos um item ao cardápio"
          }
        }
      })
    }

    console.log("Erros de validação:", newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enviar o formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Tentando enviar formulário...")

    if (!validateForm()) {
      console.log("Formulário inválido, não enviado")
      toast({
        variant: "destructive",
        title: "Erro ao criar orçamento",
        description: "Por favor, corrija os erros no formulário antes de continuar.",
      })

      if (onError) {
        onError("Por favor, corrija os erros destacados no formulário antes de continuar.")
      }
      return
    }

    try {
      // Converter pessoas para o formato correto
      const formattedPeople = people
        .filter((person) => person.name.trim() !== "")
        .map((person) => ({
          name: person.name,
          role: person.role,
          salary: Number.parseFloat(person.salary) || 0,
        }))

      // Converter cardápios para o formato correto
      const formattedMenus = menus
        .filter((menu) => menu.name.trim() !== "")
        .map((menu) => ({
          id: menu.id,
          name: menu.name,
          items: menu.items.filter((item) => item.name.trim() !== ""),
        }))

      const budgetData: Omit<Budget, "id" | "createdAt" | "status"> = {
        client: {
          name: clientName,
          phone: clientPhone || undefined,
          email: clientEmail || undefined,
          document: clientDocument || undefined,
        },
        value: Number.parseFloat(value) || 0,
        peopleCount: Number.parseInt(peopleCount) || 0,
        dishes: [], // Mantido para compatibilidade
        notes: notes || undefined,
        eventDate: eventDate as Date,
        people: formattedPeople,
        menus: formattedMenus,
      }

      console.log("Dados do orçamento formatados:", budgetData)

      if (isEditing && budgetId) {
        // Atualizar orçamento existente
        const existingBudget = getBudget(budgetId)
        if (existingBudget) {
          const updatedBudget: Budget = {
            ...existingBudget,
            ...budgetData,
          }
          updateBudget(budgetId, updatedBudget)

          toast({
            title: "Orçamento atualizado",
            description: "O orçamento foi atualizado com sucesso.",
          })

          console.log("Orçamento atualizado com sucesso")
          router.push("/orcamentos")
        }
      } else {
        // Criar novo orçamento
        const newBudget: Budget = {
          id: Date.now().toString(),
          createdAt: new Date(),
          status: "pending",
          ...budgetData,
        }

        console.log("Criando novo orçamento:", newBudget)
        addBudget(newBudget)

        toast({
          title: "Orçamento criado",
          description: "O orçamento foi criado com sucesso.",
        })

        console.log("Orçamento criado com sucesso")
        router.push("/orcamentos")
      }
    } catch (error) {
      console.error("Erro ao criar/atualizar orçamento:", error)
      toast({
        variant: "destructive",
        title: "Erro ao processar orçamento",
        description: "Ocorreu um erro ao criar ou atualizar o orçamento. Tente novamente.",
      })

      if (onError) {
        onError(`Erro ao processar orçamento: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
      }
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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatDocument(e.target.value)
    setClientDocument(formattedValue)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Informações do Cliente</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="clientName" className="text-sm font-medium">
              Nome do Cliente *
            </label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome completo"
            />
            {errors.clientName && <p className="text-sm text-red-500">{errors.clientName}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="clientDocument" className="text-sm font-medium">
              CPF/CNPJ
            </label>
            <Input
              id="clientDocument"
              value={clientDocument}
              onChange={handleDocumentChange}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              maxLength={18}
            />
            <p className="text-xs text-muted-foreground">CPF ou CNPJ do cliente</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="clientPhone" className="text-sm font-medium">
              Telefone
            </label>
            <Input
              id="clientPhone"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
            <p className="text-xs text-muted-foreground">Opcional</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="clientEmail" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="clientEmail"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="cliente@exemplo.com"
            />
            <p className="text-xs text-muted-foreground">Opcional</p>
            {errors.clientEmail && <p className="text-sm text-red-500">{errors.clientEmail}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium">Detalhes do Evento</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="eventDate" className="text-sm font-medium">
              Data do Evento *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="eventDate"
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !eventDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={eventDate} onSelect={setEventDate} initialFocus />
              </PopoverContent>
            </Popover>
            {errors.eventDate && <p className="text-sm text-red-500">{errors.eventDate}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="peopleCount" className="text-sm font-medium">
              Número de Pessoas *
            </label>
            <Input
              id="peopleCount"
              type="number"
              min="1"
              value={peopleCount}
              onChange={(e) => setPeopleCount(e.target.value)}
            />
            {errors.peopleCount && <p className="text-sm text-red-500">{errors.peopleCount}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="value" className="text-sm font-medium">
              Valor Total (R$) *
            </label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            {errors.value && <p className="text-sm text-red-500">{errors.value}</p>}
          </div>
        </div>

        {/* Seção de Cardápios */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Cardápios</h3>
            <Button type="button" variant="outline" size="sm" onClick={addMenu}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cardápio
            </Button>
          </div>

          {errors.menus && <p className="text-sm text-red-500">{errors.menus}</p>}

          {menus.length === 0 ? (
            <div className="text-center py-4 border rounded-md bg-muted/20">
              <p className="text-muted-foreground">Nenhum cardápio adicionado. Clique em "Adicionar Cardápio".</p>
            </div>
          ) : (
            <Tabs defaultValue={menus[0].id} className="w-full">
              <TabsList className="w-full flex overflow-x-auto">
                {menus.map((menu) => (
                  <TabsTrigger key={menu.id} value={menu.id} className="flex-1">
                    {menu.name || `Cardápio ${menus.indexOf(menu) + 1}`}
                  </TabsTrigger>
                ))}
              </TabsList>

              {menus.map((menu, menuIndex) => (
                <TabsContent key={menu.id} value={menu.id} className="mt-4">
                  <div className="p-4 border rounded-md bg-muted/20">
                    <div className="flex justify-between items-center mb-4">
                      <div className="space-y-2 flex-1 mr-4">
                        <label className="text-sm font-medium">Nome do Cardápio *</label>
                        <Input
                          placeholder="Ex: Cardápio Principal, Cardápio VIP, etc."
                          value={menu.name}
                          onChange={(e) => updateMenuName(menu.id, e.target.value)}
                        />
                        {errors[`menuName-${menuIndex}`] && (
                          <p className="text-sm text-red-500">{errors[`menuName-${menuIndex}`]}</p>
                        )}
                      </div>
                      {menus.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMenu(menu.id)}
                          className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remover Cardápio
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Itens do Cardápio</h4>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addMenuItem(menu.id, "food")}
                          >
                            <Utensils className="h-4 w-4 mr-2" />
                            Adicionar Prato
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addMenuItem(menu.id, "drink")}
                          >
                            <Wine className="h-4 w-4 mr-2" />
                            Adicionar Bebida
                          </Button>
                        </div>
                      </div>

                      {errors[`menuItems-${menuIndex}`] && (
                        <p className="text-sm text-red-500">{errors[`menuItems-${menuIndex}`]}</p>
                      )}

                      {menu.items.length === 0 ? (
                        <div className="text-center py-4 border rounded-md">
                          <p className="text-muted-foreground">
                            Nenhum item adicionado. Adicione pratos ou bebidas ao cardápio.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {menu.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="p-4 border rounded-md bg-background">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium">
                                  {item.type === "food" ? "Prato" : "Bebida"} #{itemIndex + 1}
                                </h5>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMenuItem(menu.id, itemIndex)}
                                  className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Remover Item</span>
                                </Button>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Nome *</label>
                                  <Input
                                    placeholder={item.type === "food" ? "Ex: Filé Mignon" : "Ex: Vinho Tinto"}
                                    value={item.name}
                                    onChange={(e) => updateMenuItem(menu.id, itemIndex, "name", e.target.value)}
                                  />
                                  {errors[`menuItemName-${menuIndex}-${itemIndex}`] && (
                                    <p className="text-sm text-red-500">
                                      {errors[`menuItemName-${menuIndex}-${itemIndex}`]}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Tipo</label>
                                  <Select
                                    value={item.type}
                                    onValueChange={(value) =>
                                      updateMenuItem(menu.id, itemIndex, "type", value as "food" | "drink")
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="food">Prato</SelectItem>
                                      <SelectItem value="drink">Bebida</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        {/* Seção de Pessoas */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Pessoas do Evento *</label>
            <Button type="button" variant="outline" size="sm" onClick={addPerson}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pessoa
            </Button>
          </div>

          {errors.people && <p className="text-sm text-red-500">{errors.people}</p>}

          {people.map((person, index) => (
            <div key={index} className="p-4 border rounded-md bg-muted/20">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Pessoa {index + 1}</h4>
                {people.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePerson(index)}
                    className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome *</label>
                  <Input
                    placeholder="Nome da pessoa"
                    value={person.name}
                    onChange={(e) => updatePerson(index, "name", e.target.value)}
                  />
                  {errors[`personName-${index}`] && (
                    <p className="text-sm text-red-500">{errors[`personName-${index}`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cargo *</label>
                  <Input
                    placeholder="Cargo/Função"
                    value={person.role}
                    onChange={(e) => updatePerson(index, "role", e.target.value)}
                  />
                  {errors[`personRole-${index}`] && (
                    <p className="text-sm text-red-500">{errors[`personRole-${index}`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Salário (R$) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={person.salary}
                    onChange={(e) => updatePerson(index, "salary", e.target.value)}
                  />
                  {errors[`personSalary-${index}`] && (
                    <p className="text-sm text-red-500">{errors[`personSalary-${index}`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        {isEditing ? "Atualizar Orçamento" : "Criar Orçamento"}
      </Button>
    </form>
  )
}