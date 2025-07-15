import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-2 text-center">
          <img src="logo.png" alt="Logo" />
          <CardDescription>
            Entre com suas credenciais para acessar o sistema de controle de gastos de eventos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p className="w-full">Sistema de controle financeiro para eventos</p>
        </CardFooter>
      </Card>
    </div>
  )
}
