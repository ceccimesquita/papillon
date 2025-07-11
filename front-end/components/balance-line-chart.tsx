"use client"

import { useEventStore } from "@/lib/store"
import { format } from "date-fns"
import { useMemo } from "react"

interface BalanceLineChartProps {
  eventId: string
}

export function BalanceLineChart({ eventId }: BalanceLineChartProps) {
  const { getEvent } = useEventStore()

  // Usar useMemo para evitar recálculos desnecessários
  const event = useMemo(() => getEvent(eventId), [eventId, getEvent])

  const hasTransactions = useMemo(() => event && event.transactions && event.transactions.length > 0, [event])

  if (!event || !hasTransactions) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Adicione transações para visualizar o gráfico de evolução do saldo.</p>
      </div>
    )
  }

  // Calcular os dados do gráfico com useMemo
  const chartData = useMemo(() => {
    // Ordenar transações por data
    const sortedTransactions = [...event.transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    // Calcular o saldo acumulado ao longo do tempo
    let runningBalance = event.initialValue
    const data = sortedTransactions.map((transaction) => {
      if (transaction.type === "income") {
        runningBalance += transaction.amount
      } else {
        runningBalance -= transaction.amount
      }

      return {
        date: format(new Date(transaction.date), "dd/MM/yyyy"),
        saldo: runningBalance,
        transacao: transaction.type === "income" ? transaction.amount : -transaction.amount,
        descricao: transaction.description,
      }
    })

    // Adicionar o valor inicial como primeiro ponto
    data.unshift({
      date: format(new Date(event.date), "dd/MM/yyyy"),
      saldo: event.initialValue,
      transacao: event.initialValue,
      descricao: "Valor inicial",
    })

    return data
  }, [event])

  // Renderizar uma tabela simples em vez de um gráfico
  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="text-left p-2">Data</th>
            <th className="text-left p-2">Descrição</th>
            <th className="text-right p-2">Transação</th>
            <th className="text-right p-2">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">{item.date}</td>
              <td className="p-2">{item.descricao}</td>
              <td className={`text-right p-2 ${item.transacao >= 0 ? "text-green-600" : "text-red-600"}`}>
                {item.transacao >= 0 ? "+" : ""}
                R$ {item.transacao.toFixed(2)}
              </td>
              <td className={`text-right p-2 ${item.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {item.saldo.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
