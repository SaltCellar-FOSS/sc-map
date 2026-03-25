import type { Snippet } from 'svelte';

export type SheetVariant = 'standard' | 'modal';

export interface SheetProps {
	variant?: SheetVariant;
	open?: boolean;
	title?: string;
	onclose?: () => void;
	children?: Snippet;
	headerActions?: Snippet;
	class?: string;
}
