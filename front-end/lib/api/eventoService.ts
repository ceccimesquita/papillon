export interface EventoCreateDto {
  // Define properties based on your EventoCreateDto Java class
  // Example:
  nome: string;
  dataEvento: string;
  clienteId: number;
  orcamentoId?: number;
  descricao?: string;
  local?: string;
  // Add other properties as needed
}

export interface EventoShowDto {
  id: number;
  nome: string;
  dataEvento: string;
  cliente: {
    id: number;
    nome: string;
    email?: string;
  };
  orcamento?: {
    id: number;
    valorTotal: number;
    status: string;
  };
  descricao?: string;
  local?: string;
  createdAt: string;
  updatedAt?: string;
  // Add other properties as needed
}

export async function createEvento(eventoDto: EventoCreateDto): Promise<EventoShowDto> {
  const response = await fetch("http://localhost:8080/api/evento", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventoDto),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function listAllEventos(): Promise<EventoShowDto[]> {
  const response = await fetch("http://localhost:8080/api/evento", {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function getEventoById(id: number): Promise<EventoShowDto> {
  const response = await fetch(`http://localhost:8080/api/evento/${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function updateEvento(id: number, eventoDto: EventoCreateDto): Promise<EventoShowDto> {
  const response = await fetch(`http://localhost:8080/api/evento/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventoDto),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function deleteEvento(id: number): Promise<void> {
  const response = await fetch(`http://localhost:8080/api/evento/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }
}