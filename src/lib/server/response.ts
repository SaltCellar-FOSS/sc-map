function bigintReplacer(_key: string, value: unknown): unknown {
	return typeof value === 'bigint' ? value.toString() : value;
}

export function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data, bigintReplacer), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

export function errorResponse(error: string, status: number): Response {
	return jsonResponse({ error }, status);
}
