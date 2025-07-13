import { create } from "zustand"
import { persist } from "zustand/middleware"
import { syncClientWithEvent } from "./client-store"

export interface Transaction {
  id: string
  description: string
  amount: number
  type: "expense" | "budget"
  source: string | null // De onde vem o dinheiro
  destination: string | null // Para onde vai o dinheiro
  date: Date
}

export type EventStatus = "pending" | "confirmed" | "canceled" | "completed"

export interface Client {
  id?: string
  name: string
  phone?: string
  email?: string
  document?: string // CPF ou CNPJ
}

// Interface para pratos e bebidas
export interface MenuItem {
  name: string
  description?: string // Tornar a descrição opcional
  type: "food" | "drink"
}

// Interface para cardápios
export interface Menu {
  id: string
  name: string
  items: MenuItem[]
}

// Interface para pessoas
export interface Person {
  name: string
  role: string
  salary: number
}

// Modificar a interface Budget para incluir pessoas e cardápios
export interface Budget {
  id: string
  createdAt: Date
  client: Client
  value: number
  dishes: string[] // Mantido para compatibilidade
  peopleCount: number
  notes?: string
  status: "pending" | "accepted" | "rejected"
  eventId?: string // Referência ao evento criado após aceitação
  eventDate: Date // Data do evento
  people: Person[] // Pessoas do evento
  menus: Menu[] // Cardápios do evento
}

// Modificar a interface Event para incluir pessoas e cardápios
export interface Event {
  id: string
  name: string
  date: Date
  initialValue: number
  transactions: Transaction[]
  status: EventStatus
  client: Client
  dishes?: string[] // Mantido para compatibilidade
  peopleCount?: number
  notes?: string
  people?: Person[] // Pessoas do evento
  menus?: Menu[] // Cardápios do evento
}

interface Balance {
  budget: number
  expenses: number
  total: number
}

interface SourceBalance {
  source: string
  available: number
  total: number
  spent: number
}

interface EventStore {
  events: Event[]
  budgets: Budget[]
  lastUpdate: number // Timestamp da última atualização
  addEvent: (event: Event) => void
  updateEvent: (eventId: string, updatedEvent: Event) => void
  addTransaction: (eventId: string, transaction: Transaction) => void
  getEvent: (eventId: string) => Event | undefined
  getEventBalance: (eventId: string) => Balance
  getAllEventsBalance: () => Balance
  getEventSources: (eventId: string) => string[]
  getSourceBalance: (eventId: string, source: string) => SourceBalance
  getAllSourcesBalances: (eventId: string) => SourceBalance[]
  canSpendFromSource: (eventId: string, source: string, amount: number) => boolean
  // Funções para orçamentos
  addBudget: (budget: Budget) => void
  updateBudget: (budgetId: string, updatedBudget: Budget) => void
  getBudget: (budgetId: string) => Budget | undefined
  convertBudgetToEvent: (budgetId: string) => string | undefined // Retorna o ID do evento criado
  updateEventStatus: (eventId: string, status: EventStatus) => void
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],
      budgets: [],
      lastUpdate: Date.now(),

      addEvent: (event) => {
        try {
          // Garantir que a data seja um objeto Date
          const safeEvent = {
            ...event,
            date: event.date instanceof Date ? event.date : new Date(event.date),
          }

          // Sincronizar cliente
          if (safeEvent.client && safeEvent.client.name) {
            const clientId = syncClientWithEvent(safeEvent.client, safeEvent.id)
            console.log("Cliente sincronizado com ID:", clientId)

            // Atualizar o ID do cliente no evento se necessário
            if (clientId && (!safeEvent.client.id || safeEvent.client.id !== clientId)) {
              safeEvent.client.id = clientId
            }
          }

          set((state) => ({
            events: [...state.events, safeEvent],
            lastUpdate: Date.now(),
          }))

          console.log("Evento adicionado com sucesso:", safeEvent)
        } catch (error) {
          console.error("Erro ao adicionar evento:", error)
        }
      },

      updateEvent: (eventId, updatedEvent) => {
        try {
          // Garantir que a data seja um objeto Date
          const safeEvent = {
            ...updatedEvent,
            date: updatedEvent.date instanceof Date ? updatedEvent.date : new Date(updatedEvent.date),
            // Garantir que as transações tenham datas válidas
            transactions: updatedEvent.transactions.map((t) => ({
              ...t,
              date: t.date instanceof Date ? t.date : new Date(t.date),
            })),
          }

          // Sincronizar cliente
          if (safeEvent.client && safeEvent.client.name) {
            const clientId = syncClientWithEvent(safeEvent.client, safeEvent.id)
            console.log("Cliente sincronizado com ID:", clientId)

            // Atualizar o ID do cliente no evento se necessário
            if (clientId && (!safeEvent.client.id || safeEvent.client.id !== clientId)) {
              safeEvent.client.id = clientId
            }
          }

          // Atualizar o evento no estado
          set((state) => ({
            events: state.events.map((event) => (event.id === eventId ? safeEvent : event)),
            lastUpdate: Date.now(),
          }))

          // Log para debug
          console.log("Evento atualizado com sucesso:", safeEvent)

          return true
        } catch (error) {
          console.error("Erro ao atualizar evento:", error)
          return false
        }
      },

      addTransaction: (eventId, transaction) => {
        try {
          // Garantir que a data seja um objeto Date
          const safeTransaction = {
            ...transaction,
            date: transaction.date instanceof Date ? transaction.date : new Date(transaction.date),
            amount: Number(transaction.amount), // Garantir que amount seja um número
          }

          set((state) => ({
            events: state.events.map((event) => {
              if (event.id === eventId) {
                return {
                  ...event,
                  transactions: [...event.transactions, safeTransaction],
                }
              }
              return event
            }),
            lastUpdate: Date.now(),
          }))

          console.log("Transação adicionada com sucesso:", safeTransaction)
        } catch (error) {
          console.error("Erro ao adicionar transação:", error)
        }
      },

      getEvent: (eventId) => {
        const event = get().events.find((event) => event.id === eventId)
        if (!event) return undefined

        // Evitar criar um novo objeto a cada chamada se as datas já forem objetos Date
        if (event.date instanceof Date && event.transactions.every((t) => t.date instanceof Date)) {
          return event
        }

        // Caso contrário, converter as datas
        return {
          ...event,
          date: event.date instanceof Date ? event.date : new Date(event.date),
          transactions: event.transactions.map((t) => ({
            ...t,
            date: t.date instanceof Date ? t.date : new Date(t.date),
          })),
        }
      },

      getEventBalance: (eventId) => {
        const event = get().getEvent(eventId)
        if (!event) return { budget: 0, expenses: 0, total: 0 }

        const budget = event.transactions.filter((t) => t.type === "budget").reduce((sum, t) => sum + t.amount, 0)

        const expenses = event.transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

        return {
          budget,
          expenses,
          total: budget - expenses,
        }
      },

      getAllEventsBalance: () => {
        const events = get().events

        let totalBudget = 0
        let totalExpenses = 0

        events.forEach((event) => {
          event.transactions.forEach((transaction) => {
            if (transaction.type === "budget") {
              totalBudget += transaction.amount
            } else {
              totalExpenses += transaction.amount
            }
          })
        })

        return {
          budget: totalBudget,
          expenses: totalExpenses,
          total: totalBudget - totalExpenses,
        }
      },

      // Funções para gerenciar fontes
      getEventSources: (eventId) => {
        const event = get().getEvent(eventId)
        if (!event) return []

        // Obter todas as fontes únicas
        const sources = new Set<string>()

        // Adicionar fontes de orçamento
        event.transactions
          .filter((t) => t.type === "budget" && t.source)
          .forEach((t) => {
            if (t.source) sources.add(t.source)
          })

        return Array.from(sources)
      },

      getSourceBalance: (eventId, source) => {
        const event = get().getEvent(eventId)
        if (!event) return { source, available: 0, total: 0, spent: 0 }

        // Calcular total de orçamento desta fonte
        const totalBudget = event.transactions
          .filter((t) => t.type === "budget" && t.source === source)
          .reduce((sum, t) => sum + t.amount, 0)

        // Calcular total gasto desta fonte
        const totalSpent = event.transactions
          .filter((t) => t.type === "expense" && t.source === source)
          .reduce((sum, t) => sum + t.amount, 0)

        // Calcular saldo disponível
        const available = totalBudget - totalSpent

        return {
          source,
          total: totalBudget,
          spent: totalSpent,
          available,
        }
      },

      getAllSourcesBalances: (eventId) => {
        const sources = get().getEventSources(eventId)
        return sources.map((source) => get().getSourceBalance(eventId, source))
      },

      canSpendFromSource: (eventId, source, amount) => {
        const sourceBalance = get().getSourceBalance(eventId, source)
        return sourceBalance.available >= amount
      },

      // Funções para orçamentos
      addBudget: (budget) => {
        try {
          console.log("Adicionando orçamento:", budget)

          // Garantir que as datas sejam objetos Date válidos
          const safeBudget = {
            ...budget,
            createdAt: budget.createdAt instanceof Date ? budget.createdAt : new Date(budget.createdAt || new Date()),
            eventDate: budget.eventDate instanceof Date ? budget.eventDate : new Date(budget.eventDate || new Date()),
          }

          // Garantir que arrays estejam inicializados
          if (!safeBudget.people) safeBudget.people = []
          if (!safeBudget.menus) safeBudget.menus = []
          if (!safeBudget.dishes) safeBudget.dishes = []

          // Garantir que valores numéricos sejam válidos
          safeBudget.value = Number(safeBudget.value) || 0
          safeBudget.peopleCount = Number(safeBudget.peopleCount) || 0

          console.log("Orçamento processado:", safeBudget)

          set((state) => ({
            budgets: [...state.budgets, safeBudget],
            lastUpdate: Date.now(),
          }))

          console.log("Orçamento adicionado com sucesso")
        } catch (error) {
          console.error("Erro ao adicionar orçamento:", error)
          throw error
        }
      },

      updateBudget: (budgetId, updatedBudget) => {
        const safeBudget = {
          ...updatedBudget,
          createdAt:
            updatedBudget.createdAt instanceof Date ? updatedBudget.createdAt : new Date(updatedBudget.createdAt),
          eventDate:
            updatedBudget.eventDate instanceof Date ? updatedBudget.eventDate : new Date(updatedBudget.eventDate),
        }

        set((state) => ({
          budgets: state.budgets.map((budget) => (budget.id === budgetId ? safeBudget : budget)),
          lastUpdate: Date.now(),
        }))
      },

      getBudget: (budgetId) => {
        const budget = get().budgets.find((budget) => budget.id === budgetId)
        if (!budget) return undefined

        return {
          ...budget,
          createdAt: budget.createdAt instanceof Date ? budget.createdAt : new Date(budget.createdAt),
          eventDate: budget.eventDate instanceof Date ? budget.eventDate : new Date(budget.eventDate),
        }
      },

      // Modificar a função convertBudgetToEvent para incluir as pessoas e cardápios
      convertBudgetToEvent: (budgetId) => {
        const budget = get().getBudget(budgetId)
        if (!budget) return undefined

        // Criar um novo evento baseado no orçamento
        const eventId = Date.now().toString()
        const newEvent: Event = {
          id: eventId,
          name: `Evento para ${budget.client.name}`,
          date: budget.eventDate, // Usar a data do evento do orçamento
          initialValue: budget.value,
          transactions: [
            {
              id: `${eventId}-initial`,
              description: "Forma de pagamento inicial",
              amount: budget.value,
              type: "budget",
              source: "Cliente",
              destination: null,
              date: new Date(),
            },
          ],
          status: "confirmed",
          client: budget.client,
          dishes: budget.dishes,
          peopleCount: budget.peopleCount,
          notes: budget.notes,
          people: budget.people, // Incluir as pessoas do orçamento no evento
          menus: budget.menus, // Incluir os cardápios do orçamento no evento
        }

        // Adicionar o evento
        get().addEvent(newEvent)

        // Atualizar o orçamento com o ID do evento e status
        const updatedBudget = {
          ...budget,
          status: "accepted" as const,
          eventId,
        }
        get().updateBudget(budgetId, updatedBudget)

        return eventId
      },

      updateEventStatus: (eventId, status) => {
        set((state) => ({
          events: state.events.map((event) => (event.id === eventId ? { ...event, status } : event)),
          lastUpdate: Date.now(),
        }))
      },
    }),
    {
      name: "event-storage",
      // Transformar datas em strings ao armazenar e em objetos Date ao recuperar
      serialize: (state) => {
        return JSON.stringify(state)
      },
      deserialize: (str) => {
        const state = JSON.parse(str)

        // Converter datas de string para objeto Date
        if (state.state.events) {
          state.state.events = state.state.events.map((event: any) => ({
            ...event,
            date: new Date(event.date),
            transactions: event.transactions.map((t: any) => ({
              ...t,
              date: new Date(t.date),
            })),
          }))
        }

        // Converter datas de orçamentos
        if (state.state.budgets) {
          state.state.budgets = state.state.budgets.map((budget: any) => ({
            ...budget,
            createdAt: new Date(budget.createdAt),
            eventDate: budget.eventDate ? new Date(budget.eventDate) : new Date(),
          }))
        }

        return state
      },
    },
  ),
)
