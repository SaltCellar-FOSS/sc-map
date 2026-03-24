<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SearchBar from './SearchBar.svelte';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			value: { control: 'text' },
			placeholder: { control: 'text' },
			disabled: { control: 'boolean' },
			'aria-label': { control: 'text' }
		}
	});
</script>

<!-- Default -->

<Story name="Default">
	<SearchBar placeholder="Search" aria-label="Search" />
</Story>

<!-- With leading icon -->

<Story name="With Leading Icon">
	<SearchBar placeholder="Search" aria-label="Search">
		{#snippet leadingIcon()}
			<svg class="md-search-bar__icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
				<path
					d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
				/>
			</svg>
		{/snippet}
	</SearchBar>
</Story>

<!-- With trailing icon -->

<Story name="With Trailing Icon">
	<SearchBar placeholder="Search" aria-label="Search" value="My search">
		{#snippet trailingIcons()}
			<button class="md-search-bar__icon-btn" aria-label="Clear" type="button">
				<svg class="md-search-bar__icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
					<path
						d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
					/>
				</svg>
			</button>
		{/snippet}
	</SearchBar>
</Story>

<!-- With both icons -->

<Story name="With Both Icons">
	<SearchBar placeholder="Search" aria-label="Search" value="My search">
		{#snippet leadingIcon()}
			<svg class="md-search-bar__icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
				<path
					d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
				/>
			</svg>
		{/snippet}
		{#snippet trailingIcons()}
			<button class="md-search-bar__icon-btn" aria-label="Clear" type="button">
				<svg class="md-search-bar__icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
					<path
						d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
					/>
				</svg>
			</button>
		{/snippet}
	</SearchBar>
</Story>

<!-- Disabled -->

<Story name="Disabled">
	<SearchBar placeholder="Search" aria-label="Search" disabled>
		{#snippet leadingIcon()}
			<svg class="md-search-bar__icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
				<path
					d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
				/>
			</svg>
		{/snippet}
	</SearchBar>
</Story>

<!-- With pre-filled value -->

<Story name="With Value">
	<SearchBar placeholder="Search" aria-label="Search" value="SoCalSandball">
		{#snippet leadingIcon()}
			<svg class="md-search-bar__icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
				<path
					d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
				/>
			</svg>
		{/snippet}
	</SearchBar>
</Story>
