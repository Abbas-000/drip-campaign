"use client";

import { useState, useEffect } from "react";
import { ProcessedData, FilterOptions } from "@/types";
import { DataTable } from "@/components/DataTable";
import { FilterPanel } from "@/components/FilterPanel";
import { Header } from "@/components/Header";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Home() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "contacts" | "customFields" | "actions"
  >("contacts");
  const [filters, setFilters] = useState<FilterOptions>({});

  // Load seed data and process it on component mount
  useEffect(() => {
    loadAndProcessData();
  }, []);

  const loadAndProcessData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load the seed data
      const response = await fetch(
        "/jsons/str_past_guests_seed_with_segments.json",
      );
      if (!response.ok) {
        throw new Error("Failed to load seed data");
      }
      const seedData = await response.json();

      // Process the data
      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seedData }),
      });

      if (!processResponse.ok) {
        throw new Error("Failed to process data");
      }

      const result = await processResponse.json();
      setProcessedData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "json" | "jsonl" = "jsonl") => {
    if (!processedData) return;

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: processedData.data, format }),
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const result = await response.json();

      if (format === "jsonl") {
        // Download individual files
        const files = result.files;

        // Download contacts
        const contactsBlob = new Blob([files.contacts], {
          type: "application/json",
        });
        const contactsUrl = URL.createObjectURL(contactsBlob);
        const contactsLink = document.createElement("a");
        contactsLink.href = contactsUrl;
        contactsLink.download = "contacts.jsonl";
        contactsLink.click();

        // Download custom fields
        const customFieldsBlob = new Blob([files.custom_fields], {
          type: "application/json",
        });
        const customFieldsUrl = URL.createObjectURL(customFieldsBlob);
        const customFieldsLink = document.createElement("a");
        customFieldsLink.href = customFieldsUrl;
        customFieldsLink.download = "custom_fields.jsonl";
        customFieldsLink.click();

        // Download actions
        const actionsBlob = new Blob([files.actions], {
          type: "application/json",
        });
        const actionsUrl = URL.createObjectURL(actionsBlob);
        const actionsLink = document.createElement("a");
        actionsLink.href = actionsUrl;
        actionsLink.download = "actions.jsonl";
        actionsLink.click();

        // Clean up URLs
        setTimeout(() => {
          URL.revokeObjectURL(contactsUrl);
          URL.revokeObjectURL(customFieldsUrl);
          URL.revokeObjectURL(actionsUrl);
        }, 1000);
      } else {
        // Download as single JSON file
        const blob = new Blob([JSON.stringify(processedData.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "drip_campaign_data.json";
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAndProcessData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onExport={handleExport}
        onReload={loadAndProcessData}
        stats={
          processedData
            ? {
                totalGuests: processedData.stats.totalGuests,
                totalActions: processedData.stats.totalActions,
              }
            : null
        }
      />

      <div className="flex">
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          data={processedData}
        />

        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  {
                    id: "contacts",
                    label: "Contacts",
                    count: processedData?.stats.totalContacts || 0,
                  },
                  {
                    id: "customFields",
                    label: "Custom Fields",
                    count: processedData?.stats.totalCustomFields || 0,
                  },
                  {
                    id: "actions",
                    label: "Actions",
                    count: processedData?.stats.totalActions || 0,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {processedData && (
                <DataTable
                  data={processedData.data}
                  activeTab={activeTab}
                  filters={filters}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
