// Core data types for the drip campaign system

export interface Property {
  property_id: number;
  property_name: string;
  city: string;
  timezone: string;
}

export interface GuestCommunication {
  timestamp: string;
  channel: 'email' | 'sms' | 'platform_message';
  stage: 'pre_stay' | 'during_stay' | 'post_stay';
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number;
  issue_tag: string;
}

export interface Guest {
  guest_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  consent_email: boolean;
  consent_sms: boolean;
  reservation_date: string;
  last_check_in: string;
  last_check_out: string;
  lifetime_spend: number;
  avg_review_score: number;
  last_property: string;
  guest_communications: GuestCommunication[];
  derived: {
    recency_days: number;
    lead_time_days: number;
    lead_time_bucket: string;
    segment: string;
    preferred_theme: string;
  };
}

export interface SegmentationRule {
  name: string;
  conditions: {
    lifetime_spend?: string;
    avg_review_score?: string;
    recency_days?: string;
    'guest_communications.sentiment'?: string;
    or?: Array<{[key: string]: string}>;
    default?: boolean;
  };
}

export interface OutreachTemplate {
  [tone: string]: {
    email?: {
      subject: string;
      body: string;
      preview: string;
    };
    sms?: string;
  };
}

export interface OutreachTemplates {
  [outreach: string]: OutreachTemplate;
}

export interface ToneMapping {
  [segment: string]: {
    email: string;
    sms: string;
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

// Outreach schedule configuration
export interface OutreachSchedule {
  outreach: string;
  days: number;
  description: string;
}

// Export file types
export interface Contact {
  guest_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface CustomField {
  guest_id: string;
  segment: string;
  current_outreach: string;
  next_outreach: string;
  planned_send_date: string;
}

export interface Action {
  guest_id: string;
  outreach: string;
  send_date: string;
  channel: 'email' | 'sms';
  template_id: string;
  dedupeKey: string;
  filled_content?: {
    subject?: string;
    body?: string;
    preview?: string;
    sms_text?: string;
    promo_code?: string;
    offer_text?: string;
    alt_offer_text?: string;
    booking_url?: string;
  };
}

// UI state types
export interface FilterState {
  property?: string;
  segment?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

export interface ProcessedGuest extends Guest {
  outreaches: ProcessedOutreach[];
}

export interface ProcessedOutreach {
  outreach: string;
  send_date: string;
  channels: ('email' | 'sms')[];
  filled_templates: {
    email?: {
      subject: string;
      body: string;
      preview: string;
    };
    sms?: string;
  };
  promo_code?: string;
  offer_text?: string;
  alt_offer_text?: string;
  booking_url?: string;
}

export type Theme = 'light' | 'dark';