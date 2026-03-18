<script lang="ts">
	import SearchSuggestionList from './SearchSuggestionList.svelte';
	import SearchIcon from '$lib/icons/SearchIcon.svelte';
	import { SEARCH_BLUR_DELAY_MS } from '$lib/components/ui-constants';

	let { placeholder = 'Search Google Maps' }: { placeholder?: string } = $props();

	let focused = $state(false);
	let open = $derived(focused);

	const suggestions = [
		{
			id: '1',
			icon: 'pin' as const,
			primary: 'New York, NY',
			secondary: 'New York, United States'
		},
		{
			id: '2',
			icon: 'pin' as const,
			primary: 'Los Angeles, CA',
			secondary: 'California, United States'
		},
		{
			id: '3',
			icon: 'history' as const,
			primary: 'Chicago, IL',
			secondary: 'Illinois, United States'
		},
		{
			id: '4',
			icon: 'history' as const,
			primary: 'Houston, TX',
			secondary: 'Texas, United States'
		},
		{
			id: '5',
			icon: 'pin' as const,
			primary: 'Philadelphia, PA',
			secondary: 'Pennsylvania, United States'
		}
	];
</script>

<div class="search-wrapper" role="search">
	<div class="search-container" class:open>
		<div class="search-bar" class:open>
			<form spellcheck="false">
				<label class="visually-hidden" for="map-search">{placeholder}</label>
				<input
					id="map-search"
					class="search-input"
					type="text"
					role="combobox"
					aria-controls="map-search-listbox"
					aria-expanded={open}
					aria-haspopup="listbox"
					autocomplete="off"
					{placeholder}
					onfocus={() => (focused = true)}
					onblur={() => setTimeout(() => (focused = false), SEARCH_BLUR_DELAY_MS)}
				/>
			</form>

			<div class="search-btn-wrapper">
				<button class="search-btn" aria-label="Search" type="submit">
					<SearchIcon />
				</button>
			</div>
		</div>

		{#if open}
			<SearchSuggestionList {suggestions} />
		{/if}
	</div>
</div>

<style>
	.search-container {
		width: 376px;
		border-radius: 24px;
		transition: box-shadow 0.3s;
		box-shadow:
			0 1px 3px rgba(60, 64, 67, 0.3),
			0 4px 8px 3px rgba(60, 64, 67, 0.15);
	}

	.search-container.open {
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			0 -1px 0 rgba(0, 0, 0, 0.02);
		border-radius: 24px;
	}

	.search-bar {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		height: 48px;
		background: #fff;
		border-radius: 24px;
		padding: 0 56px 0 16px;
		box-sizing: border-box;
		transition: border-radius 0.15s;
	}

	.search-bar.open {
		border-radius: 24px 24px 0 0;
	}

	form {
		flex: 1;
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.search-input {
		width: 100%;
		border: none;
		outline: none;
		background: transparent;
		font-family: 'Google Sans', Roboto, Arial, sans-serif;
		font-size: 15px;
		font-weight: 400;
		line-height: 24px;
		color: #202124;
		transition: color 0.3s;
	}

	.search-input::placeholder {
		color: #5f6368;
	}

	.search-btn-wrapper {
		position: absolute;
		right: 0;
		top: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.search-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: none;
		background: transparent;
		border-radius: 50%;
		cursor: pointer;
		color: #5f6368;
		padding: 8px;
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	.search-btn:hover {
		background-color: rgba(95, 99, 104, 0.1);
		color: #202124;
	}

	.search-btn:focus-visible {
		outline: 2px solid #1a73e8;
		outline-offset: 2px;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
