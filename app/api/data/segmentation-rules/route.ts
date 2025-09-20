import { NextResponse } from 'next/server';
import path from 'path';
import { readFileSync } from 'fs';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'inputs', 'segmentation_rules.json');
    const fileContent = readFileSync(filePath, 'utf8');
    
    if (!fileContent.trim()) {
      return NextResponse.json({ error: 'Empty file content' }, { status: 500 });
    }
    
    const data = JSON.parse(fileContent);
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading segmentation rules:', error);
    return NextResponse.json({ 
      error: 'Failed to load segmentation rules',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}