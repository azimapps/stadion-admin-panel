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
import { Card, CardContent } from "@/components/ui/card"

export function AnalyticsTables({ cities = [], stadiums = [], dailyPayments = [], loading = false }: any) {
  const formatUZS = (num: number) => num ? new Intl.NumberFormat('ru-RU').format(num) + ' UZS' : '0 UZS'

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
    </Tabs>
  )
}
