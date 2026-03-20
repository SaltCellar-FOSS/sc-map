<script lang="ts">
	import TextField from '$lib/components/ui/textfield/TextField.svelte';
	import List from '$lib/components/ui/list/List.svelte';
	import ListItem from '$lib/components/ui/list/ListItem.svelte';
	import SearchIcon from '$lib/icons/SearchIcon.svelte';
	import { SEARCH_BLUR_DELAY_MS } from '$lib/components/ui-constants';
	import { isPlace, type SearchResult } from '$lib/schemas/search';
	import { CATEGORIES } from '$lib/categories';
	import PinIcon from '$lib/icons/PinIcon.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { searchPlacesOptions } from '$lib/queries';
	import type { SelectedLocation } from '../types';

	let {
		placeholder = 'Search Google Maps',
		selectedLocation = $bindable()
	}: {
		placeholder?: string;
		selectedLocation: SelectedLocation | null;
	} = $props();

	let focused = $state(false);
	let query = $state('');

	$effect(() => {
		if (!selectedLocation) {
			return;
		}

		query = selectedLocation.name;
	});

	const searchQuery = createQuery(() => searchPlacesOptions(query));
	const suggestions = $derived(searchQuery.data ?? []);

	let open = $derived(focused && suggestions.length > 0);

	function handleResultClick(searchResult: SearchResult) {
		query = searchResult.name;
		selectedLocation = searchResult;
	}
</script>

{#snippet searchButton()}
	<button class="search-btn" aria-label="Search" type="submit">
		<SearchIcon />
	</button>
{/snippet}

{#snippet resultIcon(searchResult: SearchResult)}
	{@const isSavedPlace = isPlace(searchResult)}
	{#if isSavedPlace}
		{@const glyph = CATEGORIES[searchResult.type]}
		{#if 'glyphText' in glyph}
			<span class="place-glyph" style="background: {glyph.color}">{glyph.glyphText}</span>
		{:else}
			{@const GlyphIcon = glyph.icon}
			<GlyphIcon />
		{/if}
	{:else}
		<PinIcon />
	{/if}
{/snippet}

<div class="search-wrapper" role="search">
	<div class="search-container" class:open>
		<form spellcheck="false">
			<TextField
				id="map-search"
				{placeholder}
				bind:value={query}
				autocomplete="off"
				trailingIcon={searchButton}
				onfocus={() => (focused = true)}
				onblur={() => setTimeout(() => (focused = false), SEARCH_BLUR_DELAY_MS)}
				class={open ? 'search-field search-field--open' : 'search-field'}
			/>
		</form>

		{#if open}
			<div id="map-search-listbox" role="listbox" aria-label="Search suggestions">
				<List surface>
					{#each suggestions as searchResult (searchResult.google_place_id)}
						<ListItem
							headline={searchResult.name}
							supportingText={searchResult.formatted_address}
							interactive
							onclick={() => handleResultClick(searchResult)}
						>
							{#snippet leadingIcon()}
								{@render resultIcon(searchResult)}
							{/snippet}
						</ListItem>
					{/each}
				</List>
			</div>
		{/if}
	</div>
</div>

<style>
	.search-wrapper {
		position: relative;
		z-index: 300;
	}

	.search-container {
		width: 376px;
		max-width: 80vw;
		border-radius: var(--md-sys-shape-corner-extra-large);
		transition: box-shadow var(--duration-slow);
		box-shadow: var(--shadow-material);
		overflow: hidden;
		border: 1px solid var(--md-sys-color-outline-variant);
	}

	.search-container.open {
		border-radius: var(--md-sys-shape-corner-extra-large);
		box-shadow: var(--shadow-search-open);
	}

	form {
		margin: 0;
	}

	/* Square the bottom corners of the TextField when the list is open */
	:global(.search-field--open .tf-container) {
		border-radius: var(--md-sys-shape-corner-extra-small-top) !important;
	}

	:global(.search-field .tf-active-indicator) {
		display: none;
	}

	#map-search-listbox :global(.list-root--surface) {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	.search-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: none;
		background: transparent;
		border-radius: var(--md-sys-shape-corner-extra-large);
		cursor: pointer;
		color: var(--md-sys-color-on-surface-variant);
		padding: var(--space-2);
		transition:
			background-color var(--duration-base),
			color var(--duration-base);
	}

	.search-btn:hover {
		background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
		color: var(--md-sys-color-on-surface);
	}

	.search-btn:focus-visible {
		outline: 2px solid var(--md-sys-color-primary);
		outline-offset: 2px;
	}

	.place-glyph {
		width: 100%;
		height: 100%;
		border-radius: var(--md-sys-shape-corner-medium);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-lg);
	}
</style>
