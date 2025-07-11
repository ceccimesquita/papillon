"use client"

import { useEventStore } from "@/lib/store"
import { useMemo } from "react"

interface ExpensePieChartProps {
  eventId: string
}

// Cores para os diferentes destinatários
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FF6B6B",
  "#6A7FDB",
  "#61DAFB",
  "#FF9AA2",
]

export function ExpensePieChart({ eventId }: ExpensePieChartProps) {
  const { getEvent } = useEventStore()

  // Usar useMemo para evitar recálculos desnecessários
  const event = useMemo(() => getEvent(eventId), [eventId, getEvent])

  // Preparar dados para o gráfico - também com useMemo
  const chartData = useMemo(() => {
    // Agrupar gastos por destinatário
    const destinationMap = new Map<string, number>()

    if (event && event.transactions) {
      event.transactions.forEach((transaction) => {
        if (transaction.type === "expense" && transaction.destination) {
          const destination = transaction.destination
          const currentAmount = destinationMap.get(destination) || 0
          destinationMap.set(destination, currentAmount + transaction.amount)
        }
      })
    }

    // Converter para o formato do gráfico
    return Array.from(destinationMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))
  }, [event])

  // Filtrar para mostrar apenas destinatários com despesas
  const filteredData = useMemo(() => chartData.filter((item) => item.value > 0), [chartData])

  // Verificar se há dados para mostrar
  if (!event || !event.transactions || event.transactions.length === 0 || filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          {!event || !event.transactions || event.transactions.length === 0
            ? "Adicione transações para visualizar o gráfico."
            : "Não há despesas registradas para visualizar no gráfico."}
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
            <th className="text-left p-2">Destinatário</th>
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
