"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEventStore } from "@/lib/store"
import { EventList } from "@/components/event-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function HistoricoPage() {


  return (
    <div className="container max-w-screen-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="outline" size="sm" className="h-9">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight ml-4">Histórico de Eventos</h1>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 pb-4">
          <CardTitle>Eventos Passados</CardTitle>
          <CardDescription>Histórico de eventos já realizados.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <EventList />
        </CardContent>
      </Card>
    </div>
  )
}