<script lang="ts">
	import type { VisitWithUser } from '$lib/schemas/visit';
	import { Button } from './ui/button';
	import { Card } from './ui/card';
	import Icon from './ui/icon/Icon.svelte';

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	}

	function getInitial(handle: string | null): string {
		const cleaned = handle?.replace(/^@/, '') ?? '';
		return cleaned[0]?.toUpperCase() ?? '?';
	}

	type Props = {
		visit: VisitWithUser;
		currentUserId?: bigint;
		oneditvisit?: (visit: VisitWithUser) => void;
		ondeletevisit?: (visit: VisitWithUser) => void;
	};

	const { currentUserId, visit, oneditvisit, ondeletevisit }: Props = $props();
</script>

<Card variant="outlined">
	{#snippet thumbnail()}
		{#if visit.avatar_url}
			<img src={visit.avatar_url} alt={visit.discord_handle ?? 'User avatar'} />
		{:else}
			<span class="avatar-initial" aria-hidden="true">
				{getInitial(visit.discord_handle)}
			</span>
		{/if}
	{/snippet}

	{#snippet header()}
		<div class="header-row">
			<div class="header-info">
				<span class="md-card__title">{visit.discord_handle ?? 'Unknown'}</span>
				<span class="md-card__subhead">{formatDate(visit.visited_at)}</span>
			</div>
			<div class="header-actions">
				{#if currentUserId !== undefined && visit.user_id === currentUserId}
					<Button variant="text" aria-label="Edit visit" onclick={() => oneditvisit?.(visit)}>
						{#snippet icon()}
							<Icon name="edit" class="md-btn__icon" />
						{/snippet}
					</Button>
					<Button variant="text" aria-label="Delete visit" onclick={() => ondeletevisit?.(visit)}>
						{#snippet icon()}
							<Icon name="delete" class="md-btn__icon" />
						{/snippet}
					</Button>
				{/if}
			</div>
		</div>
	{/snippet}

	{#if visit.summary}
		<p class="summary">{visit.summary}</p>
	{/if}
	{#if visit.photo_urls && visit.photo_urls.length > 0}
		<div class="photo-grid">
			{#each visit.photo_urls as url (url)}
				<img src={url} alt="User-uploaded" class="photo-thumb" />
			{/each}
		</div>
	{/if}
</Card>

<style>
	/* Header row: info left, actions right */
	.header-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		width: 100%;
		gap: 8px;
	}

	.header-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	/* Avatar initial */
	.avatar-initial {
		font-size: 1rem;
		font-weight: 500;
		line-height: 1;
	}

	/* Summary text */
	.summary {
		margin: 0;
	}

	/* Photo grid */
	.photo-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		margin-top: 12px;
	}

	.photo-thumb {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 8px;
		display: block;
		background-color: var(--md-sys-color-surface-container-highest);
	}
</style>
