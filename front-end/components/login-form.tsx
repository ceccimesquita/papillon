"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/auth-store"
import { EyeIcon, EyeOffIcon } from "lucide-react"

interface AuthResponse {
  token: string
  email: string
  name: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface ErrorResponse {
  message?: string
  error?: string
  statusCode?: number
}

async function apiLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    let errorMessage = "Credenciais inválidas"
    alert("Login Invalido")
    
    try {
      const errorData: ErrorResponse = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
      
      if (response.status === 403) {
        errorMessage = `Acesso não autorizado: ${errorMessage}`
      }
    } catch (e) {
      console.error("Failed to parse error response", e)
      if (response.status === 403) {
        errorMessage = "Acesso proibido. Verifique suas credenciais."
      }
    }

    throw new Error(errorMessage)
  }

  return await response.json()
}

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { login: authStoreLogin } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const validateForm = (): boolean => {
    let isValid = true

    if (!email) {
      setEmailError("O email é obrigatório")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Por favor, insira um email válido")
      isValid = false
    } else {
      setEmailError("")
    }

    if (!password) {
      setPasswordError("A senha é obrigatória")
      isValid = false
    } else if (password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres")
      isValid = false
    } else {
      setPasswordError("")
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await apiLogin({
        username: email,
        password: password
      })

      localStorage.setItem("token", response.token)
      authStoreLogin({
        email: response.email,
        name: response.name
      })

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao sistema Papillon.",
      })

      router.push("/")
    } catch (error: unknown) {
      console.error("Erro no login:", error)
      
      let errorMessage = "Ocorreu um erro ao tentar fazer login"
      
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: errorMessage,
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && <p className="text-sm text-red-500">{emailError}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Senha
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <EyeIcon className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {showPassword ? "Esconder senha" : "Mostrar senha"}
            </span>
          </Button>
        </div>
        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  )
}