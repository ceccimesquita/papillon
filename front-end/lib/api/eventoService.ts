export interface EventoCreateDto {
  // Define properties based on your EventoCreateDto Java class
  // Example:
  nome: string;
  dataEvento: any;
  clienteId: number;
  orcamentoId?: number;
  descricao?: string;
  local?: string;
  // Add other properties as needed 
}

export interface EventoShowDto {
  id: number;
  nome: any;
  data: number;
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
  qtdPessoas?: number;
  valor: number
}

export async function createEvento(eventoDto: EventoCreateDto): Promise<EventoShowDto> {
  const response = await fetch("http://localhost:8080/api/evento", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
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
      Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }
}