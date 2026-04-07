<script lang="ts">
	import '$lib/styles/theme.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://maps.googleapis.com" />
	<link rel="preconnect" href="https://maps.gstatic.com" />
</svelte:head>

{@render children()}
