"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export const description = "An interactive area chart"

const MONTHS_UZ = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
];

const chartConfig = {
  visitors: {
    label: "Tashrifchilar",
  },
  sessions: {
    label: "Sessiyalar",
    color: "var(--color-chart-1)",
  },
  active_users: {
    label: "Aktiv",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ currentDate, setCurrentDate, analyticsData = [] }: { currentDate: Date, setCurrentDate: (d: Date | ((prev: Date) => Date)) => void, analyticsData?: any[] }) {
  const today = new Date()
  const isFutureMonth = currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() >= today.getMonth()

  const handlePrevMonth = () => {
    setCurrentDate((prev: Date) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    if (isFutureMonth) return;
    setCurrentDate((prev: Date) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const displayMonthYear = `${MONTHS_UZ[currentDate.getMonth()]} ${currentDate.getFullYear()}`

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>Jami tashrif buyuruvchilar</CardTitle>
          <CardDescription>
            {displayMonthYear} dagi jami
          </CardDescription>
        </div>
        <CardAction>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center min-w-[120px] font-medium text-sm">
              {displayMonthYear}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={isFutureMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={analyticsData}>
            <defs>
              <linearGradient id="fillActiveUsers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-active_users)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-active_users)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-sessions)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-sessions)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${MONTHS_UZ[date.getMonth()]} ${date.getDate()}`
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value as string | number | Date)
                    return `${MONTHS_UZ[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="sessions"
              type="natural"
              fill="url(#fillSessions)"
              stroke="var(--color-sessions)"
              stackId="a"
            />
            <Area
              dataKey="active_users"
              type="natural"
              fill="url(#fillActiveUsers)"
              stroke="var(--color-active_users)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
