export function isPostgresError(e: unknown): e is { errno: string } {
	return typeof e === 'object' && e !== null && 'errno' in e && typeof e.errno === 'string';
}
