"use client"

import { useEventStore } from "@/lib/store"
import { useMemo, useState } from "react"
import { format } from "date-fns"
import { ArrowDownCircle, ArrowUpCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "./ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Card, CardContent } from "./ui/card"

interface SourcesListProps {
  eventId: string
}

export function SourcesList({ eventId }: SourcesListProps) {
  const { getEvent, getAllSourcesBalances } = useEventStore()
  const event = useMemo(() => getEvent(eventId), [eventId, getEvent])
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({})
  const [expandedDestinations, setExpandedDestinations] = useState<Record<string, boolean>>({})

  // Obter saldos de todas as fontes
  const sourcesBalances = useMemo(() => {
    return getAllSourcesBalances(eventId)
  }, [eventId, getAllSourcesBalances])

  const [sourceGroups, setSourceGroups] = useState<Record<
    string,
    {
      total: number
      available: number
      spent: number
      transactions: typeof event.transactions
    }
  > | null>(null)

  const [destinationGroups, setDestinationGroups] = useState<Record<
    string,
    {
      total: number
      transactions: typeof event.transactions
    }
  > | null>(null)

  useMemo(() => {
    if (!event || !event.transactions || event.transactions.length === 0) {
      setSourceGroups(null)
      setDestinationGroups(null)
      return
    }

    // Agrupar transações por fonte
    const newSourceGroups: Record<
      string,
      {
        total: number
        available: number
        spent: number
        transactions: typeof event.transactions
      }
    > = {}

    // Processar todas as transações de orçamento
    event.transactions
      .filter((t) => t.type === "budget" && t.source)
      .forEach((transaction) => {
        const source = transaction.source as string
        if (!newSourceGroups[source]) {
          const sourceBalance = sourcesBalances.find((sb) => sb.source === source)
          newSourceGroups[source] = {
            total: 0,
            available: sourceBalance?.available || 0,
            spent: sourceBalance?.spent || 0,
            transactions: [],
          }
        }
        newSourceGroups[source].total += transaction.amount
        newSourceGroups[source].transactions.push(transaction)
      })

    // Ordenar as transações de cada fonte por data
    Object.keys(newSourceGroups).forEach((source) => {
      newSourceGroups[source].transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })

    setSourceGroups(newSourceGroups)

    // Agrupar transações de despesa por destinatário
    const newDestinationGroups: Record<
      string,
      {
        total: number
        transactions: typeof event.transactions
      }
    > = {}

    event.transactions
      .filter((t) => t.type === "expense" && t.destination)
      .forEach((transaction) => {
        const destination = transaction.destination as string
        if (!newDestinationGroups[destination]) {
          newDestinationGroups[destination] = { total: 0, transactions: [] }
        }
        newDestinationGroups[destination].total += transaction.amount
        newDestinationGroups[destination].transactions.push(transaction)
      })

    // Ordenar as transações de cada destinatário por data
    Object.keys(newDestinationGroups).forEach((destination) => {
      newDestinationGroups[destination].transactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
    })

    setDestinationGroups(newDestinationGroups)
  }, [event, sourcesBalances])

  const toggleSource = (source: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [source]: !prev[source],
    }))
  }

  const toggleDestination = (destination: string) => {
    setExpandedDestinations((prev) => ({
      ...prev,
      [destination]: !prev[destination],
    }))
  }

  if (!sourceGroups) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
      </div>
    )
  }

  if (Object.keys(sourceGroups).length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhum método de pagamento encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(sourceGroups).map(([source, data]) => (
        <Card key={source} className="overflow-hidden">
          <div
            className="flex justify-between items-center p-4 cursor-pointer bg-muted/30"
            onClick={() => toggleSource(source)}
          >
            <div>
              <h3 className="font-medium text-lg">{source}</h3>
              <p className="text-sm text-muted-foreground">{data.transactions.length} transação(ões)</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-4">
                <span className="font-medium text-blue-600">Total: R$ {data.total.toFixed(2)}</span>
                <Button variant="ghost" size="sm">
                  {expandedSources[source] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
              </div>
              <div className="text-sm">
                <span className="text-red-600 mr-4">Gasto: R$ {data.spent.toFixed(2)}</span>
                <span className="text-green-600">Disponível: R$ {data.available.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {expandedSources[source] && (
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{format(new Date(transaction.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <ArrowUpCircle className="h-4 w-4 text-blue-500 mr-2" />
                          {transaction.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-blue-600">
                        +R$ {transaction.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          )}
        </Card>
      ))}

      <h3 className="font-medium text-lg mt-8 mb-4">Despesas por Destinatário</h3>

      {(() => {
        if (!destinationGroups) {
          return (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
            </div>
          )
        }

        if (Object.keys(destinationGroups).length === 0) {
          return (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhuma despesa encontrada.</p>
            </div>
          )
        }

        return Object.entries(destinationGroups).map(([destination, data]) => (
          <Card key={destination} className="overflow-hidden">
            <div
              className="flex justify-between items-center p-4 cursor-pointer bg-muted/30"
              onClick={() => toggleDestination(destination)}
            >
              <div>
                <h3 className="font-medium text-lg">{destination}</h3>
                <p className="text-sm text-muted-foreground">{data.transactions.length} transação(ões)</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium text-red-600">R$ {data.total.toFixed(2)}</span>
                <Button variant="ghost" size="sm">
                  {expandedDestinations[destination] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
              </div>
            </div>

            {expandedDestinations[destination] && (
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {format(new Date(transaction.date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <ArrowDownCircle className="h-4 w-4 text-red-500 mr-2" />
                            {transaction.description}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.source || "—"}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          -R$ {transaction.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        ))
      })()}
    </div>
  )
}
