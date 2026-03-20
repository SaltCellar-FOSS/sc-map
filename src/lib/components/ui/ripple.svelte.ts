export type Ripple = { id: number; x: number; y: number };

export function createRipple() {
	let ripples = $state<Ripple[]>([]);
	let nextId = 0;

	function addRipple(e: MouseEvent) {
		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();
		const id = nextId++;
		ripples = [...ripples, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }];
		setTimeout(() => {
			ripples = ripples.filter((r) => r.id !== id);
		}, 600);
	}

	return {
		get ripples() {
			return ripples;
		},
		addRipple
	};
}
