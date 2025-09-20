'use client'

import { useState } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GuestFilters } from '@/components/features/guest-filters'
import { GuestTable } from '@/components/features/guest-table'
import { ContactsTable, CustomFieldsTable, ActionsTable } from '@/components/features/export-tables'
import { useDripCampaign } from '@/hooks/use-drip-campaign'

export default function Home() {
  const {
    loading,
    processing,
    error,
    processedGuests,
    properties,
    availableSegments,
    exportData,
    filters,
    setFilters,
    processData,
    exportAll,
  } = useDripCampaign()

  const [activeTab, setActiveTab] = useState('guests')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading drip campaign data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Post-Stay Drip Campaign
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage guest outreach and personalized communications
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Filters and Controls */}
        <GuestFilters
          filters={filters}
          onFiltersChange={setFilters}
          properties={properties}
          segments={availableSegments}
          onExport={exportAll}
          onProcessData={processData}
          isProcessing={processing}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger 
              value="guests" 
              className="transition-all hover:scale-105 active:scale-95"
            >
              Guests ({processedGuests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="contacts"
              className="transition-all hover:scale-105 active:scale-95"
            >
              Contacts ({exportData?.contacts.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="custom-fields"
              className="transition-all hover:scale-105 active:scale-95"
            >
              Custom Fields ({exportData?.customFields.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="actions"
              className="transition-all hover:scale-105 active:scale-95"
            >
              Actions ({exportData?.actions.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guests" className="mt-6">
            <GuestTable
              guests={processedGuests}
              title="Campaign Guests"
            />
            {processedGuests.length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  📊 Showing {processedGuests.length} guests ready for drip campaign outreach
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <ContactsTable contacts={exportData?.contacts || []} />
          </TabsContent>

          <TabsContent value="custom-fields" className="mt-6">
            <CustomFieldsTable customFields={exportData?.customFields || []} />
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            <ActionsTable actions={exportData?.actions || []} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 py-6 border-t text-center">
          <p className="text-muted-foreground text-sm">
            🏠 Virtual STR Management - Automated Guest Re-engagement System
          </p>
        </footer>
      </main>
    </div>
  )
}