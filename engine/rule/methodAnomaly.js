export const ruleMethodAnomaly = {
  name: 'METHOD_ANOMALY',

  evaluate(context) {
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(context.request.method)) {
      return {
        action: 'BLOCK',
        reason: 'Método HTTP inesperado'
      };
    }
  }
};
