export async function enviarOrcamento(payload: any): Promise<void> {
  const response = await fetch("http://localhost:8080/api/orcamento", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ${response.status}: ${errorText}`)
  }
}
