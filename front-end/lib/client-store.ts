import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEventStore } from "./store"

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  document?: string // CPF ou CNPJ
  notes?: string
  events: string[] // IDs dos eventos relacionados a este cliente
}

interface ClientStore {
  clients: Client[]
  addClient: (client: Client) => void
  updateClient: (clientId: string, updatedClient: Client) => void
  deleteClient: (clientId: string) => void
  getClient: (clientId: string) => Client | undefined
  addEventToClient: (clientId: string, eventId: string) => void
  removeEventFromClient: (clientId: string, eventId: string) => void
  getAllClients: () => Client[]
  getClientByName: (name: string) => Client | undefined
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],

      addClient: (client) => {
        // Verificar se o cliente já existe
        const existingClient = get().clients.find((c) => c.id === client.id)
        if (existingClient) {
          console.log("Cliente já existe, atualizando:", client)
          get().updateClient(client.id, client)
          return
        }

        console.log("Adicionando novo cliente:", client)
        set((state) => ({
          clients: [...state.clients, client],
        }))
      },

      updateClient: (clientId, updatedClient) => {
        console.log("Atualizando cliente:", clientId, updatedClient)
        set((state) => ({
          clients: state.clients.map((client) => (client.id === clientId ? updatedClient : client)),
        }))
      },

      deleteClient: (clientId) => {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== clientId),
        }))
      },

      getClient: (clientId) => {
        return get().clients.find((client) => client.id === clientId)
      },

      getAllClients: () => {
        return get().clients
      },

      getClientByName: (name) => {
        return get().clients.find((client) => client.name === name)
      },

      addEventToClient: (clientId, eventId) => {
        console.log("Adicionando evento ao cliente:", clientId, eventId)
        set((state) => ({
          clients: state.clients.map((client) => {
            if (client.id === clientId) {
              // Verificar se o evento já está na lista
              if (client.events.includes(eventId)) {
                return client
              }
              return {
                ...client,
                events: [...client.events, eventId],
              }
            }
            return client
          }),
        }))
      },

      removeEventFromClient: (clientId, eventId) => {
        set((state) => ({
          clients: state.clients.map((client) => {
            if (client.id === clientId) {
              return {
                ...client,
                events: client.events.filter((id) => id !== eventId),
              }
            }
            return client
          }),
        }))
      },
    }),
    {
      name: "client-storage",
    },
  ),
)

// Função auxiliar para sincronizar clientes com eventos
export function syncClientWithEvent(clientData: any, eventId: string) {
  const clientStore = useClientStore.getState()
  const eventStore = useEventStore.getState()

  // Se o cliente não tem ID, gerar um
  if (!clientData.id) {
    clientData.id = Date.now().toString()
  }

  // Verificar se o cliente já existe pelo nome
  const existingClient = clientStore.getClientByName(clientData.name)

  if (existingClient) {
    // Atualizar cliente existente
    const updatedClient = {
      ...existingClient,
      ...clientData,
      events: existingClient.events.includes(eventId) ? existingClient.events : [...existingClient.events, eventId],
    }

    clientStore.updateClient(existingClient.id, updatedClient)
    console.log("Cliente atualizado:", updatedClient)
    return updatedClient.id
  } else {
    // Criar novo cliente
    const newClient = {
      id: clientData.id,
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      document: clientData.document,
      notes: clientData.notes,
      events: [eventId],
    }

    clientStore.addClient(newClient)
    console.log("Novo cliente adicionado:", newClient)
    return newClient.id
  }
}
