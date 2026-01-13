import { URL } from 'url';
import { createRequestContext } from '../context/requestContext.js';


export function normalizeRequest(rawRequest, res){
  const anomalies = [];

  const normalizedRequest = {
    id: rawRequest.id,
    method: rawRequest.method.toUpperCase(),
    path: normalizePath(rawRequest.url, anomalies),
    query: normalizeQuery(rawRequest.url, anomalies),
    headers: normalizeHeaders(rawRequest.headers, anomalies),
    body: rawRequest.body, 
    ip: rawRequest.ip || res.connection.remoteAddress, 
    anomalies
  };

  sendToEngine(normalizedRequest, res);
}

function sendToEngine(normalizedRequest, res){
  createRequestContext(normalizedRequest, res);
}


//Funções de normalização da requisição

function normalizePath(rawUrl, anomalies) {
  try {
    let decoded = rawUrl;
    let previousDecoded = '';
    
    // Decodifica iterativamente até não mudar mais (pega dupla encoding)
    while (decoded !== previousDecoded && decoded.includes('%')) {
      previousDecoded = decoded;
      try {
        decoded = decodeURIComponent(decoded);
      } catch (_err) {
        break;
      }
    }

    const url = new URL(decoded, 'http://waf.local');
    let path = url.pathname.replace(/\/{2,}/g, '/');

    // Detecta vários padrões de traversal
    const traversalPatterns = [
      /\.\.\//,           // ../
      /\.\.\\/,           // ..\
      /\.\.\;/,           // ..; (null byte escape attempt)
      /\%2e\%2e/i,        // %2e%2e (encoded ..)
      /\%2f\.\./i,        // %2f.. (./ encoded)
      /\%5c\.\./i         // %5c.. (\ encoded)
    ];

    for (const pattern of traversalPatterns) {
      if (pattern.test(path) || pattern.test(decoded)) {
        anomalies.push('PATH_TRAVERSAL_PATTERN');
        break;
      }
    }

    return path;
  } catch (err) {
    anomalies.push('INVALID_URL_ENCODING');
    return '/';
  }
}

function normalizeQuery(rawUrl, anomalies) {
  try {
    let decoded = rawUrl;
    let previousDecoded = '';
    
    // Decodifica iterativamente para pegar dupla encoding
    while (decoded !== previousDecoded && decoded.includes('%')) {
      previousDecoded = decoded;
      try {
        decoded = decodeURIComponent(decoded);
      } catch (_err) {
        break;
      }
    }

    const url = new URL(decoded, 'http://waf.local');
    const query = {};

    for (const [key, value] of url.searchParams.entries()) {
      // Detecta padrões de traversal em query params
      const traversalPatterns = [
        /\.\.\//,
        /\.\.\\/,
        /\%2e\%2e/i,
      ];

      for (const pattern of traversalPatterns) {
        if (pattern.test(value)) {
          anomalies.push('TRAVERSAL_IN_QUERY');
          break;
        }
      }
      query[key] = value;
    }

    return query;
  } catch (err) {
    anomalies.push('INVALID_QUERY_ENCODING');
    return {};
  }
}

function normalizeHeaders(headers, anomalies) {
  const normalized = {};

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();

    if (normalized[lowerKey]) {
      anomalies.push(`DUPLICATE_HEADER:${lowerKey}`);
      continue;
    }

    normalized[lowerKey] = value;
  }

  return normalized;
}
