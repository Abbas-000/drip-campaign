"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs"
import { DataTable } from "./components/data-table"
import { ThemeToggle } from "./components/theme-toggle"
import { ProcessedGuest, Contact, CustomField, Action } from "./types"
import { Download, Users, Calendar, Mail, Phone } from "lucide-react"

export default function Dashboard() {
  const [data, setData] = React.useState<{
    processedGuests: ProcessedGuest[]
    contacts: Contact[]
    customFields: CustomField[]
    actions: Action[]
  } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const response = await fetch('/api/process')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleExport = (type: "contacts" | "custom_fields" | "actions") => {
    if (!data) return

    let exportData: any[]
    let filename: string

    switch (type) {
      case "contacts":
        exportData = data.contacts
        filename = "contacts.jsonl"
        break
      case "custom_fields":
        exportData = data.customFields
        filename = "custom_fields.jsonl"
        break
      case "actions":
        exportData = data.actions
        filename = "actions.jsonl"
        break
    }

    const jsonlContent = exportData.map(item => JSON.stringify(item)).join('\n')
    const blob = new Blob([jsonlContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading drip campaign data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No data available</p>
        </div>
      </div>
    )
  }

  const contactsColumns = [
    { key: "guest_id" as keyof Contact, label: "Guest ID", sortable: true },
    { key: "first_name" as keyof Contact, label: "First Name", sortable: true },
    { key: "last_name" as keyof Contact, label: "Last Name", sortable: true },
    { key: "email" as keyof Contact, label: "Email", sortable: true },
    { key: "phone" as keyof Contact, label: "Phone", sortable: true },
  ]

  const customFieldsColumns = [
    { key: "guest_id" as keyof CustomField, label: "Guest ID", sortable: true },
    { key: "segment" as keyof CustomField, label: "Segment", sortable: true },
    { key: "current_outreach" as keyof CustomField, label: "Current Outreach", sortable: true },
    { key: "next_outreach" as keyof CustomField, label: "Next Outreach", sortable: true },
    { key: "planned_send_date" as keyof CustomField, label: "Planned Send Date", sortable: true },
  ]

  const actionsColumns = [
    { key: "guest_id" as keyof Action, label: "Guest ID", sortable: true },
    { key: "outreach" as keyof Action, label: "Outreach", sortable: true },
    { key: "send_date" as keyof Action, label: "Send Date", sortable: true },
    { key: "channel" as keyof Action, label: "Channel", sortable: true },
    { key: "template_id" as keyof Action, label: "Template ID", sortable: true },
    { key: "dedupeKey" as keyof Action, label: "Dedupe Key", sortable: true },
    {
      key: "promo_code" as keyof Action,
      label: "Promo Code",
      sortable: true,
      render: (value: string) => value || "-",
    },
  ]

  // Filter options
  const customFieldsFilters = [
    {
      key: "segment",
      label: "Segment",
      options: Array.from(new Set(data?.customFields.map(f => f.segment) || [])),
    },
    {
      key: "current_outreach",
      label: "Current Outreach",
      options: Array.from(new Set(data?.customFields.map(f => f.current_outreach) || [])),
    },
  ]

  const actionsFilters = [
    {
      key: "outreach",
      label: "Outreach",
      options: Array.from(new Set(data?.actions.map(a => a.outreach) || [])),
    },
    {
      key: "channel",
      label: "Channel",
      options: Array.from(new Set(data?.actions.map(a => a.channel) || [])),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Drip Campaign Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your post-stay guest outreach campaigns
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Guests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.contacts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled Actions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.actions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Actions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.actions.filter(a => a.channel === 'email').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Phone className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SMS Actions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.actions.filter(a => a.channel === 'sms').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => handleExport("contacts")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export Contacts
          </button>
          <button
            onClick={() => handleExport("custom_fields")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export Custom Fields
          </button>
          <button
            onClick={() => handleExport("actions")}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export Actions
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="custom_fields">Custom Fields</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Contacts ({data.contacts.length})
                </h2>
                <DataTable data={data.contacts} columns={contactsColumns} filterable={false} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom_fields">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Custom Fields ({data.customFields.length})
                </h2>
                <DataTable data={data.customFields} columns={customFieldsColumns} filters={customFieldsFilters} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="actions">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Actions ({data.actions.length})
                </h2>
                <DataTable data={data.actions} columns={actionsColumns} filters={actionsFilters} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}