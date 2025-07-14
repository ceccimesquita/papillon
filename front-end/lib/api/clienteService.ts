export interface ClienteDto {
  nome: string;
  email?: string;
  cpfCnpj?: string;
  telefone?: string;
}

export interface ClienteDetailsDto extends ClienteDto {
  // You can add additional details fields here if needed
  // For example:
  // totalOrcamentos?: number;
  // eventosRealizados?: number;
}

export interface ApiResponse<T> {
  message?: string;
  error?: string;
  cliente?: T;
  clientes?: T[];
}

export class ClienteAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClienteAlreadyExistsError';
  }
}

export async function registerCliente(dto: ClienteDto): Promise<ApiResponse<ClienteDto>> {
  try {
    const response = await fetch("http://localhost:8080/api/cliente", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new ClienteAlreadyExistsError(errorData.error || "Cliente já existe");
      }
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ClienteAlreadyExistsError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function listAllClientes(): Promise<ApiResponse<ClienteDto[]>> {
  try {
    const response = await fetch("http://localhost:8080/api/cliente", {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getClienteById(id: number): Promise<ApiResponse<ClienteDto>> {
  try {
    const response = await fetch(`http://localhost:8080/api/cliente/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getClienteDetails(id: number): Promise<ApiResponse<ClienteDetailsDto>> {
  try {
    const response = await fetch(`http://localhost:8080/api/cliente/${id}/details`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function updateClienteById(id: number, dto: ClienteDto): Promise<ApiResponse<ClienteDto>> {
  try {
    const response = await fetch(`http://localhost:8080/api/cliente/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function deleteClienteById(id: number): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`http://localhost:8080/api/cliente/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}