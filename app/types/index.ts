export interface Property {
  property_id: number;
  property_name: string;
  city: string;
  timezone: string;
}

export interface GuestCommunication {
  timestamp: string;
  channel: string;
  stage: string;
  text: string;
  sentiment: string;
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
    segment: string;
    recency_days: number;
  };
}

export interface SegmentationRule {
  name: string;
  conditions: {
    [key: string]: any;
    or?: any[];
    default?: boolean;
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
  [outreach: string]: {
    [tone: string]: {
      email: {
        subject: string;
        body: string;
        preview: string;
      };
      sms: string;
    };
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

export interface ProcessedGuest extends Guest {
  calculated_segment: string;
  current_outreach: string;
  next_outreach: string;
  planned_send_date: string;
  tone: {
    email: string;
    sms: string;
  };
  offer_text: string;
  alt_offer_text: string;
  promo_code: string;
  booking_url: string;
}

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
  channel: string;
  template_id: string;
  dedupeKey: string;
  promo_code?: string;
  offer_text?: string;
  alt_offer_text?: string;
  booking_url?: string;
}

export interface GuestData {
  meta: {
    generated_at: string;
    rows: number;
    notes: string;
  };
  properties: Property[];
  guests: Guest[];
}

