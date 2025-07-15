"use client"

import { useEventStore } from "@/lib/store"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"

interface TopicListProps {
  eventId: string
}

export function TopicList({ eventId }: TopicListProps) {
  const { getEvent, getTopicBalance, getEventBalance } = useEventStore()
  const event = getEvent(eventId)
  const eventBalance = getEventBalance(eventId)

  if (!event || event.topics.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhum tópico encontrado. Crie seu primeiro tópico!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {event.topics.map((topic) => {
        const balance = getTopicBalance(eventId, topic.id)
        const percentage = eventBalance.total !== 0 ? (Math.abs(balance.total) / Math.abs(eventBalance.total)) * 100 : 0

        return (
          <Link key={topic.id} href={`/events/${eventId}/topics/${topic.id}`} className="block">
            <div className="flex flex-col p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{topic.name}</h3>
                  {topic.description && <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>}
                </div>
                <div className="flex items-center">
                  <span className={`mr-4 font-medium ${balance.total >= 0 ? "text-green-600" : "text-red-600"}`}>
                    R$ {balance.total.toFixed(2)}
                  </span>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Participação no orçamento</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
