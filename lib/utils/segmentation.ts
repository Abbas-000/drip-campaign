import type { Guest, SegmentationRule } from '../types';

/**
 * Evaluates a condition string against a value
 * Supports: >, >=, <, <=, ==, !=, =
 */
function evaluateCondition(value: any, condition: string): boolean {
  // Use regex to parse condition to avoid operator precedence issues
  const match = condition.match(/^\s*(>=|<=|!=|==|>|<|=)\s*(.+)$/);
  
  if (!match) {
    return false;
  }
  
  const [, operator, targetStr] = match;
  const target = targetStr.trim().replace(/['"]/g, '');
  
  // Convert to numbers if both values are numeric
  const numValue = Number(value);
  const numTarget = Number(target);
  const useNumbers = !isNaN(numValue) && !isNaN(numTarget);
  
  const compareValue = useNumbers ? numValue : value;
  const compareTarget = useNumbers ? numTarget : target;
  
  switch (operator) {
    case '>':
      return compareValue > compareTarget;
    case '>=':
      return compareValue >= compareTarget;
    case '<':
      return compareValue < compareTarget;
    case '<=':
      return compareValue <= compareTarget;
    case '=':
    case '==':
      return compareValue == compareTarget;
    case '!=':
      return compareValue != compareTarget;
    default:
      return false;
  }
}

/**
 * Gets a nested property value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Evaluates if a guest matches a segmentation rule
 */
function evaluateRule(guest: Guest, rule: SegmentationRule): boolean {
  if (rule.conditions.default) {
    return true; // Default rule matches everyone
  }
  
  // Handle OR conditions
  if (rule.conditions.or) {
    return rule.conditions.or.some(orCondition => {
      return Object.entries(orCondition).every(([key, condition]) => {
        const value = getNestedValue(guest, key);
        if (key === 'guest_communications.sentiment') {
          // Special handling for sentiment - check if any communication has negative sentiment
          return guest.guest_communications.some(comm => comm.sentiment === condition);
        }
        return evaluateCondition(value, condition);
      });
    });
  }
  
  // Handle AND conditions (all must match)
  return Object.entries(rule.conditions).every(([key, condition]) => {
    if (typeof condition !== 'string') return true;
    
    const value = getNestedValue(guest, key);
    if (key === 'guest_communications.sentiment') {
      // Special handling for sentiment
      return guest.guest_communications.some(comm => comm.sentiment === condition);
    }
    
    return evaluateCondition(value, condition);
  });
}

/**
 * Assigns a segment to a guest based on segmentation rules
 * Rules are evaluated in order, first match wins
 */
export function assignSegment(guest: Guest, rules: SegmentationRule[]): string {
  for (const rule of rules) {
    if (evaluateRule(guest, rule)) {
      return rule.name;
    }
  }
  
  // Fallback to neutral if no rules match
  return 'Neutral';
}

/**
 * Calculates recency days from last checkout date
 */
export function calculateRecencyDays(lastCheckOut: string): number {
  const checkOutDate = new Date(lastCheckOut);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - checkOutDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}