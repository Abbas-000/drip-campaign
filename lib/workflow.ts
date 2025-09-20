import { 
  Guest, 
  Property, 
  Contact, 
  CustomField, 
  Action, 
  ProcessedData,
  Tones,
  OutreachTemplates,
  OfferTexts,
  AltOfferTexts,
  PromoCodes
} from '@/types';
import { SegmentationEngine, calculateRecencyDays, generateBookingUrl } from './segmentation';

export class DripCampaignWorkflow {
  private segmentationEngine: SegmentationEngine;
  private properties: Property[];
  private tones: Tones;
  private templates: OutreachTemplates;
  private offerTexts: OfferTexts;
  private altOfferTexts: AltOfferTexts;
  private promoCodes: PromoCodes;

  constructor(
    segmentationEngine: SegmentationEngine,
    properties: Property[],
    tones: Tones,
    templates: OutreachTemplates,
    offerTexts: OfferTexts,
    altOfferTexts: AltOfferTexts,
    promoCodes: PromoCodes
  ) {
    this.segmentationEngine = segmentationEngine;
    this.properties = properties;
    this.tones = tones;
    this.templates = templates;
    this.offerTexts = offerTexts;
    this.altOfferTexts = altOfferTexts;
    this.promoCodes = promoCodes;
  }

  /**
   * Processes all guests and generates the three output files
   */
  processGuests(guests: Guest[]): ProcessedData {
    const contacts: Contact[] = [];
    const customFields: CustomField[] = [];
    const actions: Action[] = [];

    for (const guest of guests) {
      // Calculate recency days if not already present
      if (!guest.derived?.recency_days) {
        guest.derived = guest.derived || {};
        guest.derived.recency_days = calculateRecencyDays(guest.last_check_out);
      }

      // Assign segment
      const segment = this.segmentationEngine.assignSegment(guest);
      guest.derived.segment = segment;

      // Create contact
      const contact: Contact = {
        guest_id: guest.guest_id,
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone: guest.phone
      };
      contacts.push(contact);

      // Create custom field
      const customField = this.createCustomField(guest, segment);
      customFields.push(customField);

      // Create actions for each outreach
      const guestActions = this.createActions(guest, segment);
      actions.push(...guestActions);
    }

    return { contacts, customFields, actions };
  }

  /**
   * Creates custom field entry for a guest
   */
  private createCustomField(guest: Guest, segment: string): CustomField {
    const validationErrors: string[] = [];
    
    // Check for missing contact info
    if (!guest.email && guest.consent_email) {
      validationErrors.push('Missing email for email consent');
    }
    if (!guest.phone && guest.consent_sms) {
      validationErrors.push('Missing phone for SMS consent');
    }

    // Determine current and next outreach
    const currentOutreach = 'Outreach1';
    const nextOutreach = 'Outreach2';
    const plannedSendDate = this.calculateSendDate(guest.last_check_out, 14); // Outreach2 is T+14

    return {
      guest_id: guest.guest_id,
      segment,
      current_outreach: currentOutreach,
      next_outreach: nextOutreach,
      planned_send_date: plannedSendDate,
      consent_email: guest.consent_email,
      consent_sms: guest.consent_sms,
      validation_errors: validationErrors.length > 0 ? validationErrors : undefined,
      notes: undefined
    };
  }

  /**
   * Creates all actions for a guest across all outreaches
   */
  private createActions(guest: Guest, segment: string): Action[] {
    const actions: Action[] = [];
    const outreachConfigs = [
      { id: 'Outreach1', days: 3 },
      { id: 'Outreach2', days: 14 },
      { id: 'Outreach3', days: 30 },
      { id: 'Outreach4', days: 60 },
      { id: 'Outreach5', days: 110 }
    ];

    for (const config of outreachConfigs) {
      const sendDate = this.calculateSendDate(guest.last_check_out, config.days);
      
      // Get tone for this segment
      const segmentTones = this.tones[segment];
      if (!segmentTones) continue;

      // Create email action if consent given
      if (guest.consent_email && guest.email) {
        const emailAction = this.createAction(
          guest,
          segment,
          config.id,
          'email',
          sendDate,
          segmentTones.email
        );
        if (emailAction) {
          actions.push(emailAction);
        }
      }

      // Create SMS action if consent given
      if (guest.consent_sms && guest.phone) {
        const smsAction = this.createAction(
          guest,
          segment,
          config.id,
          'sms',
          sendDate,
          segmentTones.sms
        );
        if (smsAction) {
          actions.push(smsAction);
        }
      }
    }

    return actions;
  }

  /**
   * Creates a single action for a specific outreach and channel
   */
  private createAction(
    guest: Guest,
    segment: string,
    outreach: string,
    channel: 'email' | 'sms',
    sendDate: string,
    tone: string
  ): Action | null {
    // Get template
    const template = this.templates[outreach]?.[tone];
    if (!template) return null;

    // Get property info
    const property = this.properties.find(p => p.property_name === guest.last_property);
    const city = property?.city || 'your area';

    // Get offer texts and promo code
    const offerText = this.offerTexts.offer_texts[segment] || '';
    const altOfferText = this.altOfferTexts.alt_offer_texts[segment] || '';
    const promoCode = this.promoCodes.promo_codes[segment]?.[outreach];

    // Generate booking URL
    const bookingUrl = generateBookingUrl(guest.last_property, guest.guest_id, promoCode);

    // Calculate offer expiry date (send date + 7 days)
    const expiryDate = new Date(sendDate);
    expiryDate.setDate(expiryDate.getDate() + 7);
    const dateStr = expiryDate.toISOString().split('T')[0];

    // Fill template placeholders
    const placeholders = {
      '{first_name}': guest.first_name,
      '{last_property}': guest.last_property,
      '{city}': city,
      '{booking_url}': bookingUrl,
      '{offer_text}': offerText,
      '{alt_offer_text}': altOfferText,
      '{promo_code}': promoCode || '',
      '{date}': dateStr
    };

    let subject = '';
    let body = '';

    if (channel === 'email') {
      subject = this.replacePlaceholders(template.email.subject, placeholders);
      body = this.replacePlaceholders(template.email.body, placeholders);
    } else {
      body = this.replacePlaceholders(template.sms, placeholders);
    }

    return {
      guest_id: guest.guest_id,
      outreach,
      send_date: sendDate,
      channel,
      template_id: outreach,
      dedupeKey: `${guest.guest_id}-${outreach}`,
      subject: channel === 'email' ? subject : undefined,
      body: channel === 'email' ? body : undefined,
      sms_body: channel === 'sms' ? body : undefined,
      promo_code: promoCode,
      offer_text: offerText,
      alt_offer_text: altOfferText,
      booking_url: bookingUrl
    };
  }

  /**
   * Calculates send date based on last check out and days offset
   */
  private calculateSendDate(lastCheckOut: string, daysOffset: number): string {
    const checkOutDate = new Date(lastCheckOut);
    const sendDate = new Date(checkOutDate);
    sendDate.setDate(sendDate.getDate() + daysOffset);
    
    // Set to 9:00 AM local time
    sendDate.setHours(9, 0, 0, 0);
    
    return sendDate.toISOString();
  }

  /**
   * Replaces placeholders in template strings
   */
  private replacePlaceholders(template: string, placeholders: Record<string, string>): string {
    let result = template;
    for (const [placeholder, value] of Object.entries(placeholders)) {
      result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
    return result;
  }
}
