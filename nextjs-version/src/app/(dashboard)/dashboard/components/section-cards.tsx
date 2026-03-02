import { TrendingDown, TrendingUp, DollarSign, CreditCard } from "lucide-react"

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SectionCards({ summary, loading }: { summary?: any; loading?: boolean }) {
  const formatUZS = (num: number = 0) => new Intl.NumberFormat('ru-RU').format(num) + ' UZS'

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-40" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Jami Tushum</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatUZS(summary?.total_revenue)}
          </CardTitle>
          <CardAction>
            <TrendingUp className="text-green-500 opacity-60 w-5 h-5" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Oy davomidagi barcha kirimlar</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sof Foyda</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatUZS(summary?.net_profit)}
          </CardTitle>
          <CardAction>
            <DollarSign className="text-blue-500 opacity-60 w-5 h-5" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Kirim va xarajatlar farqi</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>To'lovlar Soni</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary?.total_payments || 0} ta
          </CardTitle>
          <CardAction>
            <CreditCard className="text-orange-500 opacity-60 w-5 h-5" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">O'rtacha to'lov: {formatUZS(summary?.avg_payment_amount)}</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Xarajatlar</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl animate-in">
            {formatUZS(summary?.total_expenses)}
          </CardTitle>
          <CardAction>
            <TrendingDown className="text-red-500 opacity-60 w-5 h-5" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Jami ro'yxatga olingan xarajatlar</div>
        </CardFooter>
      </Card>
    </div>
  )
}
