<script lang="ts">
	import SearchSuggestion from './SearchSuggestion.svelte';

	type Suggestion = {
		id: string;
		icon: 'pin' | 'history';
		primary: string;
		secondary: string;
	};

	let { suggestions }: { suggestions: Suggestion[] } = $props();
</script>

<ul class="suggestions-list" id="map-search-listbox" role="listbox">
	<li class="divider" aria-hidden="true"></li>
	{#each suggestions as suggestion (suggestion.id)}
		<li role="option" aria-selected="false">
			<SearchSuggestion
				icon={suggestion.icon}
				primary={suggestion.primary}
				secondary={suggestion.secondary}
			/>
		</li>
	{/each}
</ul>

<style>
	.suggestions-list {
		list-style: none;
		margin: 0;
		padding: 8px 0 12px;
		background: #fff;
		border-radius: 0 0 24px 24px;
		overflow: hidden;
	}

	.divider {
		height: 1px;
		background: #e8eaed;
		margin: 0 16px 8px;
	}
</style>
