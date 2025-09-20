import { NextRequest, NextResponse } from 'next/server';
import { ProcessedData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, format = 'jsonl' } = body;

    if (!data) {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 });
    }

    const processedData = data as ProcessedData;

    if (format === 'jsonl') {
      // Generate JSONL content
      const contactsJsonl = processedData.contacts.map(contact => JSON.stringify(contact)).join('\n');
      const customFieldsJsonl = processedData.customFields.map(field => JSON.stringify(field)).join('\n');
      const actionsJsonl = processedData.actions.map(action => JSON.stringify(action)).join('\n');

      // Create a zip-like structure with multiple files
      const exportData = {
        contacts: contactsJsonl,
        custom_fields: customFieldsJsonl,
        actions: actionsJsonl
      };

      return NextResponse.json({
        success: true,
        format: 'jsonl',
        files: exportData
      });
    } else {
      // Return as JSON
      return NextResponse.json({
        success: true,
        format: 'json',
        data: processedData
      });
    }

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
