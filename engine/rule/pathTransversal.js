export const rulePathTraversal = {
  name: 'PATH_TRAVERSAL',

  evaluate(context) {
    const { anomalies } = context.metadata;
    
    if (anomalies.includes('PATH_TRAVERSAL_PATTERN') || 
        anomalies.includes('TRAVERSAL_IN_QUERY') ||
        anomalies.includes('INVALID_URL_ENCODING')) {
      return {
        action: 'BLOCK',
        reason: 'Path traversal detectado'
      };
    }
  }
};
