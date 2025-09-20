import { ProcessedGuest, OutreachTemplate } from '../types';
import { addDays, format } from 'date-fns';

export function fillTemplate(
  template: string,
  guest: ProcessedGuest,
  outreach: string,
  channel: 'email' | 'sms'
): string {
  let filledTemplate = template;
  
  // Replace placeholders
  filledTemplate = filledTemplate.replace(/{first_name}/g, guest.first_name);
  filledTemplate = filledTemplate.replace(/{last_property}/g, guest.last_property);
  filledTemplate = filledTemplate.replace(/{city}/g, getCityFromProperty(guest.last_property));
  filledTemplate = filledTemplate.replace(/{booking_url}/g, guest.booking_url);
  filledTemplate = filledTemplate.replace(/{offer_text}/g, guest.offer_text);
  filledTemplate = filledTemplate.replace(/{alt_offer_text}/g, guest.alt_offer_text);
  filledTemplate = filledTemplate.replace(/{promo_code}/g, guest.promo_code);
  
  // Replace date placeholder (for offers with expiration)
  if (outreach === 'Outreach3' || outreach === 'Outreach4') {
    const expirationDate = format(addDays(new Date(), 14), 'MMM dd, yyyy');
    filledTemplate = filledTemplate.replace(/{date}/g, expirationDate);
  }
  
  return filledTemplate;
}

export function getTemplateContent(
  templates: OutreachTemplate,
  outreach: string,
  tone: string,
  channel: 'email' | 'sms'
): string {
  const outreachTemplates = templates[outreach];
  if (!outreachTemplates) {
    return '';
  }
  
  const toneTemplates = outreachTemplates[tone];
  if (!toneTemplates) {
    return '';
  }
  
  if (channel === 'email') {
    return toneTemplates.email.body;
  } else {
    return toneTemplates.sms;
  }
}

export function getEmailSubject(
  templates: OutreachTemplate,
  outreach: string,
  tone: string
): string {
  const outreachTemplates = templates[outreach];
  if (!outreachTemplates) {
    return '';
  }
  
  const toneTemplates = outreachTemplates[tone];
  if (!toneTemplates) {
    return '';
  }
  
  return toneTemplates.email.subject;
}

export function getEmailPreview(
  templates: OutreachTemplate,
  outreach: string,
  tone: string
): string {
  const outreachTemplates = templates[outreach];
  if (!outreachTemplates) {
    return '';
  }
  
  const toneTemplates = outreachTemplates[tone];
  if (!toneTemplates) {
    return '';
  }
  
  return toneTemplates.email.preview;
}

function getCityFromProperty(propertyName: string): string {
  // This is a simplified mapping - in a real app, you'd look this up from the properties data
  const cityMap: { [key: string]: string } = {
    'FireBrick Villa #1': 'Norrisport',
    'Silver House #2': 'Port Thomas',
    'Thistle House #3': 'New Allison',
    'AliceBlue Condo #4': 'West Sarahchester',
    'CornflowerBlue Studio #5': 'Port Karen',
    'Lavender Suite #6': 'South Whitneychester',
    'Red Studio #7': 'West Amberville',
    'WhiteSmoke Bungalow #14': 'Norrisport',
  };
  
  return cityMap[propertyName] || 'Unknown City';
}

