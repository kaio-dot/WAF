import { handleDecision } from './decisionEngine.js';
import { rules } from './rules.js';

function forwardDecision(context) {
  handleDecision(context);
}

export function runRuleEngine(context) {
  for (const rule of rules) {
    const result = rule.evaluate(context);

    if (result?.action === 'BLOCK') {
      context.decision.action = 'BLOCK';
      context.decision.reason = result.reason;
      break;
    }
  }

  forwardDecision(context);
}