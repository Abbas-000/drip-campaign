import {
  Guest,
  Property,
  Contact,
  CustomField,
  Action,
  Tones,
  OutreachTemplates,
  OfferTexts,
  AltOfferTexts,
  PromoCodes,
  MainProcessedData,
} from "@/types";
import { generateBookingUrl } from "./utils";

export class DripCampaignWorkflow {
  private properties: Property[];
  private tones: Tones;
  private templates: OutreachTemplates;
  private offerTexts: OfferTexts;
  private altOfferTexts: AltOfferTexts;
  private promoCodes: PromoCodes;

  constructor(
    properties: Property[],
    tones: Tones,
    templates: OutreachTemplates,
    offerTexts: OfferTexts,
    altOfferTexts: AltOfferTexts,
    promoCodes: PromoCodes,
  ) {
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
  processGuests(guests: Guest[]): MainProcessedData {
    const contacts: Contact[] = [];
    const customFields: CustomField[] = [];
    const actions: Action[] = [];

    for (const guest of guests) {
      // Create contact
      const contact: Contact = {
        guest_id: guest.guest_id,
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone: guest.phone,
        segment: guest.derived.segment,
        consent_email: guest.consent_email,
        consent_sms: guest.consent_sms,
        last_property: guest.last_property,
        last_check_in: guest.last_check_in,
        recency_days: guest.derived.recency_days,
      };
      contacts.push(contact);

      // Create custom field
      const customField = this.createCustomField(guest, guest.derived.segment);
      customFields.push(customField);

      // Create actions for each outreach
      const guestActions = this.createActions(guest, guest.derived.segment);
      actions.push(...guestActions);
    }

    return { contacts, customFields, actions };
  }

  /**
   * Creates custom field entry for a guest
   */
  private createCustomField(guest: Guest, segment: string): CustomField {
    // Determine current and next outreach
    const { currentOutreach, nextOutreach } = this.getOutreachStages(guest);

    const outreachConfigs = [
      { id: "Outreach1", days: 3 },
      { id: "Outreach2", days: 14 },
      { id: "Outreach3", days: 30 },
      { id: "Outreach4", days: 60 },
      { id: "Outreach5", days: 110 },
    ];

    const findOffsetDays = outreachConfigs.find(
      (outreach) => outreach.id === currentOutreach,
    );
    const offsetDays = findOffsetDays ? findOffsetDays.days : 3;

    const plannedSendDate = this.calculateSendDate(
      guest.last_check_out,
      offsetDays,
    );

    return {
      guest_id: guest.guest_id,
      segment,
      current_outreach: currentOutreach,
      next_outreach: nextOutreach,
      planned_send_date: plannedSendDate,
      consent_email: guest.consent_email,
      consent_sms: guest.consent_sms,
      last_property: guest.last_property,
      last_check_in: guest.last_check_in,
      recency_days: guest.derived.recency_days,
    };
  }

  /**
   * Creates all actions for a guest across all outreaches
   */
  private createActions(guest: Guest, segment: string): Action[] {
    const actions: Action[] = [];
    const outreachConfigs = [
      { id: "Outreach1", days: 3 },
      { id: "Outreach2", days: 14 },
      { id: "Outreach3", days: 30 },
      { id: "Outreach4", days: 60 },
      { id: "Outreach5", days: 110 },
    ];

    for (const config of outreachConfigs) {
      const sendDate = this.calculateSendDate(
        guest.last_check_out,
        config.days,
      );

      // Get tone for this segment
      const segmentTones = this.tones[segment];
      if (!segmentTones) continue;

      if (guest.consent_email || guest.consent_sms) {
        const emailAction = this.createAction(
          guest,
          segment,
          config.id,
          sendDate,
          segmentTones.email,
        );
        if (emailAction) {
          actions.push(emailAction);
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
    sendDate: string,
    tone: string,
  ): Action | null {
    // Get template
    const template = this.templates[outreach]?.[tone];
    if (!template) return null;

    // Get property info
    const property = this.properties.find(
      (p) => p.property_name === guest.last_property,
    );
    const city = property?.city || "your area";

    // Get offer texts and promo code
    const offerText = this.offerTexts.offer_texts[segment] || "";
    const altOfferText = this.altOfferTexts.alt_offer_texts[segment] || "";
    const promoCode = this.promoCodes.promo_codes[segment]?.[outreach];

    // Generate booking URL
    const bookingUrl = generateBookingUrl(
      guest.last_property,
      guest.guest_id,
      promoCode,
    );

    // Calculate offer expiry date (send date + 7 days)
    const expiryDate = new Date(sendDate);
    expiryDate.setDate(expiryDate.getDate() + 7);
    const dateStr = expiryDate.toISOString().split("T")[0];

    // Fill template placeholders
    const placeholders = {
      "{first_name}": guest.first_name,
      "{last_property}": guest.last_property,
      "{city}": city,
      "{booking_url}": bookingUrl,
      "{offer_text}": offerText,
      "{alt_offer_text}": altOfferText,
      "{promo_code}": promoCode || "",
      "{date}": dateStr,
    };

    let subject = "";
    let body = "";

    if (guest.consent_email && guest.email) {
      subject = this.replacePlaceholders(template.email.subject, placeholders);
      body = this.replacePlaceholders(template.email.body, placeholders);
    } else if (guest.consent_sms && guest.phone) {
      body = this.replacePlaceholders(template.sms, placeholders);
    }

    let channel: Action["channel"] = "email";
    if (guest.consent_email && guest.consent_sms) {
      if (guest.email && guest.phone) {
        channel = "email + sms";
      }
    } else if (guest.consent_email && guest.email) {
      if (guest.email) {
        channel = "email";
      }
    } else if (guest.consent_sms && guest.phone) {
      if (guest.phone) {
        channel = "sms";
      }
    }

    return {
      guest_id: guest.guest_id,
      outreach,
      send_date: sendDate,
      channel,
      template_id: outreach,
      dedupeKey: `${guest.guest_id}-${outreach}`,
      subject: guest.consent_email ? subject : undefined,
      body: guest.consent_email ? body : undefined,
      sms_body: guest.consent_sms ? body : undefined,
      promo_code: promoCode,
      offer_text: offerText,
      alt_offer_text: altOfferText,
      booking_url: bookingUrl,
      segment: guest.derived.segment,
      consent_email: guest.consent_email,
      consent_sms: guest.consent_sms,
      last_property: guest.last_property,
      last_check_in: guest.last_check_in,
      recency_days: guest.derived.recency_days,
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
  private replacePlaceholders(
    template: string,
    placeholders: Record<string, string>,
  ): string {
    let result = template;
    for (const [placeholder, value] of Object.entries(placeholders)) {
      result = result.replace(
        new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
        value,
      );
    }
    return result;
  }

  /**
   * Returns the current and next outreach stages for a guest
   */
  private getOutreachStages(guest: Guest): {
    currentOutreach: string;
    nextOutreach: string;
  } {
    const outreachStages = [
      "Outreach1",
      "Outreach2",
      "Outreach3",
      "Outreach4",
      "Outreach5",
    ];
    let currentIndex = 0;
    const lastCheckOutDate = new Date(guest.last_check_out);
    const today = new Date();
    const daysSinceCheckOut = Math.floor(
      (today.getTime() - lastCheckOutDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceCheckOut >= 3 && daysSinceCheckOut < 14) {
      currentIndex = 0;
    } else if (daysSinceCheckOut >= 14 && daysSinceCheckOut < 30) {
      currentIndex = 1;
    } else if (daysSinceCheckOut >= 30 && daysSinceCheckOut < 60) {
      currentIndex = 2;
    } else if (daysSinceCheckOut >= 60 && daysSinceCheckOut < 110) {
      currentIndex = 3;
    } else if (daysSinceCheckOut >= 110) {
      currentIndex = 4;
    }
    const currentOutreach = outreachStages[currentIndex];
    const nextOutreach =
      outreachStages[currentIndex < 3 ? currentIndex + 1 : currentIndex];
    return { currentOutreach, nextOutreach };
  }
}
