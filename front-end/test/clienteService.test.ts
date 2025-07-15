import { registerCliente, ClienteAlreadyExistsError } from '../lib/api/clienteService';

describe("registerCliente", () => {
  const cliente = {
    nome: "Fulano",
    email: "fulano@example.com",
    cpfCnpj: "123.456.789-00",
    telefone: "88999999999"
  }

  const mockToken = "mocked-token"

  beforeEach(() => {
    localStorage.setItem("token", mockToken)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("deve registrar um cliente com sucesso", async () => {
    const mockResponse = {
      cliente
    }

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    ) as jest.Mock

    const result = await registerCliente(cliente)

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/cliente", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        Authorization: `Bearer ${mockToken}`
      }),
      body: JSON.stringify(cliente)
    }))

    expect(result).toEqual(mockResponse)
  })

  it("deve lançar ClienteAlreadyExistsError se status 400 for retornado", async () => {
    const mockError = { error: "Cliente já existe" }

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockError)
      })
    ) as jest.Mock

    const result = await registerCliente(cliente)

    expect(result).toEqual({ error: "Cliente já existe" })
  })

  it("deve lançar erro genérico para outros status HTTP", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Erro interno do servidor")
      })
    ) as jest.Mock

    await expect(registerCliente(cliente)).rejects.toThrow("Erro 500: Erro interno do servidor")
  })
})
