const forbidden = ['x-forwarded-host', 'x-original-url'];

export const ruleSuspiciousHeaders = {
  name: 'SUSPICIOUS_HEADERS',

  evaluate(context) {
    for (const header of forbidden) {
      if (context.request.headers[header]) {
        return {
          action: 'BLOCK',
          reason: `Header suspeito: ${header}`
        };
      }
    }
  }
};
