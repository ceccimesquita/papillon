import { SimpleEventForm } from "@/components/simple-event-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateEventPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">Criar Novo Evento</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Evento</CardTitle>
          <CardDescription>Preencha as informações para criar um novo evento.</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleEventForm />
        </CardContent>
      </Card>
    </div>
  )
}
