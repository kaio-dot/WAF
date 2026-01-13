export const rulePathTraversal = {
  name: 'PATH_TRAVERSAL',

  evaluate(context) {
    if (context.metadata.anomalies.includes('PATH_TRAVERSAL_PATTERN')) {
      return {
        action: 'BLOCK',
        reason: 'Path traversal detectado'
      };
    }
  }
};
