export interface MetodoPagamentoDto {
  id?: number;
  nome: string;
  descricao?: string;
  ativo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = "http://localhost:8080/api/pagamentos"
const authHeader = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
}

/**
 * Cria um novo método de pagamento
 */
export async function createMetodoPagamento(dto: MetodoPagamentoDto): Promise<MetodoPagamentoDto> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify(dto),  
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ${response.status}: ${errorText}`)
  }

  return response.json()
}

/**
 * Lista todos os métodos de pagamento
 */
export async function listAllMetodosPagamento(): Promise<MetodoPagamentoDto[]> {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: authHeader,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ${response.status}: ${errorText}`)
  }

  return response.json()
}

/**
 * Busca um método de pagamento por ID
 */
export async function getMetodoPagamentoById(id: number): Promise<MetodoPagamentoDto> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: authHeader,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ${response.status}: ${errorText}`)
  }

  return response.json()
}

/**
 * Atualiza um método de pagamento
 */
export async function updateMetodoPagamento(id: number, dto: MetodoPagamentoDto): Promise<MetodoPagamentoDto> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeader,
    body: JSON.stringify(dto),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ${response.status}: ${errorText}`)
  }

  return response.json()
}

/**
 * Exclui um método de pagamento
 */
export async function deleteMetodoPagamento(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeader,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ${response.status}: ${errorText}`)
  }
}
