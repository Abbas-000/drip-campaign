import { promises as fs } from 'fs';
import path from 'path';
import {
  GuestData,
  SegmentationRules,
  Tones,
  OutreachTemplate,
  OfferTexts,
  AltOfferTexts,
  PromoCodes,
} from '../types';

export async function loadGuestData(): Promise<GuestData> {
  const filePath = path.join(process.cwd(), 'inputs', 'str_past_guests_seed_with_segments.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function loadSegmentationRules(): Promise<SegmentationRules> {
  const filePath = path.join(process.cwd(), 'inputs', 'segmentation_rules.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function loadTones(): Promise<Tones> {
  const filePath = path.join(process.cwd(), 'inputs', 'tones.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function loadOutreachTemplates(): Promise<OutreachTemplate> {
  const filePath = path.join(process.cwd(), 'inputs', 'outreach_templates.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function loadOfferTexts(): Promise<OfferTexts> {
  const filePath = path.join(process.cwd(), 'inputs', 'offer_texts.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function loadAltOfferTexts(): Promise<AltOfferTexts> {
  const filePath = path.join(process.cwd(), 'inputs', 'alt_offer_texts.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function loadPromoCodes(): Promise<PromoCodes> {
  const filePath = path.join(process.cwd(), 'inputs', 'promo_codes.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

