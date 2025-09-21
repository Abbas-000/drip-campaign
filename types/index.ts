// Core data types for the drip campaign system

export interface Property {
  property_id: number;
  property_name: string;
  city: string;
  timezone: string;
}

export interface Season {
  month: number;
  label: 'Low' | 'Shoulder' | 'Peak';
  notes: string;
}

export interface GuestCommunication {
  channel: 'email' | 'sms';
  sentiment: 'positive' | 'neutral' | 'negative';
  content: string;
  timestamp: string;
  stage: string;
  text: string;
  sentiment_score: number;
  issue_tag: string;
}

export interface Guest {
  guest_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  reservation_date: string;
  last_check_in: string;
  last_check_out: string;
  last_property: string;
  lifetime_spend: number;
  avg_review_score: number;
  consent_email: boolean;
  consent_sms: boolean;
  guest_communications: GuestCommunication[];
  derived: {
    segment: string;
    recency_days: number;
    lead_time_days: number;
    lead_time_bucket: string;
    preferred_theme: string;
  };
}

export interface SegmentationRule {
  name: string;
  conditions: {
    [key: string]: any;
  };
}

export interface SegmentationRules {
  rules: SegmentationRule[];
}

export interface Tones {
  [segment: string]: {
    email: string;
    sms: string;
  };
}

export interface OutreachTemplate {
  email: {
    subject: string;
    body: string;
    preview: string;
  };
  sms: string;
}

export interface OutreachTemplates {
  [outreach: string]: {
    [tone: string]: OutreachTemplate;
  };
}

export interface OfferTexts {
  offer_texts: {
    [segment: string]: string;
  };
}

export interface AltOfferTexts {
  alt_offer_texts: {
    [segment: string]: string;
  };
}

export interface PromoCodes {
  promo_codes: {
    [segment: string]: {
      [outreach: string]: string;
    };
  };
}

export interface Contact {
  guest_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  segment: string;
}

export interface CustomField {
  guest_id: string;
  segment: string;
  current_outreach: string;
  next_outreach: string;
  planned_send_date: string;
  consent_email: boolean;
  consent_sms: boolean;
}

export interface Action {
  guest_id: string;
  outreach: string;
  send_date: string;
  channel: 'email' | 'sms' | 'email + sms';
  template_id: string;
  dedupeKey: string;
  subject?: string;
  body?: string;
  sms_body?: string;
  promo_code?: string;
  offer_text?: string;
  alt_offer_text?: string;
  booking_url: string;
}

export interface ProcessedData {
  data: MainProcessedData;
  properties: Property[];
  months: Season[];
  stats: {
    totalGuests: number;
    totalCustomFields: number;
    totalContacts: number;
    totalActions: number;
  };
}

export interface MainProcessedData {
  contacts: Contact[];
  customFields: CustomField[];
  actions: Action[];
}

export interface FilterOptions {
  lastProperty?: string;
  segment?: string;
  recencyRange?: {
    min?: number;
    max?: number;
  };
  consentEmail?: boolean;
  consentSms?: boolean;
  monthOfStay?: string;
}

export interface SeedData {
  meta: {
    generated_at: string;
    rows: number;
    notes: string;
  };
  properties: Property[];
  guests: Guest[];
}
