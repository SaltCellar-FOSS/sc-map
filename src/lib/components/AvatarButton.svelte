<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		src?: string;
		srcset?: string;
		alt?: string;
		onclick?: () => void;
		children?: Snippet;
	};

	let { src, srcset, alt = '', onclick, children }: Props = $props();
</script>

<button class="avatar-button" {onclick} type="button" aria-label={alt}>
	<span class="avatar-image">
		<img {src} {srcset} {alt} aria-hidden="true" />
	</span>
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
	.avatar-button {
		position: fixed;
		top: 10px;
		right: 10px;
		z-index: 100;
		display: inline-block;
		cursor: pointer;
		padding: 0;
		background: none;
		border: 1px solid rgba(128, 128, 128, 1);
		border-radius: 50%;
	}

	.avatar-image {
		display: block;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		overflow: hidden;
		background-size: 48px 48px;
		border: 0;
	}

	.avatar-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}

	.avatar-button:hover {
		box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.15);
	}

	.avatar-button:active {
		box-shadow: inset 0 2px 0 rgba(0, 0, 0, 0.15);
	}

	.avatar-button:focus-visible {
		outline: 2px solid var(--color-primary, #1a73e8);
		outline-offset: 2px;
	}
</style>
