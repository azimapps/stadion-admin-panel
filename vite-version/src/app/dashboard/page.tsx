"use client"

import * as React from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { AnalyticsTables } from "./components/analytics-tables"
import { SectionCards } from "./components/section-cards"
import { apiClient } from "@/lib/api-client"

export default function Page() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [analyticsData, setAnalyticsData] = React.useState<any>(null)
  const [financeData, setFinanceData] = React.useState<any>(null)
  const [paymentMethodsData, setPaymentMethodsData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()

        const firstDay = new Date(year, currentDate.getMonth(), 1)
        const lastDay = new Date(year, currentDate.getMonth() + 1, 0)
        const fmt = (d: Date) => d.toISOString().split('T')[0]
        const dateFrom = fmt(firstDay)
        const dateTo = fmt(lastDay)

        const [analyticsRes, financeRes, paymentMethodsRes] = await Promise.all([
          apiClient.get<any>(`/api/v1/admin/analytics/?month=${month}&year=${year}`).catch(() => null),
          apiClient.get<any>(`/api/v1/admin/analytics/payments?month=${month}&year=${year}`).catch(() => null),
          apiClient.get<any>(`/api/v1/admin/analytics/payment-methods?date_from=${dateFrom}&date_to=${dateTo}`).catch(() => null),
        ])

        setAnalyticsData(analyticsRes)
        setFinanceData(financeRes)
        setPaymentMethodsData(paymentMethodsRes)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentDate])

  return (
    <BaseLayout title="Statistikalar" description="Admin panelga xush kelibsiz">
      <div className="@container/main px-4 lg:px-6 space-y-6">
        <SectionCards summary={financeData?.summary} loading={loading} />
        <ChartAreaInteractive
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          analyticsData={analyticsData?.daily || []}
        />
      </div>
      <div className="@container/main px-4 lg:px-6 mt-6 pb-20">
        <AnalyticsTables
          cities={analyticsData?.cities || []}
          stadiums={financeData?.by_stadium || []}
          dailyPayments={financeData?.daily || []}
          paymentMethods={paymentMethodsData}
          loading={loading}
        />
      </div>
    </BaseLayout>
  )
}
