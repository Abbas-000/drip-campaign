'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FilterState, Property } from '@/lib/types'

interface GuestFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  properties: Property[]
  segments: string[]
  onExport: () => void
  onProcessData: () => void
  isProcessing?: boolean
}

export function GuestFilters({
  filters,
  onFiltersChange,
  properties,
  segments,
  onExport,
  onProcessData,
  isProcessing = false
}: GuestFiltersProps) {
  const [dateStart, setDateStart] = useState(filters.dateRange?.start || '')
  const [dateEnd, setDateEnd] = useState(filters.dateRange?.end || '')

  const handleDateChange = () => {
    const dateRange = dateStart && dateEnd 
      ? { start: dateStart, end: dateEnd }
      : undefined

    onFiltersChange({
      ...filters,
      dateRange
    })
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Drip Campaign Controls</span>
          <div className="flex gap-2">
            <Button 
              onClick={onProcessData}
              disabled={isProcessing}
              className="transition-all hover:scale-105 active:scale-95"
            >
              {isProcessing ? 'Processing...' : 'Process Guests'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onExport}
              className="transition-all hover:scale-105 active:scale-95"
            >
              Export Files
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Guests</label>
            <Input
              placeholder="Search by name or email..."
              value={filters.searchQuery || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                searchQuery: e.target.value || undefined
              })}
              className="transition-all focus:scale-105"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Property</label>
            <Select
              value={filters.property || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                property: e.target.value || undefined
              })}
              className="transition-all focus:scale-105"
            >
              <option value="">All Properties</option>
              {properties.map((property) => (
                <option key={property.property_id} value={property.property_name}>
                  {property.property_name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Segment</label>
            <Select
              value={filters.segment || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                segment: e.target.value || undefined
              })}
              className="transition-all focus:scale-105"
            >
              <option value="">All Segments</option>
              {segments.map((segment) => (
                <option key={segment} value={segment}>
                  {segment}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex gap-1">
              <Input
                type="date"
                placeholder="Start"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                onBlur={handleDateChange}
                className="text-xs transition-all focus:scale-105"
              />
              <Input
                type="date"
                placeholder="End"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                onBlur={handleDateChange}
                className="text-xs transition-all focus:scale-105"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}