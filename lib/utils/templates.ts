import type { Guest, OutreachTemplates, ToneMapping, OfferTexts, AltOfferTexts, PromoCodes } from '../types';

/**
 * Generates a booking URL for a guest and property
 */
export function generateBookingUrl(propertyName: string, guestId: string, promoCode: string): string {
  // Convert property name to slug (e.g., "WhiteSmoke Bungalow #14" -> "whitesmoke-bungalow-14")
  const slug = propertyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
    
  return `https://yourstrplatform.com/bookings/${slug}?guest_id=${guestId}&promo=${promoCode}`;
}

/**
 * Fills template placeholders with guest data
 */
export function fillTemplate(
  template: string,
  guest: Guest,
  city: string,
  offerText?: string,
  altOfferText?: string,
  promoCode?: string,
  bookingUrl?: string,
  date?: string
): string {
  return template
    .replace(/\{first_name\}/g, guest.first_name)
    .replace(/\{last_name\}/g, guest.last_name)
    .replace(/\{last_property\}/g, guest.last_property)
    .replace(/\{city\}/g, city)
    .replace(/\{offer_text\}/g, offerText || '')
    .replace(/\{alt_offer_text\}/g, altOfferText || '')
    .replace(/\{promo_code\}/g, promoCode || '')
    .replace(/\{booking_url\}/g, bookingUrl || '')
    .replace(/\{date\}/g, date || '');
}

/**
 * Gets the appropriate tone for a segment and channel
 */
export function getToneForSegment(segment: string, channel: 'email' | 'sms', toneMapping: ToneMapping): string {
  return toneMapping[segment]?.[channel] || 'neutral';
}

/**
 * Gets offer text for a segment
 */
export function getOfferText(segment: string, offerTexts: OfferTexts): string {
  return offerTexts.offer_texts[segment] || '';
}

/**
 * Gets alternative offer text for a segment
 */
export function getAltOfferText(segment: string, altOfferTexts: AltOfferTexts): string {
  return altOfferTexts.alt_offer_texts[segment] || '';
}

/**
 * Gets promo code for a segment and outreach
 */
export function getPromoCode(segment: string, outreach: string, promoCodes: PromoCodes): string {
  return promoCodes.promo_codes[segment]?.[outreach] || '';
}

/**
 * Calculates the send date for an outreach based on checkout date
 */
export function calculateSendDate(checkoutDate: string, daysOffset: number): string {
  const date = new Date(checkoutDate);
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

/**
 * Gets available channels for a guest based on consent
 */
export function getAvailableChannels(guest: Guest): ('email' | 'sms')[] {
  const channels: ('email' | 'sms')[] = [];
  
  if (guest.consent_email) {
    channels.push('email');
  }
  
  if (guest.consent_sms) {
    channels.push('sms');
  }
  
  return channels;
}

/**
 * Formats a date for display (e.g., "2025-01-15" -> "January 15, 2025")
 */
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}