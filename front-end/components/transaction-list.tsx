"use client"

import { useEventStore } from "@/lib/store"
import { ArrowDownCircle, ArrowUpCircle, Filter } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

interface InsumoListProps {
  eventId: string
}

type SortField = "nome" | "valor"
type SortOrder = "asc" | "desc"

export function InsumoList({ eventId }: InsumoListProps) {
  const { getEvent } = useEventStore()
  const event = getEvent(eventId)
  const [sortField, setSortField] = useState<SortField>("nome")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  if (!event) return null

  let insumos = [...event.transactions]

  // Apply sorting
  insumos.sort((a, b) => {
    if (sortField === "nome") {
      return sortOrder === "asc"
        ? a.nome.localeCompare(b.nome)
        : b.nome.localeCompare(a.nome)
    } else {
      return sortOrder === "asc" ? a.valor - b.valor : b.valor - a.valor
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  if (insumos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhum insumo encontrado.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          <span className="text-sm text-muted-foreground">
            {insumos.length} insumo{insumos.length !== 1 ? 's' : ''} cadastrado{insumos.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="border rounded-md overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("nome")}>
                  Nome
                  {sortField === "nome" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("valor")}>
                  Valor
                  {sortField === "valor" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insumos.map((insumo) => {
              return (
                <TableRow key={insumo.id}>
                  <TableCell className="font-medium">{insumo.nome}</TableCell>
                  <TableCell className="text-right font-medium">
                    R$ {insumo.valor.toFixed(2)}
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