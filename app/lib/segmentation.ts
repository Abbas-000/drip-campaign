import { Guest, SegmentationRule } from '../types';

export function calculateSegment(guest: Guest, rules: SegmentationRule[]): string {
  // Check each rule in order
  for (const rule of rules) {
    if (evaluateRule(guest, rule)) {
      return rule.name;
    }
  }
  
  // If no rule matches, return 'Neutral' as default
  return 'Neutral';
}

function evaluateRule(guest: Guest, rule: SegmentationRule): boolean {
  const conditions = rule.conditions;
  
  // Handle default case
  if (conditions.default === true) {
    return true;
  }
  
  // Handle OR conditions
  if (conditions.or) {
    return conditions.or.some((orCondition: any) => 
      evaluateCondition(guest, orCondition)
    );
  }
  
  // Handle regular conditions (AND logic)
  return Object.entries(conditions).every(([key, value]) => {
    if (key === 'or' || key === 'default') return true;
    return evaluateCondition(guest, { [key]: value });
  });
}

function evaluateCondition(guest: Guest, condition: any): boolean {
  for (const [field, rule] of Object.entries(condition)) {
    if (field === 'or' || field === 'default') continue;
    
    const guestValue = getGuestValue(guest, field);
    const ruleValue = rule as string;
    
    if (!evaluateFieldCondition(guestValue, ruleValue)) {
      return false;
    }
  }
  return true;
}

function getGuestValue(guest: Guest, field: string): any {
  switch (field) {
    case 'recency_days':
      return guest.derived.recency_days;
    case 'lifetime_spend':
      return guest.lifetime_spend;
    case 'avg_review_score':
      return guest.avg_review_score;
    case 'last_property':
      return guest.last_property;
    case 'guest_communications.sentiment':
      // Check if any communication has negative sentiment
      return guest.guest_communications.some(comm => comm.sentiment === 'negative');
    default:
      return null;
  }
}

function evaluateFieldCondition(guestValue: any, rule: string): boolean {
  if (guestValue === null || guestValue === undefined) {
    return false;
  }
  
  // Handle string comparisons
  if (typeof guestValue === 'string') {
    return guestValue === rule;
  }
  
  // Handle numeric comparisons
  if (typeof guestValue === 'number') {
    if (rule.startsWith('>=')) {
      return guestValue >= parseFloat(rule.substring(2).trim());
    } else if (rule.startsWith('<=')) {
      return guestValue <= parseFloat(rule.substring(2).trim());
    } else if (rule.startsWith('>')) {
      return guestValue > parseFloat(rule.substring(1).trim());
    } else if (rule.startsWith('<')) {
      return guestValue < parseFloat(rule.substring(1).trim());
    } else if (rule.startsWith('=')) {
      return guestValue === parseFloat(rule.substring(1).trim());
    } else {
      return guestValue === parseFloat(rule);
    }
  }
  
  // Handle boolean comparisons
  if (typeof guestValue === 'boolean') {
    return guestValue === (rule === 'true');
  }
  
  return false;
}

