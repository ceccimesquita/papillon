"use client"

import { useEventStore } from "@/lib/store"
import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, TrendingDown, TrendingUp, Percent } from "lucide-react"
import { format } from "date-fns"

interface EventSummaryProps {
  eventId: string
}

// Cores para os gráficos
const COLORS = {
  expense: ["#FF6384", "#FF9F40", "#FFCD56", "#4BC0C0", "#36A2EB", "#9966FF", "#C9CBCF"],
  income: ["#4CAF50", "#8BC34A", "#CDDC39", "#FFC107", "#FF9800", "#FF5722", "#795548"],
  balance: ["#36A2EB", "#FF6384", "#4BC0C0"],
}

export function EventSummary({ eventId }: EventSummaryProps) {
  const { getEvent, getEventBalance } = useEventStore()

  // Usar useMemo para evitar recálculos desnecessários
  const event = useMemo(() => getEvent(eventId), [eventId, getEvent])
  const balance = useMemo(() => getEventBalance(eventId), [eventId, getEventBalance])

  // Calcular métricas financeiras
  const financialMetrics = useMemo(() => {
    if (!event) return null

    // Calcular receitas (pagamentos)
    const totalIncome = balance.budget

    // Calcular despesas
    const totalExpenses = balance.expenses

    // Calcular lucro
    const profit = totalIncome - totalExpenses

    // Calcular margem de lucro (%)
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0

    // Calcular taxa de utilização do orçamento (%)
    const budgetUtilization = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0

    // Calcular média de gastos por pessoa
    const expensePerPerson = event.peopleCount && event.peopleCount > 0 ? totalExpenses / event.peopleCount : 0

    // Calcular receita por pessoa
    const incomePerPerson = event.peopleCount && event.peopleCount > 0 ? totalIncome / event.peopleCount : 0

    return {
      totalIncome,
      totalExpenses,
      profit,
      profitMargin,
      budgetUtilization,
      expensePerPerson,
      incomePerPerson,
    }
  }, [event, balance])

  // Preparar dados para o gráfico de despesas
  const expenseChartData = useMemo(() => {
    if (!event) return []

    // Agrupar despesas por destinatário
    const destinationMap = new Map<string, number>()

    event.transactions.forEach((transaction) => {
      if (transaction.type === "expense" && transaction.destination) {
        const destination = transaction.destination
        const currentAmount = destinationMap.get(destination) || 0
        destinationMap.set(destination, currentAmount + transaction.amount)
      }
    })

    // Converter para o formato do gráfico
    return Array.from(destinationMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: financialMetrics?.totalExpenses ? (value / financialMetrics.totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value) // Ordenar por valor decrescente
  }, [event, financialMetrics])

  // Preparar dados para o gráfico de receitas
  const incomeChartData = useMemo(() => {
    if (!event) return []

    // Agrupar receitas por fonte
    const sourceMap = new Map<string, number>()

    event.transactions.forEach((transaction) => {
      if (transaction.type === "budget" && transaction.source) {
        const source = transaction.source
        const currentAmount = sourceMap.get(source) || 0
        sourceMap.set(source, currentAmount + transaction.amount)
      }
    })

    // Converter para o formato do gráfico
    return Array.from(sourceMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: financialMetrics?.totalIncome ? (value / financialMetrics.totalIncome) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value) // Ordenar por valor decrescente
  }, [event, financialMetrics])

  // Preparar dados para o gráfico de evolução do saldo
  const balanceChartData = useMemo(() => {
    if (!event) return []

    // Ordenar transações por data
    const sortedTransactions = [...event.transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    // Calcular o saldo acumulado ao longo do tempo
    let runningBalance = event.initialValue
    let runningIncome = event.initialValue
    let runningExpense = 0

    return sortedTransactions.map((transaction) => {
      if (transaction.type === "budget") {
        runningBalance += transaction.amount
        runningIncome += transaction.amount
      } else {
        runningBalance -= transaction.amount
        runningExpense += transaction.amount
      }

      return {
        date: format(new Date(transaction.date), "dd/MM"),
        saldo: runningBalance,
        receitas: runningIncome,
        despesas: runningExpense,
      }
    })
  }, [event])

  // Preparar dados para o gráfico de comparação mensal
  const monthlyComparisonData = useMemo(() => {
    if (!event) return []

    // Agrupar transações por mês
    const monthlyData = new Map<string, { income: number; expense: number }>()

    event.transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthYear = format(date, "MM/yyyy")

      const current = monthlyData.get(monthYear) || { income: 0, expense: 0 }

      if (transaction.type === "budget") {
        current.income += transaction.amount
      } else {
        current.expense += transaction.amount
      }

      monthlyData.set(monthYear, current)
    })

    // Converter para o formato do gráfico
    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        receitas: data.income,
        despesas: data.expense,
        lucro: data.income - data.expense,
      }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split("/").map(Number)
        const [bMonth, bYear] = b.month.split("/").map(Number)
        return aYear - bYear || aMonth - bMonth
      })
  }, [event])

  if (!event || !financialMetrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Não foi possível carregar o resumo do evento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumo financeiro */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {financialMetrics.totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {event.peopleCount ? `R$ ${financialMetrics.incomePerPerson.toFixed(2)} por pessoa` : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {financialMetrics.totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {event.peopleCount ? `R$ ${financialMetrics.expensePerPerson.toFixed(2)} por pessoa` : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {financialMetrics.profit.toFixed(2)}</div>
            <p className="text-xs flex items-center gap-1">
              {financialMetrics.profit >= 0 ? (
                <ArrowUpIcon className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 text-red-500" />
              )}
              <span className={financialMetrics.profit >= 0 ? "text-green-500" : "text-red-500"}>
                {financialMetrics.profit >= 0 ? "Positivo" : "Negativo"}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialMetrics.profitMargin.toFixed(1)}%</div>
            <Progress
              value={financialMetrics.profitMargin}
              className="h-2 mt-2"
              indicatorClassName={financialMetrics.profitMargin >= 0 ? "bg-green-500" : "bg-red-500"}
            />
          </CardContent>
        </Card>
      </div>

      {/* Utilização do orçamento */}
      <Card>
        <CardHeader>
          <CardTitle>Utilização do Orçamento</CardTitle>
          <CardDescription>
            {financialMetrics.budgetUtilization <= 100
              ? `${financialMetrics.budgetUtilization.toFixed(1)}% do orçamento foi utilizado`
              : `O orçamento foi excedido em ${(financialMetrics.budgetUtilization - 100).toFixed(1)}%`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress
            value={Math.min(financialMetrics.budgetUtilization, 100)}
            className="h-4"
            indicatorClassName={
              financialMetrics.budgetUtilization <= 80
                ? "bg-green-500"
                : financialMetrics.budgetUtilization <= 100
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos detalhados */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="balance">Evolução</TabsTrigger>
        </TabsList>

        {/* Gráfico de despesas */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Despesas</CardTitle>
              <CardDescription>Análise detalhada de como as despesas estão distribuídas</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-80">
                {expenseChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.expense[index % COLORS.expense.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Valor"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Não há despesas registradas para visualizar.</p>
                  </div>
                )}
              </div>

              {/* Tabela de despesas */}
              {expenseChartData.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-2">Destinatário</th>
                        <th className="text-right p-2">Valor</th>
                        <th className="text-right p-2">Porcentagem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseChartData.map((item, index) => (
                        <tr key={item.name} className="border-b">
                          <td className="p-2 flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS.expense[index % COLORS.expense.length] }}
                            ></div>
                            {item.name}
                          </td>
                          <td className="text-right p-2">R$ {item.value.toFixed(2)}</td>
                          <td className="text-right p-2">{item.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold bg-muted/50">
                        <td className="p-2">Total</td>
                        <td className="text-right p-2">R$ {financialMetrics.totalExpenses.toFixed(2)}</td>
                        <td className="text-right p-2">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico de receitas */}
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Receitas</CardTitle>
              <CardDescription>Análise detalhada das fontes de receita</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-80">
                {incomeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incomeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.income[index % COLORS.income.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Valor"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Não há receitas registradas para visualizar.</p>
                  </div>
                )}
              </div>

              {/* Tabela de receitas */}
              {incomeChartData.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-2">Fonte</th>
                        <th className="text-right p-2">Valor</th>
                        <th className="text-right p-2">Porcentagem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeChartData.map((item, index) => (
                        <tr key={item.name} className="border-b">
                          <td className="p-2 flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS.income[index % COLORS.income.length] }}
                            ></div>
                            {item.name}
                          </td>
                          <td className="text-right p-2">R$ {item.value.toFixed(2)}</td>
                          <td className="text-right p-2">{item.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold bg-muted/50">
                        <td className="p-2">Total</td>
                        <td className="text-right p-2">R$ {financialMetrics.totalIncome.toFixed(2)}</td>
                        <td className="text-right p-2">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico de evolução do saldo */}
        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Financeira</CardTitle>
              <CardDescription>Acompanhe a evolução financeira do evento ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="line" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="line">Linha do Tempo</TabsTrigger>
                  <TabsTrigger value="monthly">Comparação Mensal</TabsTrigger>
                </TabsList>

                <TabsContent value="line">
                  <div className="h-80">
                    {balanceChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={balanceChartData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, undefined]} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="saldo"
                            name="Saldo"
                            stroke={COLORS.balance[0]}
                            activeDot={{ r: 8 }}
                          />
                          <Line type="monotone" dataKey="receitas" name="Receitas" stroke={COLORS.balance[2]} />
                          <Line type="monotone" dataKey="despesas" name="Despesas" stroke={COLORS.balance[1]} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Não há dados suficientes para visualizar a evolução.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="monthly">
                  <div className="h-80">
                    {monthlyComparisonData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlyComparisonData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, undefined]} />
                          <Legend />
                          <Bar dataKey="receitas" name="Receitas" fill={COLORS.income[0]} />
                          <Bar dataKey="despesas" name="Despesas" fill={COLORS.expense[0]} />
                          <Bar dataKey="lucro" name="Lucro" fill={COLORS.balance[0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">
                          Não há dados suficientes para visualizar a comparação mensal.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resumo final */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro do Evento</CardTitle>
          <CardDescription>Visão geral do desempenho financeiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Receita Total</h3>
                <p className="text-lg font-semibold">R$ {financialMetrics.totalIncome.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Despesas Totais</h3>
                <p className="text-lg font-semibold">R$ {financialMetrics.totalExpenses.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Lucro</h3>
                <p
                  className={`text-lg font-semibold ${financialMetrics.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  R$ {financialMetrics.profit.toFixed(2)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Margem de Lucro</h3>
                <p
                  className={`text-lg font-semibold ${financialMetrics.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {financialMetrics.profitMargin.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Análise de Desempenho</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div
                    className={`mt-0.5 mr-2 h-4 w-4 rounded-full flex items-center justify-center ${
                      financialMetrics.budgetUtilization <= 100
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {financialMetrics.budgetUtilization <= 100 ? (
                      <ArrowDownIcon className="h-3 w-3" />
                    ) : (
                      <ArrowUpIcon className="h-3 w-3" />
                    )}
                  </div>
                  <span>
                    {financialMetrics.budgetUtilization <= 100
                      ? `Utilização do orçamento: ${financialMetrics.budgetUtilization.toFixed(1)}% (dentro do planejado)`
                      : `Orçamento excedido em ${(financialMetrics.budgetUtilization - 100).toFixed(1)}%`}
                  </span>
                </li>

                <li className="flex items-start">
                  <div
                    className={`mt-0.5 mr-2 h-4 w-4 rounded-full flex items-center justify-center ${
                      financialMetrics.profitMargin >= 20
                        ? "bg-green-100 text-green-600"
                        : financialMetrics.profitMargin >= 0
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {financialMetrics.profitMargin >= 20 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : financialMetrics.profitMargin >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                  <span>
                    {financialMetrics.profitMargin >= 20
                      ? `Excelente margem de lucro: ${financialMetrics.profitMargin.toFixed(1)}%`
                      : financialMetrics.profitMargin >= 0
                        ? `Margem de lucro positiva: ${financialMetrics.profitMargin.toFixed(1)}%`
                        : `Margem de lucro negativa: ${financialMetrics.profitMargin.toFixed(1)}%`}
                  </span>
                </li>

                {event.peopleCount && event.peopleCount > 0 && (
                  <li className="flex items-start">
                    <div className="mt-0.5 mr-2 h-4 w-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <DollarSign className="h-3 w-3" />
                    </div>
                    <span>Receita média por pessoa: R$ {financialMetrics.incomePerPerson.toFixed(2)}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
