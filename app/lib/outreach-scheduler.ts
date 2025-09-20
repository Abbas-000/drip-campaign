import { addDays, format } from 'date-fns';
import { Guest, ProcessedGuest } from '../types';

export interface OutreachSchedule {
  current_outreach: string;
  next_outreach: string;
  planned_send_date: string;
}

const OUTREACH_CADENCE = {
  Outreach1: 3,   // T+3 days
  Outreach2: 14,  // T+14 days
  Outreach3: 30,  // T+30 days
  Outreach4: 60,  // T+60 days
  Outreach5: 110, // T+110 days
};

export function calculateOutreachSchedule(guest: Guest): OutreachSchedule {
  const lastCheckOut = new Date(guest.last_check_out);
  const today = new Date();
  
  // Calculate days since last checkout
  const daysSinceCheckout = Math.floor((today.getTime() - lastCheckOut.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine current and next outreach based on days since checkout
  let currentOutreach = 'Outreach1';
  let nextOutreach = 'Outreach2';
  
  if (daysSinceCheckout >= OUTREACH_CADENCE.Outreach5) {
    currentOutreach = 'Outreach5';
    nextOutreach = 'Outreach5'; // No more outreaches
  } else if (daysSinceCheckout >= OUTREACH_CADENCE.Outreach4) {
    currentOutreach = 'Outreach4';
    nextOutreach = 'Outreach5';
  } else if (daysSinceCheckout >= OUTREACH_CADENCE.Outreach3) {
    currentOutreach = 'Outreach3';
    nextOutreach = 'Outreach4';
  } else if (daysSinceCheckout >= OUTREACH_CADENCE.Outreach2) {
    currentOutreach = 'Outreach2';
    nextOutreach = 'Outreach3';
  } else if (daysSinceCheckout >= OUTREACH_CADENCE.Outreach1) {
    currentOutreach = 'Outreach1';
    nextOutreach = 'Outreach2';
  } else {
    // Not yet time for first outreach
    currentOutreach = 'Outreach1';
    nextOutreach = 'Outreach1';
  }
  
  // Calculate planned send date for next outreach
  let plannedSendDate: string;
  if (nextOutreach === 'Outreach5' && currentOutreach === 'Outreach5') {
    // No more outreaches
    plannedSendDate = format(addDays(lastCheckOut, OUTREACH_CADENCE.Outreach5), 'yyyy-MM-dd');
  } else {
    const nextOutreachDays = OUTREACH_CADENCE[nextOutreach as keyof typeof OUTREACH_CADENCE];
    plannedSendDate = format(addDays(lastCheckOut, nextOutreachDays), 'yyyy-MM-dd');
  }
  
  return {
    current_outreach: currentOutreach,
    next_outreach: nextOutreach,
    planned_send_date: plannedSendDate,
  };
}

export function generateBookingUrl(guest: Guest, promoCode: string): string {
  // Convert property name to slug format
  const propertySlug = guest.last_property
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  return `https://yourstrplatform.com/bookings/${propertySlug}?guest_id=${guest.guest_id}&promo=${promoCode}`;
}

export function getCityFromProperty(propertyName: string, properties: any[]): string {
  const property = properties.find(p => p.property_name === propertyName);
  return property?.city || 'Unknown City';
}

