<script lang="ts">
	import { CATEGORIES, type Place } from '$lib/types';

	let { place, onclose }: { place: Place; onclose: () => void } = $props();

	const { label, color } = $derived(CATEGORIES[place.category]);
</script>

<div class="panel">
	<button class="close" onclick={onclose}>✕</button>
	<h2>{place.name}</h2>
	<div class="category" style="color: {color}">{label}</div>
</div>

<style>
	.panel {
		position: fixed;
		top: 5rem;
		left: 1.5rem;
		width: 280px;
		background: white;
		border-radius: 1rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
		padding: 1.25rem;
	}

	.close {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		background: none;
		border: none;
		font-size: 1rem;
		cursor: pointer;
		color: #666;
		line-height: 1;
	}

	.category {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 0.25rem;
	}

	h2 {
		margin: 0;
		font-size: 1.125rem;
	}
</style>
