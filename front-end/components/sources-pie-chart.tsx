"use client"

import { useEventStore } from "@/lib/store"
import { useMemo } from "react"

interface SourcesPieChartProps {
  eventId: string
}

// Cores para as diferentes fontes
const COLORS = [
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#795548",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
]

export function SourcesPieChart({ eventId }: SourcesPieChartProps) {
  const { getEvent } = useEventStore()

  // Usar useMemo para evitar recálculos desnecessários
  const event = useMemo(() => getEvent(eventId), [eventId, getEvent])

  const chartData = useMemo(() => {
    if (!event || !event.transactions || event.transactions.length === 0) {
      return []
    }

    // Agrupar receitas por fonte
    const sourceMap = new Map<string, number>()

    event.transactions.forEach((transaction) => {
      if (transaction.type === "income" && transaction.source) {
        const source = transaction.source
        const currentAmount = sourceMap.get(source) || 0
        sourceMap.set(source, currentAmount + transaction.amount)
      }
    })

    // Converter para o formato do gráfico
    return Array.from(sourceMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))
  }, [event])

  // Filtrar para mostrar apenas fontes com receitas
  const filteredData = useMemo(() => chartData.filter((item) => item.value > 0), [chartData])

  if (!event || !event.transactions || event.transactions.length === 0 || filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          {!event || !event.transactions || event.transactions.length === 0
            ? "Adicione transações para visualizar o gráfico."
            : "Não há receitas registradas para visualizar no gráfico."}
        </p>
      </div>
    )
  }

  // Renderizar uma tabela simples em vez de um gráfico
  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="text-left p-2">Fonte</th>
            <th className="text-right p-2">Valor</th>
            <th className="text-right p-2">Porcentagem</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => {
            const percentage = (item.value / filteredData.reduce((sum, i) => sum + i.value, 0)) * 100
            return (
              <tr key={item.name} className="border-b">
                <td className="p-2 flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  {item.name}
                </td>
                <td className="text-right p-2">R$ {item.value.toFixed(2)}</td>
                <td className="text-right p-2">{percentage.toFixed(1)}%</td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-muted/50">
            <td className="p-2">Total</td>
            <td className="text-right p-2">R$ {filteredData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}</td>
            <td className="text-right p-2">100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
