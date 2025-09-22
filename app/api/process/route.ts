import { NextRequest, NextResponse } from "next/server";
import { DripCampaignWorkflow } from "@/_lib/workflow";
import {
  Tones,
  OutreachTemplates,
  OfferTexts,
  AltOfferTexts,
  PromoCodes,
  Property,
  Season,
} from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seedData } = body;

    if (!seedData) {
      return NextResponse.json(
        { error: "Seed data is required" },
        { status: 400 },
      );
    }

    // Load configuration files
    const [
      segmentationRules,
      filters,
      tones,
      templates,
      offerTexts,
      altOfferTexts,
      promoCodes,
    ] = await Promise.all([
      import("@/public/jsons/segmentation_rules.json"),
      import("@/public/jsons/str_past_guests_seed_with_segments.json"),
      import("@/public/jsons/tones.json"),
      import("@/public/jsons/outreach_templates.json"),
      import("@/public/jsons/offer_texts.json"),
      import("@/public/jsons/alt_offer_texts.json"),
      import("@/public/jsons/promo_codes.json"),
    ]);

    // Initialize workflow
    const workflow = new DripCampaignWorkflow(
      seedData.properties,
      tones.default as Tones,
      templates.default as OutreachTemplates,
      offerTexts.default as OfferTexts,
      altOfferTexts.default as AltOfferTexts,
      promoCodes.default as PromoCodes,
    );

    // Process guests
    const processedData = workflow.processGuests(seedData.guests);

    return NextResponse.json({
      success: true,
      data: processedData,
      properties: filters.default.properties as Property[],
      months: filters.default.seasonality as Season[],
      stats: {
        totalGuests: seedData.guests.length,
        totalContacts: processedData.contacts.length,
        totalCustomFields: processedData.customFields.length,
        totalActions: processedData.actions.length,
      },
    });
  } catch (error) {
    console.error("Error processing data:", error);
    return NextResponse.json(
      {
        error: "Failed to process data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
