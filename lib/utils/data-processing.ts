import type { 
  Guest, 
  Property, 
  ProcessedGuest, 
  ProcessedOutreach, 
  Contact, 
  CustomField, 
  Action,
  SegmentationRule,
  OutreachSchedule
} from '../types';
import { assignSegment, calculateRecencyDays } from './segmentation';
import { 
  calculateSendDate, 
  getAvailableChannels, 
  generateBookingUrl,
  fillTemplate,
  getToneForSegment,
  getOfferText,
  getAltOfferText,
  getPromoCode
} from './templates';

// Outreach schedule configuration
export const OUTREACH_SCHEDULE: OutreachSchedule[] = [
  { outreach: 'Outreach1', days: 3, description: 'Thank-you + review request' },
  { outreach: 'Outreach2', days: 14, description: 'Value content + soft CTA' },
  { outreach: 'Outreach3', days: 30, description: 'Incentive (weekday perk or % off), time-boxed' },
  { outreach: 'Outreach4', days: 60, description: 'Reminder with alternative perk' },
  { outreach: 'Outreach5', days: 110, description: 'Last chance before seasonal blackout' }
];

/**
 * Safely fetches and parses JSON data
 */
async function safeFetchJson(url: string) {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`Empty response from ${url}`);
  }
  
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Loads and parses data from the JSON files
 */
export async function loadDataFiles() {
  try {
    const [
      guestData,
      segmentationRules,
      toneMapping,
      outreachTemplates,
      offerTexts,
      altOfferTexts,
      promoCodes
    ] = await Promise.all([
      safeFetchJson('/api/data/guests'),
      safeFetchJson('/api/data/segmentation-rules'),
      safeFetchJson('/api/data/tones'),
      safeFetchJson('/api/data/outreach-templates'),
      safeFetchJson('/api/data/offer-texts'),
      safeFetchJson('/api/data/alt-offer-texts'),
      safeFetchJson('/api/data/promo-codes')
    ]);

    return {
      guests: guestData.guests as Guest[],
      properties: guestData.properties as Property[],
      segmentationRules: segmentationRules.rules as SegmentationRule[],
      toneMapping,
      outreachTemplates,
      offerTexts,
      altOfferTexts,
      promoCodes
    };
  } catch (error) {
    throw new Error(`Failed to load data files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Processes a single guest through the drip campaign workflow
 */
export function processGuest(
  guest: Guest,
  properties: Property[],
  segmentationRules: SegmentationRule[],
  toneMapping: any,
  outreachTemplates: any,
  offerTexts: any,
  altOfferTexts: any,
  promoCodes: any
): ProcessedGuest {
  // Update recency days (in case data is stale)
  const recencyDays = calculateRecencyDays(guest.last_check_out);
  
  // Assign segment using rules
  const segment = assignSegment({ ...guest, derived: { ...guest.derived, recency_days: recencyDays } }, segmentationRules);
  
  // Get property city
  const property = properties.find(p => p.property_name === guest.last_property);
  const city = property?.city || 'your favorite destination';
  
  // Get available channels
  const availableChannels = getAvailableChannels(guest);
  
  // Process each outreach
  const outreaches: ProcessedOutreach[] = OUTREACH_SCHEDULE.map(schedule => {
    const sendDate = calculateSendDate(guest.last_check_out, schedule.days);
    const offerText = getOfferText(segment, offerTexts);
    const altOfferText = getAltOfferText(segment, altOfferTexts);
    const promoCode = getPromoCode(segment, schedule.outreach, promoCodes);
    const bookingUrl = generateBookingUrl(guest.last_property, guest.guest_id, promoCode);
    
    const filled_templates: { email?: any; sms?: string } = {};
    
    // Fill email template if consent given
    if (availableChannels.includes('email')) {
      const emailTone = getToneForSegment(segment, 'email', toneMapping);
      const emailTemplate = outreachTemplates[schedule.outreach]?.[emailTone]?.email;
      
      if (emailTemplate) {
        filled_templates.email = {
          subject: fillTemplate(
            emailTemplate.subject, 
            guest, 
            city, 
            offerText, 
            altOfferText, 
            promoCode, 
            bookingUrl, 
            sendDate
          ),
          body: fillTemplate(
            emailTemplate.body, 
            guest, 
            city, 
            offerText, 
            altOfferText, 
            promoCode, 
            bookingUrl, 
            sendDate
          ),
          preview: fillTemplate(
            emailTemplate.preview, 
            guest, 
            city, 
            offerText, 
            altOfferText, 
            promoCode, 
            bookingUrl, 
            sendDate
          )
        };
      }
    }
    
    // Fill SMS template if consent given
    if (availableChannels.includes('sms')) {
      const smsTone = getToneForSegment(segment, 'sms', toneMapping);
      const smsTemplate = outreachTemplates[schedule.outreach]?.[smsTone]?.sms;
      
      if (smsTemplate) {
        filled_templates.sms = fillTemplate(
          smsTemplate,
          guest,
          city,
          offerText,
          altOfferText,
          promoCode,
          bookingUrl,
          sendDate
        );
      }
    }
    
    return {
      outreach: schedule.outreach,
      send_date: sendDate,
      channels: availableChannels,
      filled_templates,
      promo_code: promoCode,
      offer_text: offerText,
      alt_offer_text: altOfferText,
      booking_url: bookingUrl
    };
  });
  
  return {
    ...guest,
    derived: { ...guest.derived, segment },
    outreaches
  };
}

/**
 * Generates export files from processed guests
 */
export function generateExportFiles(processedGuests: ProcessedGuest[]) {
  const contacts: Contact[] = [];
  const customFields: CustomField[] = [];
  const actions: Action[] = [];
  
  processedGuests.forEach(guest => {
    // Generate contact record
    contacts.push({
      guest_id: guest.guest_id,
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      phone: guest.phone
    });
    
    // Find next outreach (first future one)
    const today = new Date();
    const futureOutreaches = guest.outreaches.filter(
      outreach => new Date(outreach.send_date) > today
    );
    const nextOutreach = futureOutreaches[0];
    const currentOutreach = guest.outreaches.find(
      outreach => new Date(outreach.send_date) <= today
    );
    
    // Generate custom field record
    customFields.push({
      guest_id: guest.guest_id,
      segment: guest.derived.segment,
      current_outreach: currentOutreach?.outreach || 'None',
      next_outreach: nextOutreach?.outreach || 'Complete',
      planned_send_date: nextOutreach?.send_date || ''
    });
    
    // Generate action records
    guest.outreaches.forEach(outreach => {
      outreach.channels.forEach(channel => {
        const dedupeKey = `${guest.guest_id}-${outreach.outreach}`;
        
        actions.push({
          guest_id: guest.guest_id,
          outreach: outreach.outreach,
          send_date: outreach.send_date,
          channel,
          template_id: outreach.outreach,
          dedupeKey,
          filled_content: {
            subject: outreach.filled_templates.email?.subject,
            body: outreach.filled_templates.email?.body,
            preview: outreach.filled_templates.email?.preview,
            sms_text: outreach.filled_templates.sms,
            promo_code: outreach.promo_code,
            offer_text: outreach.offer_text,
            alt_offer_text: outreach.alt_offer_text,
            booking_url: outreach.booking_url
          }
        });
      });
    });
  });
  
  return { contacts, customFields, actions };
}

/**
 * Converts objects to JSONL format (one JSON object per line)
 */
export function toJsonl(objects: any[]): string {
  return objects.map(obj => JSON.stringify(obj)).join('\n');
}

/**
 * Downloads a file with the given content
 */
export function downloadFile(content: string, filename: string, contentType = 'application/json') {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}