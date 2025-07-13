export interface Cliente {
  nome: string;
  email?: string;
  cpfCnpj?: string;
  telefone?: string;
}

export interface MenuItem {
  nome: string;
  tipo: "prato" | "bebida";
  descricao?: string;
}

export interface Menu {
  nome: string;
  itens: MenuItem[];
}

export interface Funcionario {
  nome: string;
  funcao: string;
  valor: number;
}

export interface OrcamentoPayload {
  cliente: Cliente;
  dataDoEvento: string;
  quantidadePessoas: number;
  valorPorPessoa: number;
  dataLimite?: string;
  cardapios: Menu[];
  funcionarios: Funcionario[];
  notas?: string;
}

export interface OrcamentoResponse extends OrcamentoPayload {
  id: number;
  valorTotal: number;
  status: "PENDENTE" | "ACEITO" | "REJEITADO";
  createdAt: string;
  eventId?: number;
}

export async function enviarOrcamento(payload: OrcamentoPayload): Promise<OrcamentoResponse> {
  const response = await fetch("http://localhost:8080/api/orcamento", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function pegarOrcamentos(): Promise<OrcamentoResponse[]> {
  const response = await fetch("http://localhost:8080/api/orcamento", {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function atualizarOrcamento(id: number, payload: OrcamentoPayload): Promise<OrcamentoResponse> {
  const response = await fetch(`http://localhost:8080/api/orcamento/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function atualizarStatusOrcamento(id: number, status: "PENDENTE" | "ACEITO" | "REJEITADO"): Promise<OrcamentoResponse> {
  const response = await fetch(`http://localhost:8080/api/orcamento/${id}/status/${status}`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function deletarOrcamento(id: number): Promise<void> {
  const response = await fetch(`http://localhost:8080/api/orcamento/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }
}