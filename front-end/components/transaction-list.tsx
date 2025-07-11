"use client"

import { useEventStore } from "@/lib/store"
import { format } from "date-fns"
import { ArrowDownCircle, ArrowUpCircle, Filter } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

interface TransactionListProps {
  eventId: string
}

type SortField = "date" | "amount" | "description"
type SortOrder = "asc" | "desc"

export function TransactionList({ eventId }: TransactionListProps) {
  const { getEvent } = useEventStore()
  const event = getEvent(eventId)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [filter, setFilter] = useState<"all" | "budget" | "expense">("all")

  if (!event) return null

  let transactions = [...event.transactions]

  // Apply type filter
  if (filter === "budget") {
    transactions = transactions.filter((t) => t.type === "budget")
  } else if (filter === "expense") {
    transactions = transactions.filter((t) => t.type === "expense")
  }

  // Apply sorting
  transactions.sort((a, b) => {
    if (sortField === "date") {
      return sortOrder === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    } else if (sortField === "amount") {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount
    } else {
      return sortOrder === "asc"
        ? a.description.localeCompare(b.description)
        : b.description.localeCompare(a.description)
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as transações</SelectItem>
              <SelectItem value="budget">Apenas orçamento</SelectItem>
              <SelectItem value="expense">Apenas despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("date")}>
                  Data
                  {sortField === "date" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("description")}>
                  Descrição
                  {sortField === "description" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Fonte</TableHead>
              <TableHead className="hidden md:table-cell">Destino</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("amount")}>
                  Valor
                  {sortField === "amount" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              return (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{format(new Date(transaction.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {transaction.type === "budget" ? (
                        <ArrowUpCircle className="h-4 w-4 text-blue-500 mr-2" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      {transaction.description}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{transaction.source || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">{transaction.destination || "—"}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      transaction.type === "budget" ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "budget" ? "+" : "-"}
                    R$ {transaction.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
