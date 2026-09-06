"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Label } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import type { DateRange } from "react-day-picker"

export function AnalyticsTables({ cities = [], stadiums = [], dailyPayments = [], paymentMethods = null, paymentRange = null, setPaymentRange = null, loading = false }: any) {
  const formatUZS = (num: number) => num ? new Intl.NumberFormat('ru-RU').format(num) + ' UZS' : '0 UZS'
  const formatDate = (d: Date) => d.toLocaleDateString('ru-RU')
  const [rangeOpen, setRangeOpen] = React.useState(false)
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(undefined)
  const formatShort = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
    if (num >= 1_000) return (num / 1_000).toFixed(0) + 'K'
    return String(num)
  }

  if (loading) {
    return <div className="h-[400px] w-full animate-pulse bg-muted rounded-lg" />
  }

  return (
    <Tabs defaultValue="stadiums" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6 mb-4">
        <TabsList>
          <TabsTrigger value="stadiums">Stadionlar Daromadi</TabsTrigger>
          <TabsTrigger value="cities">Hududlar (Aktiv Userlar)</TabsTrigger>
          <TabsTrigger value="daily">Kunlik To'lovlar</TabsTrigger>
          <TabsTrigger value="payment-methods">To'lov Usullari</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="stadiums" className="px-4 lg:px-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stadion</TableHead>
                  <TableHead className="text-right">Band qilishdan (Booking)</TableHead>
                  <TableHead className="text-right">Turnirlardan</TableHead>
                  <TableHead className="text-right font-bold">Jami Daromad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stadiums.length > 0 ? stadiums.map((std: any) => (
                  <TableRow key={std.stadium_id}>
                    <TableCell className="font-medium">{std.stadium_name}</TableCell>
                    <TableCell className="text-right">{formatUZS(std.booking_revenue)}</TableCell>
                    <TableCell className="text-right">{formatUZS(std.tournament_revenue)}</TableCell>
                    <TableCell className="text-right font-bold text-green-600 dark:text-green-400">{formatUZS(std.revenue)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Ma'lumot topilmadi</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cities" className="px-4 lg:px-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shahar / Hudud</TableHead>
                  <TableHead className="text-right">Aktiv Foydalanuvchilar (Oy davomida)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.length > 0 ? cities.map((city: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{city.city === "(not set)" ? "Noma'lum hudud" : city.city}</TableCell>
                    <TableCell className="text-right">{city.active_users} ta</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">Ma'lumot topilmadi</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="daily" className="px-4 lg:px-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sana</TableHead>
                  <TableHead className="text-right">Muvaffaqiyatli To'lovlar</TableHead>
                  <TableHead className="text-right">Naqd</TableHead>
                  <TableHead className="text-right">Click / Payme</TableHead>
                  <TableHead className="text-right font-bold">Jami</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyPayments.length > 0 ? dailyPayments.map((day: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{day.date}</TableCell>
                    <TableCell className="text-right">{day.payments_count} ta</TableCell>
                    <TableCell className="text-right">{formatUZS(day.by_method?.cash || 0)}</TableCell>
                    <TableCell className="text-right">{formatUZS((day.by_method?.click || 0) + (day.by_method?.payme || 0))}</TableCell>
                    <TableCell className="text-right font-bold text-green-600 dark:text-green-400">{formatUZS(day.total_revenue)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Ma'lumot topilmadi</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="payment-methods" className="px-4 lg:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">To'lov usullari bo'yicha tushum</h3>
            <p className="text-xs text-muted-foreground">Davrni tanlang — Payme va Click orqali rasmiy kelib tushgan pul quyida</p>
          </div>
          <Popover
            open={rangeOpen}
            onOpenChange={(open) => {
              setRangeOpen(open)
              if (open) setDraftRange(paymentRange ? { from: paymentRange.from, to: paymentRange.to } : undefined)
            }}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {paymentRange ? `${formatDate(paymentRange.from)} — ${formatDate(paymentRange.to)}` : "Sana tanlang"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={draftRange}
                defaultMonth={paymentRange?.from}
                disabled={{ after: new Date() }}
                onSelect={(range) => {
                  setDraftRange(range)
                  if (range?.from && range?.to && setPaymentRange) {
                    setPaymentRange({ from: range.from, to: range.to })
                    setRangeOpen(false)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {(() => {
          const official = paymentMethods?.official
          const officialCards = [
            { name: "Payme", data: official?.payme, color: "var(--color-chart-1)" },
            { name: "Click", data: official?.click, color: "var(--color-chart-2)" },
          ]
          return (
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {officialCards.map((c) => (
                <Card key={c.name}>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name} orqali rasmiy tushum
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold tabular-nums">
                      {formatUZS(c.data?.total || 0)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground">
                    {c.data?.count || 0} ta tranzaksiya · merchant orqali kelib tushgan
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        })()}

        {(() => {
          const pm = paymentMethods?.summary
          const total = paymentMethods?.total || 0

          const chartMethods = [
            pm?.payme && { name: 'Payme', value: pm.payme.total, count: pm.payme.count, fill: 'var(--color-chart-1)' },
            pm?.click && { name: 'Click', value: pm.click.total, count: pm.click.count, fill: 'var(--color-chart-2)' },
          ].filter(Boolean) as { name: string; value: number; count: number; fill: string }[]

          const cashData = pm?.cash ? { value: pm.cash.total, count: pm.cash.count } : null

          const methods = [
            ...chartMethods,
            pm?.cash && { name: 'Naqd Pul', value: pm.cash.total, count: pm.cash.count, fill: 'var(--color-chart-3)' },
          ].filter(Boolean) as { name: string; value: number; count: number; fill: string }[]

          const chartConfig: ChartConfig = {
            Payme: { label: 'Payme', color: 'var(--color-chart-1)' },
            Click: { label: 'Click', color: 'var(--color-chart-2)' },
          }

          if (!pm || methods.length === 0) {
            return (
              <Card>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Ma'lumot topilmadi
                </CardContent>
              </Card>
            )
          }

          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">Daromad Taqsimoti</CardTitle>
                  <CardDescription>To'lov usullari bo'yicha ulush</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="mx-auto h-[240px]">
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            hideLabel
                            formatter={(value: number | string) => [formatUZS(Number(value)), '']}
                          />
                        }
                      />
                      <Pie data={chartMethods} dataKey="value" nameKey="name" innerRadius={68} outerRadius={100} strokeWidth={2}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} style={{ fontSize: 22, fontWeight: 700, fill: 'var(--foreground)' }}>
                                    {formatShort(total)}
                                  </tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 22} style={{ fontSize: 11, fill: 'var(--muted-foreground)' }}>
                                    UZS
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  {cashData && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-chart-3)]" />
                      <span>Naqd pul: <span className="font-medium text-foreground">{formatUZS(cashData.value)}</span> · {cashData.count} ta</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3 justify-center">
                {methods.map((method) => {
                  const pct = total > 0 ? Math.round((method.value / total) * 100) : 0
                  return (
                    <div key={method.name} className="rounded-xl border bg-card p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: method.fill }} />
                          <span className="font-semibold text-sm">{method.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{method.count} ta tranzaksiya</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold">{formatUZS(method.value)}</span>
                        <span className="text-sm font-semibold" style={{ color: method.fill }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: method.fill }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}
      </TabsContent>
    </Tabs>
  )
}
