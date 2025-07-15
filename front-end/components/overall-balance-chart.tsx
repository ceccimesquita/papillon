"use client"

import { useEventStore } from "@/lib/store"
import { useMemo } from "react"

export function OverallBalanceChart() {
  const { getAllEventsBalance, events } = useEventStore()

  // Usar useMemo para evitar recálculos desnecessários
  const balance = useMemo(() => getAllEventsBalance(), [getAllEventsBalance])

  // Preparar dados para o gráfico de eventos
  const eventChartData = useMemo(() => {
    return events.map((event) => {
      const eventBalance = {
        budget: 0,
        expenses: 0,
        total: 0,
      }

      // Calcular orçamento e despesas
      event.transactions.forEach((transaction) => {
        if (transaction.type === "budget") {
          eventBalance.budget += transaction.amount
        } else {
          eventBalance.expenses += transaction.amount
        }
      })

      // Calcular saldo total
      eventBalance.total = eventBalance.budget - eventBalance.expenses

      return {
        name: event.nome.length > 15 ? event.nome.substring(0, 15) + "..." : event.nome,
        Orçamento: eventBalance.budget,
        Gastos: eventBalance.expenses,
        Saldo: eventBalance.total,
      }
    })
  }, [events])

  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhum evento encontrado. Crie seu primeiro evento!</p>
      </div>
    )
  }

  // Renderizar uma tabela simples em vez de um gráfico
  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="text-left p-2">Evento</th>
            <th className="text-right p-2">Orçamento</th>
            <th className="text-right p-2">Gastos</th>
            <th className="text-right p-2">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {eventChartData.map((item) => (
            <tr key={item.name} className="border-b">
              <td className="p-2">{item.name}</td>
              <td className="text-right p-2 text-blue-600">R$ {item.Orçamento.toFixed(2)}</td>
              <td className="text-right p-2 text-red-600">R$ {item.Gastos.toFixed(2)}</td>
              <td className={`text-right p-2 ${item.Saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {item.Saldo.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-muted/50">
            <td className="p-2">TOTAL</td>
            <td className="text-right p-2 text-blue-600">R$ {balance.budget.toFixed(2)}</td>
            <td className="text-right p-2 text-red-600">R$ {balance.expenses.toFixed(2)}</td>
            <td className={`text-right p-2 ${balance.total >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {balance.total.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-3 gap-2 text-center mt-6">
        <div>
          <p className="text-sm text-muted-foreground">Orçamento</p>
          <p className="font-medium text-blue-600">R$ {balance.budget.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Gastos</p>
          <p className="font-medium text-red-600">R$ {balance.expenses.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Saldo</p>
          <p className={`font-medium ${balance.total >= 0 ? "text-green-600" : "text-red-600"}`}>
            R$ {balance.total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}
