import { rulePathTraversal } from './rule/pathTransversal.js';
import { ruleSuspiciousHeaders } from './rule/suspiciousHeaders.js';
import { ruleMethodAnomaly } from './rule/methodAnomaly.js';

export const rules = [
  rulePathTraversal,
  ruleSuspiciousHeaders,
  ruleMethodAnomaly
];
