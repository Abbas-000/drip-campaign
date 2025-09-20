import { NextResponse } from 'next/server';
import path from 'path';
import { readFileSync } from 'fs';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'inputs', 'offer_texts.json');
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading offer texts:', error);
    return NextResponse.json({ error: 'Failed to load offer texts' }, { status: 500 });
  }
}