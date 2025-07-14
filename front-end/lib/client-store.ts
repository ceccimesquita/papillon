import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEventStore } from "./store"
import {
  registerCliente,
  listAllClientes,
  getClienteById,
  getClienteDetails,
  updateClienteById,
  deleteClienteById,
  ClienteDto,
  ClienteDetailsDto,
  ApiResponse
} from "./api/clienteService"

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
  loading: boolean
  error: string | null
  addClient: (client: Omit<Client, 'id' | 'events'>) => Promise<Client>
  updateClient: (clientId: string, updatedClient: Partial<Client>) => Promise<void>
  deleteClient: (clientId: string) => Promise<void>
  getClient: (clientId: string) => Client | undefined
  addEventToClient: (clientId: string, eventId: string) => void
  removeEventFromClient: (clientId: string, eventId: string) => void
  getAllClients: () => Promise<void>
  getClientByName: (name: string) => Client | undefined
  fetchClientDetails: (clientId: string) => Promise<ClienteDetailsDto | null>
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],
      loading: false,
      error: null,

      addClient: async (clientData) => {
        set({ loading: true, error: null })
        try {
          const dto: ClienteDto = {
            nome: clientData.name,
            email: clientData.email,
            telefone: clientData.phone,
            cpfCnpj: clientData.document
          }

          const response = await registerCliente(dto)
          
          if (response.error) {
            throw new Error(response.error)
          }

          const newClient: Client = {
            id: response.cliente && (response.cliente as any).id ? (response.cliente as any).id.toString() : Date.now().toString(),
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            document: clientData.document,
            notes: clientData.notes,
            events: []
          }

          set((state) => ({
            clients: [...state.clients, newClient],
            loading: false
          }))

          return newClient
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
          throw error
        }
      },

      updateClient: async (clientId, updatedClient) => {
        set({ loading: true, error: null })
        try {
          const existingClient = get().clients.find(c => c.id === clientId)
          if (!existingClient) {
            throw new Error('Client not found')
          }

          const dto: ClienteDto = {
            nome: updatedClient.name || existingClient.name,
            email: updatedClient.email,
            telefone: updatedClient.phone,
            cpfCnpj: updatedClient.document
          }

          const response = await updateClienteById(parseInt(clientId), dto)
          
          if (response.error) {
            throw new Error(response.error)
          }

          set((state) => ({
            clients: state.clients.map((client) => 
              client.id === clientId ? { ...client, ...updatedClient } : client
            ),
            loading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
          throw error
        }
      },

      deleteClient: async (clientId) => {
        set({ loading: true, error: null })
        try {
          await deleteClienteById(parseInt(clientId))
          set((state) => ({
            clients: state.clients.filter((client) => client.id !== clientId),
            loading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
          throw error
        }
      },

      getClient: (clientId) => {
        return get().clients.find((client) => client.id === clientId)
      },

      getAllClients: async () => {
        set({ loading: true, error: null })
        try {
          const response = await listAllClientes()
          
          if (response.error) {
            throw new Error(response.error)
          }

          const clients: Client[] = (response.clientes as any[])?.map((cliente: any) => ({
            id: cliente.id?.toString() || Date.now().toString(),
            name: cliente.nome,
            email: cliente.email,
            phone: cliente.telefone,
            document: cliente.cpfCnpj,
            notes: '',
            events: []
          })) || []

          set({ clients, loading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
          throw error
        }
      },

      getClientByName: (name) => {
        return get().clients.find((client) => client.name === name)
      },

      fetchClientDetails: async (clientId) => {
        set({ loading: true, error: null })
        try {
          const response = await getClienteDetails(parseInt(clientId))
          
          if (response.error) {
            throw new Error(response.error)
          }

          set({ loading: false })
          return response.cliente || null
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
          throw error
        }
      },

      addEventToClient: (clientId, eventId) => {
        set((state) => ({
          clients: state.clients.map((client) => {
            if (client.id === clientId) {
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
      partialize: (state) => ({ clients: state.clients }), // Only persist clients to storage
    },
  ),
)

// Updated sync function to work with the service
export async function syncClientWithEvent(clientData: any, eventId: string) {
  const clientStore = useClientStore.getState()
  const eventStore = useEventStore.getState()

  try {
    // Try to find existing client by name
    const existingClient = clientStore.getClientByName(clientData.name)

    if (existingClient) {
      // Update existing client with new event
      await clientStore.addEventToClient(existingClient.id, eventId)
      return existingClient.id
    } else {
      // Create new client
      const newClient = await clientStore.addClient({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        document: clientData.document,
        notes: clientData.notes
      })
      
      // Add event to the new client
      await clientStore.addEventToClient(newClient.id, eventId)
      return newClient.id
    }
  } catch (error) {
    console.error("Error syncing client with event:", error)
    throw error
  }
}