<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Card, { type CardVariant } from './Card.svelte';
	import Button from '../button/Button.svelte';

	const variants: CardVariant[] = ['elevated', 'filled', 'outlined'];

	const { Story } = defineMeta({
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['elevated', 'filled', 'outlined']
			},
			interactive: { control: 'boolean' },
			disabled: { control: 'boolean' },
			href: { control: 'text' }
		}
	});
</script>

<!-- Variants -->

<Story name="Elevated">
	<Card variant="elevated">
		{#snippet header()}
			<span class="md-card__title">Elevated card</span>
			<span class="md-card__subhead">Subhead</span>
		{/snippet}
		<p>Supporting text that describes the card content in more detail.</p>
		{#snippet actions()}
			<Button variant="text">Share</Button>
			<Button variant="text">Learn more</Button>
		{/snippet}
	</Card>
</Story>

<Story name="Filled">
	<Card variant="filled">
		{#snippet header()}
			<span class="md-card__title">Filled card</span>
			<span class="md-card__subhead">Subhead</span>
		{/snippet}
		<p>Supporting text that describes the card content in more detail.</p>
		{#snippet actions()}
			<Button variant="text">Share</Button>
			<Button variant="text">Learn more</Button>
		{/snippet}
	</Card>
</Story>

<Story name="Outlined">
	<Card variant="outlined">
		{#snippet header()}
			<span class="md-card__title">Outlined card</span>
			<span class="md-card__subhead">Subhead</span>
		{/snippet}
		<p>Supporting text that describes the card content in more detail.</p>
		{#snippet actions()}
			<Button variant="text">Share</Button>
			<Button variant="text">Learn more</Button>
		{/snippet}
	</Card>
</Story>

<!-- All variants at a glance -->

<Story name="All Variants">
	<div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-start;">
		{#each variants as variant (variant)}
			<Card {variant} style="width: 200px;">
				{#snippet header()}
					<span class="md-card__title">{variant}</span>
				{/snippet}
				<p>Supporting text.</p>
			</Card>
		{/each}
	</div>
</Story>

<!-- Header variations -->

<Story name="Header Only">
	<Card variant="elevated">
		{#snippet header()}
			<span class="md-card__title">Title only</span>
		{/snippet}
	</Card>
</Story>

<Story name="Header With Thumbnail">
	<Card variant="elevated">
		{#snippet thumbnail()}
			<img
				src="https://i.pravatar.cc/40"
				alt="Avatar"
				style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"
			/>
		{/snippet}
		{#snippet header()}
			<span class="md-card__title">Jane Smith</span>
			<span class="md-card__subhead">New York, NY</span>
		{/snippet}
	</Card>
</Story>

<!-- With media -->

<Story name="With Media">
	<Card variant="elevated" style="width: 300px;">
		{#snippet media()}
			<img
				src="https://picsum.photos/seed/card/600/300"
				alt="Scenic landscape"
				style="width: 100%; height: 160px; object-fit: cover; display: block;"
			/>
		{/snippet}
		{#snippet header()}
			<span class="md-card__title">Card with media</span>
			<span class="md-card__subhead">Subhead</span>
		{/snippet}
		<p>Supporting text below the media region.</p>
		{#snippet actions()}
			<Button variant="text">Share</Button>
		{/snippet}
	</Card>
</Story>

<!-- Interactive states -->

<Story name="Interactive">
	<Card variant="elevated" interactive onclick={() => alert('Card clicked')}>
		{#snippet header()}
			<span class="md-card__title">Interactive card</span>
			<span class="md-card__subhead">Click me</span>
		{/snippet}
		<p>This card behaves like a button.</p>
	</Card>
</Story>

<Story name="Link Card">
	<Card variant="outlined" href="/places">
		{#snippet header()}
			<span class="md-card__title">Link card</span>
			<span class="md-card__subhead">Navigates to /places</span>
		{/snippet}
		<p>This card renders as an anchor element.</p>
	</Card>
</Story>

<!-- Disabled -->

<Story name="Disabled Elevated">
	<Card variant="elevated" interactive disabled>
		{#snippet header()}
			<span class="md-card__title">Disabled card</span>
			<span class="md-card__subhead">Not interactive</span>
		{/snippet}
		<p>This card is disabled.</p>
	</Card>
</Story>

<!-- Body only -->

<Story name="Body Only">
	<Card variant="filled">
		<p>A card with only a body slot — fully custom layout.</p>
	</Card>
</Story>
