"use client"

import { ChartAreaInteractive } from "./components/chart-area-interactive"
import { DataTable } from "./components/data-table"
import { SectionCards } from "./components/section-cards"

// Import localized mock data or use empty defaults for now
import data from "./data/data.json"
import pastPerformanceData from "./data/past-performance-data.json"
import keyPersonnelData from "./data/key-personnel-data.json"
import focusDocumentsData from "./data/focus-documents-data.json"

export default function Page() {
  return (
    <>
      {/* Page Title and Description */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Statistikalar</h1>
          <p className="text-muted-foreground">Admin panelga xush kelibsiz</p>
        </div>
      </div>

      <div className="@container/main px-4 lg:px-6 space-y-6">
        <SectionCards />
        <ChartAreaInteractive />
      </div>
      <div className="@container/main">
        {/* We can keep or remove the data table based on user preference, 
            for now, I'll comment out the English data table or leave it as a placeholder 
            until we implement the Stadiums table. 
            The user asked for *analytics* and *mock charts*. 
            The SectionCards and ChartAreaInteractive cover that. */}
        {/* <DataTable
          data={data}
          pastPerformanceData={pastPerformanceData}
          keyPersonnelData={keyPersonnelData}
          focusDocumentsData={focusDocumentsData}
        /> */}
      </div>
    </>
  )
}
