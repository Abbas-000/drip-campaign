import { NextResponse } from 'next/server'
import { processDripCampaign } from '../../lib/drip-campaign-processor'

export async function GET() {
  try {
    const result = await processDripCampaign()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing drip campaign:', error)
    return NextResponse.json(
      { error: 'Failed to process drip campaign data' },
      { status: 500 }
    )
  }
}

