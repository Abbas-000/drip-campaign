import { NextRequest, NextResponse } from 'next/server';
import { DripCampaignWorkflow } from '@/lib/workflow';
import {
  Tones, 
  OutreachTemplates, 
  OfferTexts, 
  AltOfferTexts, 
  PromoCodes 
} from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seedData } = body;

    if (!seedData) {
      return NextResponse.json({ error: 'Seed data is required' }, { status: 400 });
    }

    // Load configuration files
    const [
      segmentationRules,
      tones,
      templates,
      offerTexts,
      altOfferTexts,
      promoCodes
    ] = await Promise.all([
      import('@/public/jsons/segmentation_rules.json'),
      import('@/public/jsons/tones.json'),
      import('@/public/jsons/outreach_templates.json'),
      import('@/public/jsons/offer_texts.json'),
      import('@/public/jsons/alt_offer_texts.json'),
      import('@/public/jsons/promo_codes.json')
    ]);

    // Initialize workflow
    const workflow = new DripCampaignWorkflow(
      seedData.properties,
      tones.default as Tones,
      templates.default as OutreachTemplates,
      offerTexts.default as OfferTexts,
      altOfferTexts.default as AltOfferTexts,
      promoCodes.default as PromoCodes
    );

    // Process guests
    const processedData = workflow.processGuests(seedData.guests);

    return NextResponse.json({
      success: true,
      data: processedData,
      stats: {
        totalGuests: seedData.guests.length,
        totalContacts: processedData.contacts.length,
        totalCustomFields: processedData.customFields.length,
        totalActions: processedData.actions.length
      }
    });

  } catch (error) {
    console.error('Error processing data:', error);
    return NextResponse.json(
      { error: 'Failed to process data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
