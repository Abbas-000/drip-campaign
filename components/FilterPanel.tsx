"use client";

import { useState } from "react";
import { FilterOptions, ProcessedData } from "@/types";

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  data: ProcessedData | null;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  data,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const months: { [key: string]: string } = {
    "1": "January",
    "2": "February",
    "3": "March",
    "4": "April",
    "5": "May",
    "6": "June",
    "7": "July",
    "8": "August",
    "9": "September",
    "10": "October",
    "11": "November",
    "12": "December",
  };

  // Get unique values for filter options
  const uniqueProperties = data
    ? [...new Set(data.properties.map((p) => p.property_name))]
    : [];
  const uniqueSegments = data
    ? [...new Set(data.data.customFields.map((f) => f.segment))]
    : [];
  const uniqueMonths = data
    ? [...new Set(data.months.map((m) => months[String(m.month)]))]
    : [];

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <div className={`space-y-4 ${isOpen ? "block" : "hidden md:block"}`}>
        {/* Property Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property
          </label>
          <select
            value={filters.lastProperty || ""}
            onChange={(e) =>
              updateFilter("lastProperty", e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Properties</option>
            {uniqueProperties.map((property) => (
              <option key={property} value={property}>
                {property}
              </option>
            ))}
          </select>
        </div>

        {/* Segment Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Segment
          </label>
          <select
            value={filters.segment || ""}
            onChange={(e) =>
              updateFilter("segment", e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Segments</option>
            {uniqueSegments.map((segment) => (
              <option key={segment} value={segment}>
                {segment}
              </option>
            ))}
          </select>
        </div>

        {/* Recency Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recency (days)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.recencyRange?.min || ""}
              onChange={(e) =>
                updateFilter("recencyRange", {
                  ...filters.recencyRange,
                  min: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.recencyRange?.max || ""}
              onChange={(e) =>
                updateFilter("recencyRange", {
                  ...filters.recencyRange,
                  max: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Consent Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Consent
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.consentEmail === true}
                onChange={(e) =>
                  updateFilter(
                    "consentEmail",
                    e.target.checked ? true : undefined,
                  )
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Email Consent</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.consentSms === true}
                onChange={(e) =>
                  updateFilter(
                    "consentSms",
                    e.target.checked ? true : undefined,
                  )
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">SMS Consent</span>
            </label>
          </div>
        </div>

        {/* Month Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Month of Stay
          </label>
          <select
            value={filters.monthOfStay || ""}
            onChange={(e) =>
              updateFilter("monthOfStay", e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Months</option>
            {uniqueMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
