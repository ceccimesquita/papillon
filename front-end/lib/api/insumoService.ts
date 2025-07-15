export interface InsumoDto {
  id?: number;
  nome: string;
  valor: number;
  eventoId: number;
}

export interface ApiResponse<T> {
  message?: string;
  error?: string;
  insumo?: T;
  insumos?: T[];
}

export class InsumoNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsumoNotFoundError";
  }
}

// Criar insumo
export async function createInsumo(dto: InsumoDto): Promise<ApiResponse<InsumoDto>> {
  try {
    const response = await fetch("http://localhost:8080/api/insumo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao criar insumo:", error);
    throw error;
  }
}

// Listar todos os insumos
export async function listAllInsumos(): Promise<ApiResponse<InsumoDto[]>> {
  try {
    const response = await fetch("http://localhost:8080/api/insumo", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao listar insumos:", error);
    throw error;
  }
}

// Buscar insumo por ID
export async function getInsumoById(id: number): Promise<ApiResponse<InsumoDto>> {
  try {
    const response = await fetch(`http://localhost:8080/api/insumo/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new InsumoNotFoundError("Insumo não encontrado");
      }
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar insumo:", error);
    throw error;
  }
}

// Deletar insumo por ID
export async function deleteInsumoById(id: number): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`http://localhost:8080/api/insumo/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new InsumoNotFoundError("Insumo não encontrado");
      }
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao deletar insumo:", error);
    throw error;
  }
}
