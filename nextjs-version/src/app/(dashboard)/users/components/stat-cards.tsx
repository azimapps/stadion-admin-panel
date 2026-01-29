import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, Clock5, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'
import { Manager } from "@/services/manager"

interface StatCardsProps {
  users: Manager[]
}

export function StatCards({ users }: StatCardsProps) {
  const totalManagers = users.length
  const activeManagers = users.filter(u => u.is_active).length
  const inactiveManagers = users.filter(u => !u.is_active).length

  // Since we don't have previous history in this view, 
  // we'll just show current ones or zero growth for now.
  const performanceMetrics = [
    {
      title: 'Jami managerlar',
      current: totalManagers.toString(),
      previous: '0',
      growth: 100,
      icon: Users,
    },
    {
      title: 'Faol managerlar',
      current: activeManagers.toString(),
      previous: '0',
      growth: 100,
      icon: UserCheck,
    },
    {
      title: 'Nofaol managerlar',
      current: inactiveManagers.toString(),
      previous: '0',
      growth: 0,
      icon: Clock5,
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {performanceMetrics.map((metric, index) => (
        <Card key={index} className='group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300 rounded-3xl'>
          {/* Background Decoration */}
          <div className="absolute -right-4 -top-4 size-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

          <CardContent className='relative p-5 space-y-4'>
            <div className='flex items-center justify-between'>
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <metric.icon className='size-5 opacity-80' />
              </div>

              <Badge
                variant='outline'
                className={cn(
                  "rounded-full px-2 py-0.5 font-bold text-[10px] border-0",
                  metric.growth >= 0
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500',
                )}
              >
                {metric.growth >= 0 ? (
                  <TrendingUp className='me-1 size-3 stroke-[2.5]' />
                ) : (
                  <TrendingDown className='me-1 size-3 stroke-[2.5]' />
                )}
                {metric.growth >= 0 ? '+' : ''}{metric.growth}%
              </Badge>
            </div>

            <div className='space-y-1'>
              <p className='text-muted-foreground text-[10px] font-bold tracking-wider uppercase'>{metric.title}</p>
              <div className='flex items-baseline gap-2'>
                <h2 className='text-3xl font-black tracking-tight'>{metric.current}</h2>
                <div className='text-muted-foreground/60 flex items-center gap-1 text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full'>
                  <span>avval: {metric.previous}</span>
                  <ArrowUpRight className={cn("size-2.5", metric.growth >= 0 ? "text-green-500" : "text-red-500")} />
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  metric.growth >= 0 ? "bg-green-500" : "bg-red-500"
                )}
                style={{ width: `${Math.min(100, (Number(metric.current) / (Number(metric.previous) || 1)) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
