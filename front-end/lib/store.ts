import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncClientWithEvent } from "./client-store";
import * as orcamentosService from "./api/orcamentosService";

// Interfaces (mantenha as que você já tem, apenas ajustando os nomes)
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
  
  // Operações de Evento
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updatedEvent: Event) => void;
  addTransaction: (eventId: string, transaction: Transaction) => void;
  getEvent: (eventId: string) => Event | undefined;
  getEventBalance: (eventId: string) => Balance;
  getAllEventsBalance: () => Balance;
  getEventSources: (eventId: string) => string[];
  getSourceBalance: (eventId: string, source: string) => SourceBalance;
  getAllSourcesBalances: (eventId: string) => SourceBalance[];
  canSpendFromSource: (eventId: string, source: string, amount: number) => boolean;
  
  // Operações de Budget
  fetchBudgets: () => Promise<void>;
  createBudget: (budget: Budget) => Promise<void>;
  getBudget: (id: string) => Promise<Budget | undefined>;
  updateBudget: (id: string, budget: Budget) => Promise<void>;
  updateBudgetStatus: (id: string, status: "pending" | "accepted" | "rejected") => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  // Removido: convertBudgetToEvent
}

// Funções de conversão
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
    status: orcamento.status === 'ACEITO' ? 'ACEITO' : 
           orcamento.status === 'RECUSADO' ? 'RECUSADO' : 'PENDENTE',
    eventId: orcamento.eventId?.toString(),
    funcionarios: orcamento.funcionarios,
    cardapios: orcamento.cardapios,
    valorTotal: orcamento.valorTotal,
  };
}

function toOrcamentoPayload(budget: Budget): orcamentosService.OrcamentoPayload {
  return {
    cliente: budget.cliente,
    dataDoEvento: budget.dataDoEvento.toISOString(),
    quantidadePessoas: budget.quantidadePessoas,
    valorPorPessoa: budget.valorPorPessoa,
    dataLimite: budget.dataLimite?.toISOString(),
    cardapios: budget.cardapios,
    funcionarios: budget.funcionarios,
    notas: budget.notas,
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

      // Implementação das funções de budget:
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

      createBudget: async (budget) => {
        set({ loading: true, error: null });
        try {
          const payload = toOrcamentoPayload(budget);
          const response = await orcamentosService.enviarOrcamento(payload);
          const newBudget = toBudget(response);
          
          set(state => ({
            budgets: [...state.budgets, newBudget],
            lastUpdate: Date.now(),
            loading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Erro ao criar orçamento', loading: false });
          throw error;
        }
      },

      getBudget: async (id) => {
        // Como seu serviço atual não tem GET por ID, vamos buscar localmente
        return get().budgets.find(b => b.id === id);
      },

      updateBudget: async (id, budget) => {
        set({ loading: true, error: null });
        try {
          const payload = toOrcamentoPayload(budget);
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
          const apiStatus = status === 'accepted' ? 'ACEITO' : 
                          status === 'rejected' ? 'RECUSADO' : 'PENDENTE';
          
          const response = await orcamentosService.atualizarStatusOrcamento(Number(id), apiStatus);
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

      // Implemente as outras funções obrigatórias da interface

      addEvent: (event) => {
        set(state => ({
          events: [...state.events, event],
          lastUpdate: Date.now(),
        }));
      },

      updateEvent: (eventId, updatedEvent) => {
        set(state => ({
          events: state.events.map(e => e.id === eventId ? updatedEvent : e),
          lastUpdate: Date.now(),
        }));
      },

      addTransaction: (eventId, transaction) => {
        set(state => ({
          events: state.events.map(e =>
            e.id === eventId
              ? { ...e, transactions: [...e.transactions, transaction] }
              : e
          ),
          lastUpdate: Date.now(),
        }));
      },

      getEvent: (eventId) => {
        return get().events.find(e => e.id === eventId);
      },

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
        const event = get().events.find(e => e.id === eventId);
        if (!event) return [];
        const sources = new Set<string>();
        event.transactions.forEach(t => {
          if (t.source) sources.add(t.source);
        });
        return Array.from(sources).map(source =>
          get().getSourceBalance(eventId, source)
        );
      },

      canSpendFromSource: (eventId, source, amount) => {
        const balance = get().getSourceBalance(eventId, source);
        return balance.available >= amount;
      },
    }),
    {
      name: "event-storage",
      // ... (configuração de persistência)
    }
  )
);