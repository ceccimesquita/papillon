import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncClientWithEvent } from "./client-store";
import * as orcamentosService from "./api/orcamentosService";
import * as eventoService from "./api/eventoService"; // Import the evento service

// Interfaces
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "expense" | "budget";
  source: string | null;
  destination: string | null;
  date: Date;
}

export type EventStatus = "pending" | "confirmed" | "canceled" | "completed";

export interface Client {
  id?: string;
  nome: string;
  telefone?: string;
  email?: string;
  cpfCnpj?: string;
}

export interface MenuItem {
  nome: string;
  descricao?: string;
  tipo: "prato" | "bebida";
}

export interface Menu {
  nome: string;
  tipo: "prato" | "bebida";
  descricao?: string;
}

export interface Person {
  nome: string;
  funcao: string;
  valor: number;
}

export interface Budget {
  id: string;
  createdAt: Date;
  cliente: Client;
  valorPorPessoa: number;
  quantidadePessoas: number;
  dataDoEvento: Date;
  dataLimite?: Date;
  notas?: string;
  status: "PENDENTE" | "ACEITO" | "RECUSADO";
  eventId?: string;
  funcionarios: Person[];
  cardapios: Menu[];
  valorTotal: number;
}

export interface Event {
  id: string;
  nome: string;
  data: Date;
  initialValue: number;
  transactions: Transaction[];
  status: EventStatus;
  cliente: Client;
  quantidadePessoas?: number;
  notas?: string;
  funcionarios?: Person[];
  cardapios?: Menu[];
}

interface Balance {
  budget: number;
  expenses: number;
  total: number;
}

interface SourceBalance {
  source: string;
  available: number;
  total: number;
  spent: number;
}

interface EventStore {
  events: Event[];
  budgets: Budget[];
  lastUpdate: number;
  loading: boolean;
  error: string | null;
  
  // Event operations
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, 'id'>) => Promise<Event>;
  updateEvent: (eventId: string, updatedEvent: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  getEvent: (eventId: string) => Event | undefined;
  addTransaction: (eventId: string, transaction: Omit<Transaction, 'id'>) => Promise<void>;
  
  // Budget operations
  fetchBudgets: () => Promise<void>;
  createBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'status'>) => Promise<Budget>;
  getBudget: (id: string) => Promise<Budget | undefined>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  updateBudgetStatus: (id: string, status: "PENDENTE" | "ACEITO" | "RECUSADO") => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Balance operations
  getEventBalance: (eventId: string) => Balance;
  getAllEventsBalance: () => Balance;
  getEventSources: (eventId: string) => string[];
  getSourceBalance: (eventId: string, source: string) => SourceBalance;
  getAllSourcesBalances: (eventId: string) => SourceBalance[];
  canSpendFromSource: (eventId: string, source: string, amount: number) => boolean;
}

// Conversion functions
function toBudget(orcamento: orcamentosService.OrcamentoResponse): Budget {
  return {
    id: orcamento.id.toString(),
    createdAt: new Date(orcamento.createdAt),
    cliente: orcamento.cliente,
    valorPorPessoa: orcamento.valorPorPessoa,
    quantidadePessoas: orcamento.quantidadePessoas,
    dataDoEvento: new Date(orcamento.dataDoEvento),
    dataLimite: orcamento.dataLimite ? new Date(orcamento.dataLimite) : undefined,
    notas: orcamento.notas,
    status: orcamento.status,
    eventId: orcamento.eventId?.toString(),
    funcionarios: orcamento.funcionarios,
    cardapios: orcamento.cardapios,
    valorTotal: orcamento.valorTotal,
  };
}

function toOrcamentoPayload(budget: Partial<Budget>): orcamentosService.OrcamentoPayload {
  return {
    cliente: budget.cliente!,
    dataDoEvento: budget.dataDoEvento!.toISOString(),
    quantidadePessoas: budget.quantidadePessoas!,
    valorPorPessoa: budget.valorPorPessoa!,
    dataLimite: budget.dataLimite?.toISOString(),
    cardapios: budget.cardapios || [],
    funcionarios: budget.funcionarios || [],
    notas: budget.notas,
  };
}

function toEventDto(event: Partial<Event>): eventoService.EventoCreateDto {
  return {
    nome: event.nome!,
    dataEvento: event.data!.toISOString(),
    clienteId: parseInt(event.cliente?.id || '0'),
    orcamentoId: event.id ? parseInt(event.id) : undefined,
    descricao: event.notas,
    // Add other properties as needed
  };
}

function fromEventDto(dto: eventoService.EventoShowDto): Event {
  return {
    id: dto.id.toString(),
    nome: dto.nome,
    data: new Date(dto.dataEvento),
    initialValue: dto.orcamento?.valorTotal || 0,
    transactions: [],
    status: 'confirmed', // Default status
    cliente: {
      id: dto.cliente.id.toString(),
      nome: dto.cliente.nome,
      email: dto.cliente.email,
    },
    quantidadePessoas: (dto.orcamento && 'quantidadePessoas' in dto.orcamento) ? (dto.orcamento as any).quantidadePessoas : undefined,
    notas: dto.descricao,
    // Add other properties as needed
  };
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],
      budgets: [],
      lastUpdate: Date.now(),
      loading: false,
      error: null,

      // Event operations
      fetchEvents: async () => {
        set({ loading: true, error: null });
        try {
          const eventos = await eventoService.listAllEventos();
          const events = eventos.map(fromEventDto);
          set({ events, lastUpdate: Date.now(), loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erro ao carregar eventos', loading: false });
        }
      },

      addEvent: async (eventData) => {
        set({ loading: true, error: null });
        try {
          const dto = toEventDto(eventData);
          const response = await eventoService.createEvento(dto);
          const newEvent = fromEventDto(response);
          
          // Sync client if needed
          if (eventData.cliente) {
            await syncClientWithEvent(eventData.cliente, newEvent.id);
          }

          set(state => ({
            events: [...state.events, newEvent],
            lastUpdate: Date.now(),
            loading: false,
          }));
          
          return newEvent;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erro ao criar evento', loading: false });
          throw error;
        }
      },

      updateEvent: async (eventId, updatedEvent) => {
        set({ loading: true, error: null });
        try {
          const existingEvent = get().events.find(e => e.id === eventId);
          if (!existingEvent) {
            throw new Error('Evento não encontrado');
          }

          const dto = toEventDto({ ...existingEvent, ...updatedEvent });
          const response = await eventoService.updateEvento(parseInt(eventId), dto);
          const updated = fromEventDto(response);

          set(state => ({
            events: state.events.map(e => e.id === eventId ? updated : e),
            lastUpdate: Date.now(),
            loading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erro ao atualizar evento', loading: false });
          throw error;
        }
      },

      deleteEvent: async (eventId) => {
        set({ loading: true, error: null });
        try {
          await eventoService.deleteEvento(parseInt(eventId));
          set(state => ({
            events: state.events.filter(e => e.id !== eventId),
            lastUpdate: Date.now(),
            loading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erro ao deletar evento', loading: false });
          throw error;
        }
      },

      addTransaction: async (eventId, transactionData) => {
        set({ loading: true, error: null });
        try {
          const newTransaction: Transaction = {
            ...transactionData,
            id: Date.now().toString(),
            date: new Date(),
          };

          set(state => ({
            events: state.events.map(e => 
              e.id === eventId 
                ? { ...e, transactions: [...e.transactions, newTransaction] } 
                : e
            ),
            lastUpdate: Date.now(),
            loading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erro ao adicionar transação', loading: false });
          throw error;
        }
      },

      // Budget operations (same as before)
      fetchBudgets: async () => {
        set({ loading: true, error: null });
        try {
          const orcamentos = await orcamentosService.pegarOrcamentos();
          const budgets = orcamentos.map(toBudget);
          set({ budgets, lastUpdate: Date.now(), loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erro ao carregar orçamentos', loading: false });
        }
      },

      createBudget: async (budgetData) => {
        set({ loading: true, error: null });
        try {
          const payload = toOrcamentoPayload(budgetData);
          const response = await orcamentosService.enviarOrcamento(payload);
          const newBudget = toBudget(response);
          
          set(state => ({
            budgets: [...state.budgets, newBudget],
            lastUpdate: Date.now(),
            loading: false,
          }));
          
          return newBudget;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erro ao criar orçamento', loading: false });
          throw error;
        }
      },

      getBudget: async (id) => {
        try {
          const response = await orcamentosService.getOrcamentoById(Number(id));
          if (response !== null && response !== undefined) {
            return toBudget(response);
          }
          return undefined;
        } catch (error) {
          // Fallback to local storage if API fails
          return get().budgets.find(b => b.id === id);
        }
      },

      updateBudget: async (id, budgetData) => {
        set({ loading: true, error: null });
        try {
          const payload = toOrcamentoPayload(budgetData);
          const response = await orcamentosService.atualizarOrcamento(Number(id), payload);
          const updatedBudget = toBudget(response);
          
          set(state => ({
            budgets: state.budgets.map(b => b.id === id ? updatedBudget : b),
            lastUpdate: Date.now(),
            loading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erro ao atualizar orçamento', loading: false });
          throw error;
        }
      },

      updateBudgetStatus: async (id, status) => {
        set({ loading: true, error: null });
        try {
          const response = await orcamentosService.atualizarStatusOrcamento(Number(id), status);
          const updatedBudget = toBudget(response);
          
          set(state => ({
            budgets: state.budgets.map(b => b.id === id ? updatedBudget : b),
            lastUpdate: Date.now(),
            loading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erro ao atualizar status', loading: false });
          throw error;
        }
      },

      deleteBudget: async (id) => {
        set({ loading: true, error: null });
        try {
          await orcamentosService.deletarOrcamento(Number(id));
          set(state => ({
            budgets: state.budgets.filter(b => b.id !== id),
            lastUpdate: Date.now(),
            loading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erro ao deletar orçamento', loading: false });
          throw error;
        }
      },

      // Balance operations (same as before)
      getEventBalance: (eventId) => {
        const event = get().events.find(e => e.id === eventId);
        if (!event) return { budget: 0, expenses: 0, total: 0 };
        
        const budget = event.transactions
          .filter(t => t.type === "budget")
          .reduce((sum, t) => sum + t.amount, 0);
          
        const expenses = event.transactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
          
        return { budget, expenses, total: budget - expenses };
      },

      getAllEventsBalance: () => {
        const events = get().events;
        let budget = 0, expenses = 0;
        
        events.forEach(event => {
          budget += event.transactions
            .filter(t => t.type === "budget")
            .reduce((sum, t) => sum + t.amount, 0);
            
          expenses += event.transactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);
        });
        
        return { budget, expenses, total: budget - expenses };
      },

      getEventSources: (eventId) => {
        const event = get().events.find(e => e.id === eventId);
        if (!event) return [];
        
        const sources = new Set<string>();
        event.transactions.forEach(t => {
          if (t.source) sources.add(t.source);
        });
        
        return Array.from(sources);
      },

      getSourceBalance: (eventId, source) => {
        const event = get().events.find(e => e.id === eventId);
        if (!event) return { source, available: 0, total: 0, spent: 0 };
        
        const total = event.transactions
          .filter(t => t.type === "budget" && t.source === source)
          .reduce((sum, t) => sum + t.amount, 0);
          
        const spent = event.transactions
          .filter(t => t.type === "expense" && t.source === source)
          .reduce((sum, t) => sum + t.amount, 0);
          
        return { source, available: total - spent, total, spent };
      },

      getAllSourcesBalances: (eventId) => {
        const sources = get().getEventSources(eventId);
        return sources.map(source => get().getSourceBalance(eventId, source));
      },

      canSpendFromSource: (eventId, source, amount) => {
        const balance = get().getSourceBalance(eventId, source);
        return balance.available >= amount;
      },

      getEvent: (eventId) => {
        return get().events.find(e => e.id === eventId);
      },
    }),
    {
      name: "event-storage",
      partialize: (state) => ({
        events: state.events,
        budgets: state.budgets,
        lastUpdate: state.lastUpdate,
      }),
    }
  )
);