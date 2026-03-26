<script lang="ts">
	import type { SavedPlace } from '$lib/schemas/saved-place';
	import { SavedPlaceType } from '$lib/schemas/saved-place';
	import { CATEGORIES } from '$lib/categories';
	import Icon from './ui/icon/Icon.svelte';

	import { SvelteSet } from 'svelte/reactivity';

	type Props = {
		savedPlaces: Record<string, SavedPlace>;
		onplaceclick: (place: SavedPlace) => void;
	};

	let { savedPlaces, onplaceclick }: Props = $props();

	let open = $state(false);
	let expandedCategories = new SvelteSet<SavedPlaceType>();

	const ICON_NAMES: Record<
		SavedPlaceType,
		'restaurant' | 'bar' | 'bakery' | 'deli' | 'foodTruck' | 'dessert' | 'otherDestination'
	> = {
		[SavedPlaceType.Restaurant]: 'restaurant',
		[SavedPlaceType.Bar]: 'bar',
		[SavedPlaceType.Bakery]: 'bakery',
		[SavedPlaceType.Deli]: 'deli',
		[SavedPlaceType.FoodTruck]: 'foodTruck',
		[SavedPlaceType.Dessert]: 'dessert',
		[SavedPlaceType.OtherDestination]: 'otherDestination'
	};

	const groupedPlaces = $derived.by(() => {
		const groups: Partial<Record<SavedPlaceType, SavedPlace[]>> = {};
		for (const place of Object.values(savedPlaces)) {
			(groups[place.type] ??= []).push(place);
		}
		return groups;
	});

	function toggleCategory(type: SavedPlaceType) {
		if (expandedCategories.has(type)) expandedCategories.delete(type);
		else expandedCategories.add(type);
	}
</script>

<div class="sidebar" class:sidebar--open={open}>
	<button
		class="sidebar__toggle"
		aria-label={open ? 'Close saved places' : 'Open saved places'}
		onclick={() => (open = !open)}
	>
		<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			{#if open}
				<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
			{:else}
				<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
			{/if}
		</svg>
	</button>

	{#if open}
		<nav class="sidebar__content" aria-label="Saved places">
			<h2 class="sidebar__title">Saved Places</h2>

			{#each Object.values(SavedPlaceType) as type (type)}
				{@const places = groupedPlaces[type]}
				{#if places && places.length > 0}
					{@const config = CATEGORIES[type]}
					{@const expanded = expandedCategories.has(type)}
					<div class="category">
						<button
							class="category__header"
							aria-expanded={expanded}
							onclick={() => toggleCategory(type)}
						>
							<Icon name={ICON_NAMES[type]} size={20} />
							<span class="category__label">{config.label}</span>
							<span class="category__count">{places.length}</span>
							<svg
								class="category__chevron"
								class:category__chevron--expanded={expanded}
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
								<path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
							</svg>
						</button>

						{#if expanded}
							<ul class="category__list">
								{#each places as place (place.id)}
									<li>
										<button class="place-item" onclick={() => onplaceclick(place)}>
											<span class="place-item__name">{place.name}</span>
											<span class="place-item__address">{place.formatted_address}</span>
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}
			{/each}
		</nav>
	{/if}
</div>

<style>
	.sidebar {
		position: absolute;
		top: 0;
		left: 0;
		height: 100vh;
		z-index: 10;
		display: flex;
		pointer-events: none;
	}

	.sidebar__toggle {
		pointer-events: auto;
		position: absolute;
		top: 80px;
		left: 8px;
		width: 40px;
		height: 40px;
		border-radius: var(--md-sys-shape-corner-full, 50%);
		border: none;
		background: var(--md-sys-color-surface-container, #fff);
		color: var(--md-sys-color-on-surface, #1c1b1f);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		transition: left 250ms ease;
	}

	.sidebar--open .sidebar__toggle {
		left: 296px;
	}

	.sidebar__content {
		pointer-events: auto;
		width: 288px;
		height: 100%;
		background: var(--md-sys-color-surface, #fffbfe);
		color: var(--md-sys-color-on-surface, #1c1b1f);
		overflow-y: auto;
		overscroll-behavior: contain;
		box-shadow: 1px 0 4px rgba(0, 0, 0, 0.15);
		padding-bottom: 16px;
	}

	.sidebar__title {
		margin: 0;
		padding: 16px;
		font-size: var(--md-sys-typescale-title-large-size, 22px);
		font-weight: var(--md-sys-typescale-title-large-weight, 400);
		color: var(--md-sys-color-on-surface, #1c1b1f);
	}

	.category__header {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 10px 16px;
		border: none;
		background: none;
		cursor: pointer;
		color: var(--md-sys-color-on-surface, #1c1b1f);
		font-size: var(--md-sys-typescale-body-large-size, 16px);
		text-align: left;
	}

	.category__header:hover {
		background: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 8%, transparent);
	}

	.category__label {
		flex: 1;
		font-weight: 500;
	}

	.category__count {
		font-size: var(--md-sys-typescale-label-small-size, 11px);
		color: var(--md-sys-color-on-surface-variant, #49454f);
		background: var(--md-sys-color-surface-container-high, #ece6f0);
		border-radius: var(--md-sys-shape-corner-full, 50%);
		min-width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-inline: 4px;
	}

	.category__chevron {
		transition: transform 200ms ease;
		color: var(--md-sys-color-on-surface-variant, #49454f);
		flex-shrink: 0;
	}

	.category__chevron--expanded {
		transform: rotate(180deg);
	}

	.category__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.place-item {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 8px 16px 8px 48px;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		color: var(--md-sys-color-on-surface, #1c1b1f);
		gap: 2px;
	}

	.place-item:hover {
		background: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 8%, transparent);
	}

	.place-item__name {
		font-size: var(--md-sys-typescale-body-medium-size, 14px);
		font-weight: 500;
	}

	.place-item__address {
		font-size: var(--md-sys-typescale-body-small-size, 12px);
		color: var(--md-sys-color-on-surface-variant, #49454f);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media screen and (max-width: 767px) {
		.sidebar__toggle {
			top: auto;
			bottom: 16px;
			left: 16px;
		}

		.sidebar--open .sidebar__toggle {
			left: 16px;
			bottom: calc(50% + 8px);
		}

		.sidebar__content {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100vw;
			height: 50vh;
			border-radius: 16px 16px 0 0;
			box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
		}
	}
</style>
