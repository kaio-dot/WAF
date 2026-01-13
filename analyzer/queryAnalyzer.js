export function analyzeQuery(query, context) {
  if (!query) return;

  const decoded = decodeURIComponent(query).toLowerCase();

  const patterns = [
    "'--",
    " or 1=1",
    "union select",
    "information_schema",
    "sleep("
  ];

  for (const p of patterns) {
    if (decoded.includes(p)) {
      context.metadata.anomalies.push({
        type: 'SQLI_QUERY',
        value: p
      });

      context.decision = {
        action: 'BLOCK',
        reason: 'SQL Injection detectado'
      };

      return;
    }
  }
}
