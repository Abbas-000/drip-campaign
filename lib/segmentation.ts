import { Guest, SegmentationRule } from '@/types';

export class SegmentationEngine {
  private rules: SegmentationRule[];

  constructor(rules: SegmentationRule[]) {
    this.rules = rules;
  }

  /**
   * Assigns a segment to a guest based on the segmentation rules
   * Rules are evaluated in priority order (first match wins)
   */
  assignSegment(guest: Guest): string {
    for (const rule of this.rules) {
      if (this.evaluateRule(rule, guest)) {
        return rule.name;
      }
    }
    
    // Default to Neutral if no rules match
    return 'Neutral';
  }

  /**
   * Evaluates a single rule against a guest
   */
  private evaluateRule(rule: SegmentationRule, guest: Guest): boolean {
    const conditions = rule.conditions;

    // Handle default rule
    if (conditions.default === true) {
      return true;
    }

    // Handle OR conditions
    if (conditions.or) {
      const orConditions = conditions.or as Array<{ [key: string]: string }>;
      return orConditions.some(condition => 
        Object.entries(condition).every(([key, value]) => 
          this.evaluateCondition(key, value, guest)
        )
      );
    }

    // Handle regular AND conditions
    return Object.entries(conditions).every(([key, value]) => {
      if (typeof value === 'string') {
        return this.evaluateCondition(key, value, guest);
      }
      return true;
    });
  }

  /**
   * Evaluates a single condition against a guest
   */
  private evaluateCondition(field: string, condition: string, guest: Guest): boolean {
    const value = this.getGuestValue(field, guest);
    
    if (value === null || value === undefined) {
      return false;
    }

    // Parse the condition (e.g., "> 2000", ">= 4.8", "<= 180")
    const match = condition.match(/^(>=?|<=?|==?|!=)\s*(.+)$/);
    if (!match) {
      return false;
    }

    const [, operator, targetValue] = match;
    const target = parseFloat(targetValue);

    if (isNaN(target)) {
      // Handle string comparisons
      return this.compareStrings(value, operator, targetValue);
    }

    // Handle numeric comparisons
    return this.compareNumbers(value, operator, target);
  }

  /**
   * Gets a value from a guest object, supporting nested properties
   */
  private getGuestValue(field: string, guest: Guest): any {
    if (field === 'recency_days') {
      return guest.derived?.recency_days;
    }
    
    if (field === 'lifetime_spend') {
      return guest.lifetime_spend;
    }
    
    if (field === 'avg_review_score') {
      return guest.avg_review_score;
    }
    
    if (field === 'last_property') {
      return guest.last_property;
    }
    
    if (field === 'guest_communications.sentiment') {
      // Check if any communication has negative sentiment
      return guest.guest_communications?.some(comm => comm.sentiment === 'negative') ? 'negative' : 'positive';
    }

    return null;
  }

  /**
   * Compares two numbers based on the operator
   */
  private compareNumbers(value: number, operator: string, target: number): boolean {
    switch (operator) {
      case '>':
        return value > target;
      case '>=':
        return value >= target;
      case '<':
        return value < target;
      case '<=':
        return value <= target;
      case '==':
      case '=':
        return value === target;
      case '!=':
        return value !== target;
      default:
        return false;
    }
  }

  /**
   * Compares two strings based on the operator
   */
  private compareStrings(value: string, operator: string, target: string): boolean {
    switch (operator) {
      case '==':
      case '=':
        return value === target;
      case '!=':
        return value !== target;
      default:
        return false;
    }
  }
}

/**
 * Calculates recency days from last check out date
 */
export function calculateRecencyDays(lastCheckOut: string): number {
  const checkOutDate = new Date(lastCheckOut);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - checkOutDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

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
  
  return `${baseUrl}&promo=`;
}
