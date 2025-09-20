import { Guest, ProcessedGuest, Contact, CustomField, Action } from '../types';
import { calculateSegment } from './segmentation';
import { calculateOutreachSchedule, generateBookingUrl, getCityFromProperty } from './outreach-scheduler';
import { fillTemplate, getTemplateContent, getEmailSubject, getEmailPreview } from './template-engine';

export async function processDripCampaign(): Promise<{
  processedGuests: ProcessedGuest[];
  contacts: Contact[];
  customFields: CustomField[];
  actions: Action[];
}> {
  // Load all data
  const [
    guestData,
    segmentationRules,
    tones,
    outreachTemplates,
    offerTexts,
    altOfferTexts,
    promoCodes,
  ] = await Promise.all([
    import('./data-loader').then(m => m.loadGuestData()),
    import('./data-loader').then(m => m.loadSegmentationRules()),
    import('./data-loader').then(m => m.loadTones()),
    import('./data-loader').then(m => m.loadOutreachTemplates()),
    import('./data-loader').then(m => m.loadOfferTexts()),
    import('./data-loader').then(m => m.loadAltOfferTexts()),
    import('./data-loader').then(m => m.loadPromoCodes()),
  ]);

  const processedGuests: ProcessedGuest[] = [];
  const contacts: Contact[] = [];
  const customFields: CustomField[] = [];
  const actions: Action[] = [];

  for (const guest of guestData.guests) {
    // Calculate segment
    const calculatedSegment = calculateSegment(guest, segmentationRules.rules);
    
    // Get tone for the segment
    const tone = tones[calculatedSegment] || { email: 'neutral', sms: 'neutral' };
    
    // Calculate outreach schedule
    const schedule = calculateOutreachSchedule(guest);
    
    // Get offer texts and promo codes
    const offerText = offerTexts.offer_texts[calculatedSegment] || 'Save $10 on your next stay';
    const altOfferText = altOfferTexts.alt_offer_texts[calculatedSegment] || 'save $10 on your next stay';
    const promoCode = promoCodes.promo_codes[calculatedSegment]?.[schedule.next_outreach] || 'WELCOME10';
    
    // Generate booking URL
    const bookingUrl = generateBookingUrl(guest, promoCode);
    
    // Create processed guest
    const processedGuest: ProcessedGuest = {
      ...guest,
      calculated_segment: calculatedSegment,
      current_outreach: schedule.current_outreach,
      next_outreach: schedule.next_outreach,
      planned_send_date: schedule.planned_send_date,
      tone,
      offer_text: offerText,
      alt_offer_text: altOfferText,
      promo_code: promoCode,
      booking_url: bookingUrl,
    };
    
    processedGuests.push(processedGuest);
    
    // Create contact
    const contact: Contact = {
      guest_id: guest.guest_id,
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      phone: guest.phone,
    };
    contacts.push(contact);
    
    // Create custom field
    const customField: CustomField = {
      guest_id: guest.guest_id,
      segment: calculatedSegment,
      current_outreach: schedule.current_outreach,
      next_outreach: schedule.next_outreach,
      planned_send_date: schedule.planned_send_date,
    };
    customFields.push(customField);
    
    // Create actions for each outreach (if consent is given)
    const outreaches = ['Outreach1', 'Outreach2', 'Outreach3', 'Outreach4', 'Outreach5'];
    
    for (const outreach of outreaches) {
      // Skip if this outreach has already passed
      if (outreach === schedule.current_outreach && schedule.current_outreach !== schedule.next_outreach) {
        continue;
      }
      
      // Create email action if consent is given
      if (guest.consent_email) {
        const emailAction: Action = {
          guest_id: guest.guest_id,
          outreach,
          send_date: schedule.planned_send_date,
          channel: 'email',
          template_id: outreach,
          dedupeKey: `${guest.guest_id}-${outreach}`,
          promo_code: promoCode,
          offer_text: offerText,
          alt_offer_text: altOfferText,
          booking_url: bookingUrl,
        };
        actions.push(emailAction);
      }
      
      // Create SMS action if consent is given
      if (guest.consent_sms) {
        const smsAction: Action = {
          guest_id: guest.guest_id,
          outreach,
          send_date: schedule.planned_send_date,
          channel: 'sms',
          template_id: outreach,
          dedupeKey: `${guest.guest_id}-${outreach}-sms`,
          promo_code: promoCode,
          offer_text: offerText,
          alt_offer_text: altOfferText,
          booking_url: bookingUrl,
        };
        actions.push(smsAction);
      }
    }
  }
  
  return {
    processedGuests,
    contacts,
    customFields,
    actions,
  };
}

export function exportToJsonl(data: any[], filename: string): string {
  return data.map(item => JSON.stringify(item)).join('\n');
}

