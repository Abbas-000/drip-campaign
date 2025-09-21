/**
 * Generates a property slug from property name
 */
export function generatePropertySlug(propertyName: string): string {
  return propertyName
    .toLowerCase()
    .replace(/#/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generates booking URL
 */
export function generateBookingUrl(
  propertyName: string, 
  guestId: string, 
  promoCode?: string
): string {
  const slug = generatePropertySlug(propertyName);
  const baseUrl = `https://yourstrplatform.com/bookings/${slug}?guest_id=${guestId}`;
  
  if (promoCode) {
    return `${baseUrl}&promo=${promoCode}`;
  }
  
  return `${baseUrl}`;
}
