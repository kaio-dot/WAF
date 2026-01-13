import { URL } from 'url';


export function normalizeRequest(rawRequest, res){
    const anomalias = [];

    const normalizedRequest = {
        method: rawRequest.method.toUpperCase(),
        path: normalizePath(rawRequest.url, anomalias),
        query: normalizeQuery(rawRequest.url),
        headers: normalizeHeaders(rawRequest.headers, anomalias),
        body: rawRequest.body, 
        ip: rawRequest.ip || res.connection.remoteAddress, 
        anomalias
    };

   res.writeHead(200, {
  'Content-Type': 'application/json',
  'X-Request-Id': rawRequest.id
});

res.end(JSON.stringify(normalized, null, 2));
    return normalizedRequest;
}


//Funções de normalização da requisição

function normalizePath(rawUrl, anomalies) {
  try {
    const decoded = decodeURIComponent(rawUrl);
    const url = new URL(decoded, 'http://waf.local');

    // normaliza barras duplicadas
    let path = url.pathname.replace(/\/{2,}/g, '/');

    // detecta traversal
    if (path.includes('..')) {
      anomalies.push('PATH_TRAVERSAL_PATTERN');
    }

    return path;
  } catch (err) {
    anomalies.push('INVALID_URL_ENCODING');
    return '/';
  }
}

function normalizeQuery(rawUrl) {
  try {
    const decoded = decodeURIComponent(rawUrl);
    const url = new URL(decoded, 'http://waf.local');

    const query = {};
    for (const [key, value] of url.searchParams.entries()) {
      query[key] = value;
    }

    return query;
  } catch {
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
