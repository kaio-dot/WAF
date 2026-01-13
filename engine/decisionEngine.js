export function handleDecision(context) {
	const { decision, response } = context;

	// Evita enviar a resposta mais de uma vez em caso de erros
	if (response.writableEnded) {
		return;
	}

	if (decision.action === 'BLOCK') {
		response.writeHead(403, {
			'Content-Type': 'application/json',
			'X-Request-Id': context.id
		});

		response.end(JSON.stringify({
			status: 'blocked',
			reason: decision.reason,
			requestId: context.id
		}));
		return;
	}

	response.writeHead(200, {
		'Content-Type': 'application/json',
		'X-Request-Id': context.id
	});

	response.end(JSON.stringify({
		status: 'allowed',
		requestId: context.id,
		reason: decision.reason
	}));
}
