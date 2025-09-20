'use client'

import { useState, useEffect, useMemo } from 'react'
import type { 
  ProcessedGuest, 
  FilterState, 
  Contact, 
  CustomField, 
  Action,
  Guest,
  Property,
  SegmentationRule
} from '@/lib/types'
import { 
  loadDataFiles,
  processGuest,
  generateExportFiles,
  toJsonl,
  downloadFile
} from '@/lib/utils/data-processing'

export function useDripCampaign() {
  // State
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Data
  const [rawGuests, setRawGuests] = useState<Guest[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [segmentationRules, setSegmentationRules] = useState<SegmentationRule[]>([])
  const [toneMapping, setToneMapping] = useState<any>(null)
  const [outreachTemplates, setOutreachTemplates] = useState<any>(null)
  const [offerTexts, setOfferTexts] = useState<any>(null)
  const [altOfferTexts, setAltOfferTexts] = useState<any>(null)
  const [promoCodes, setPromoCodes] = useState<any>(null)
  
  // Processed data
  const [processedGuests, setProcessedGuests] = useState<ProcessedGuest[]>([])
  const [exportData, setExportData] = useState<{
    contacts: Contact[]
    customFields: CustomField[]
    actions: Action[]
  } | null>(null)
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({})
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await loadDataFiles()
        
        setRawGuests(data.guests)
        setProperties(data.properties)
        setSegmentationRules(data.segmentationRules)
        setToneMapping(data.toneMapping)
        setOutreachTemplates(data.outreachTemplates)
        setOfferTexts(data.offerTexts)
        setAltOfferTexts(data.altOfferTexts)
        setPromoCodes(data.promoCodes)
        
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  // Process guests through drip campaign
  const processData = async () => {
    if (!toneMapping || !outreachTemplates || !offerTexts || !altOfferTexts || !promoCodes) {
      setError('Data not loaded yet')
      return
    }
    
    try {
      setProcessing(true)
      
      const processed = rawGuests.map(guest => 
        processGuest(
          guest,
          properties,
          segmentationRules,
          toneMapping,
          outreachTemplates,
          offerTexts,
          altOfferTexts,
          promoCodes
        )
      )
      
      setProcessedGuests(processed)
      
      // Generate export data
      const exportFiles = generateExportFiles(processed)
      setExportData(exportFiles)
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process guests')
    } finally {
      setProcessing(false)
    }
  }
  
  // Filter processed guests
  const filteredGuests = useMemo(() => {
    let filtered = processedGuests
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(guest => 
        guest.first_name.toLowerCase().includes(query) ||
        guest.last_name.toLowerCase().includes(query) ||
        guest.email.toLowerCase().includes(query)
      )
    }
    
    if (filters.property) {
      filtered = filtered.filter(guest => guest.last_property === filters.property)
    }
    
    if (filters.segment) {
      filtered = filtered.filter(guest => guest.derived.segment === filters.segment)
    }
    
    if (filters.dateRange) {
      filtered = filtered.filter(guest => {
        const checkoutDate = new Date(guest.last_check_out)
        const startDate = new Date(filters.dateRange!.start)
        const endDate = new Date(filters.dateRange!.end)
        return checkoutDate >= startDate && checkoutDate <= endDate
      })
    }
    
    return filtered
  }, [processedGuests, filters])
  
  // Export functions
  const exportContacts = () => {
    if (!exportData) return
    const content = toJsonl(exportData.contacts)
    downloadFile(content, 'contacts.jsonl', 'application/jsonl')
  }
  
  const exportCustomFields = () => {
    if (!exportData) return
    const content = toJsonl(exportData.customFields)
    downloadFile(content, 'custom_fields.jsonl', 'application/jsonl')
  }
  
  const exportActions = () => {
    if (!exportData) return
    const content = toJsonl(exportData.actions)
    downloadFile(content, 'actions.jsonl', 'application/jsonl')
  }
  
  const exportAll = () => {
    exportContacts()
    exportCustomFields()
    exportActions()
  }
  
  // Get unique segments
  const availableSegments = useMemo(() => {
    const segments = new Set(processedGuests.map(guest => guest.derived.segment))
    return Array.from(segments).sort()
  }, [processedGuests])
  
  return {
    // State
    loading,
    processing,
    error,
    
    // Data
    rawGuests,
    properties,
    processedGuests: filteredGuests,
    exportData,
    availableSegments,
    
    // Filters
    filters,
    setFilters,
    
    // Actions
    processData,
    exportContacts,
    exportCustomFields,
    exportActions,
    exportAll,
  }
}