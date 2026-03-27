<script lang="ts">
	import Card from './ui/card/Card.svelte';
	import type { VisitWithUser } from '$lib/schemas/visit';

	type Props = {
		visits: Promise<VisitWithUser[]>;
		currentUserId?: bigint;
		oneditvisit?: (visit: VisitWithUser) => void;
	};

	const { visits, currentUserId, oneditvisit }: Props = $props();

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	}

	function getInitial(handle: string | null): string {
		const cleaned = handle?.replace(/^@/, '') ?? '';
		return cleaned[0]?.toUpperCase() ?? '?';
	}
</script>

{#await visits}
	<p class="empty-state">Loading...</p>
{:then visits}
	{#if visits.length === 0}
		<p class="empty-state">No visits yet.</p>
	{:else}
		<div class="visit-list">
			{#each visits as visit (visit.id)}
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
								<div class="stars" aria-label="Rating: {visit.rating ?? 0} out of 5">
									{#each Array.from({ length: 5 }, (_, i) => i + 1) as star (star)}
										<svg viewBox="0 0 24 24" class="star-icon" aria-hidden="true">
											{#if star <= (visit.rating ?? 0)}
												<path
													d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
												/>
											{:else}
												<path
													d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
												/>
											{/if}
										</svg>
									{/each}
								</div>
								{#if currentUserId !== undefined && visit.user_id === currentUserId}
									<button
										class="edit-btn"
										aria-label="Edit visit"
										onclick={() => oneditvisit?.(visit)}
									>
										<svg viewBox="0 0 24 24" aria-hidden="true">
											<path
												d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"
											/>
										</svg>
									</button>
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
			{/each}
		</div>
	{/if}
{/await}

<style>
	.visit-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 4px 2px;
	}

	.empty-state {
		text-align: center;
		color: var(--md-sys-color-on-surface-variant);
		padding: 24px 0;
		margin: 0;
	}

	/* Header row: info left, stars right */
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

	/* Stars */
	.stars {
		display: flex;
		gap: 2px;
		color: var(--md-sys-color-on-surface-variant);
	}

	.edit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: none;
		cursor: pointer;
		color: var(--md-sys-color-on-surface-variant);
		border-radius: var(--md-sys-shape-corner-full);
		padding: 0;
	}

	.edit-btn:hover {
		background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
	}

	.edit-btn svg {
		width: 18px;
		height: 18px;
		fill: currentColor;
		display: block;
	}

	.star-icon {
		width: 20px;
		height: 20px;
		fill: currentColor;
		display: block;
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
