import { randomUUID } from "crypto";
import { LIMITS } from '../config/limits.js';
import http from "http";

const {
    MAX_BODY_SIZE,
    REQUEST_TIMEOUT,
    ALLOWED_METHODS
} = LIMITS;


function handleRawRequest(rawRequest, res) {
  // Ainda NÃO é WAF
  // Só prova que o listener funciona

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'X-Request-Id': rawRequest.id
  });

  res.end(JSON.stringify({
    message: 'Request recebida pelo WAF listener',
    requestId: rawRequest.id
  }));
}


const server = http.createServer((req, res) => {
    const requestId = randomUUID();
    const startTime = Date.now();

    console.log('Requesição recebida:', {
        requestId,
        method: req.method,
        url: req.url,
        headers: req.headers
    });

    //Timeout global da request 
    req.setTimeout(REQUEST_TIMEOUT, () => {
        req.writeHead(408);
        req.end('Request Timeout');
        req.destroy();
        console.log(`Request ${requestId} timed out after ${REQUEST_TIMEOUT}ms`);
    });

    if(!ALLOWED_METHODS.includes(req.method)) {
        res.writeHead(405);
        res.end('Método não permitido');
        req.destroy();
        console.log(`Request ${requestId} com método não permitido: ${req.method}`);
        return;
    }

    let totalBytes = 0;
    const chunks = [];

    req.on('data', (chunk) => {
        totalBytes += chunk.length;

        if(totalBytes > MAX_BODY_SIZE) {
            res.writeHead(413);
            res.end('Payload com tamanho excedido');
            req.destroy();
            console.log(`Request ${requestId} excedeu o tamanho máximo do payload: ${totalBytes} bytes`);
            return;
        }

        chunks.push(chunk);
    });

    req.on('end', () => {
        const rawRequest = {
            id: requestId, 
            method: req.method,
            url: req.url,
            headers: req.headers,
            ip: req.socket.remoteAddress,
            body: Buffer.concat(chunks).toString(),
            receivedAt: new Date().toISOString()
        };

        handleRawRequest(rawRequest, res);
    });

    req.on('error', (err) => {
        res.writeHead(500);
        res.end('Erro interno no servidor');
        console.error(`Erro na request ${requestId}:`, err);
    });
});

export function startServer(port) {
    server.listen(port, () => {
        console.log(`Servidor HTTP ouvindo na porta ${port}`);
    });
}


