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

export function AnalyticsTables({ cities = [], stadiums = [], dailyPayments = [], paymentMethods = null, loading = false }: any) {
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
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>To'lov Usuli</TableHead>
                  <TableHead className="text-right">Tranzaksiyalar Soni</TableHead>
                  <TableHead className="text-right font-bold">Jami Summa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods?.summary ? (
                  <>
                    {paymentMethods.summary.payme && (
                      <TableRow>
                        <TableCell className="font-medium">Payme</TableCell>
                        <TableCell className="text-right">{paymentMethods.summary.payme.count} ta</TableCell>
                        <TableCell className="text-right font-bold text-green-600 dark:text-green-400">{formatUZS(paymentMethods.summary.payme.total)}</TableCell>
                      </TableRow>
                    )}
                    {paymentMethods.summary.click && (
                      <TableRow>
                        <TableCell className="font-medium">Click</TableCell>
                        <TableCell className="text-right">{paymentMethods.summary.click.count} ta</TableCell>
                        <TableCell className="text-right font-bold text-green-600 dark:text-green-400">{formatUZS(paymentMethods.summary.click.total)}</TableCell>
                      </TableRow>
                    )}
                    {paymentMethods.summary.cash && (
                      <TableRow>
                        <TableCell className="font-medium">Naqd Pul</TableCell>
                        <TableCell className="text-right">{paymentMethods.summary.cash.count} ta</TableCell>
                        <TableCell className="text-right font-bold text-green-600 dark:text-green-400">{formatUZS(paymentMethods.summary.cash.total)}</TableCell>
                      </TableRow>
                    )}
                    <TableRow className="border-t-2 bg-muted/40">
                      <TableCell className="font-bold">Jami</TableCell>
                      <TableCell className="text-right font-bold">
                        {(paymentMethods.summary.payme?.count || 0) + (paymentMethods.summary.click?.count || 0) + (paymentMethods.summary.cash?.count || 0)} ta
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600 dark:text-green-400">{formatUZS(paymentMethods.total)}</TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">Ma'lumot topilmadi</TableCell>
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
