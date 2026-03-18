<script lang="ts">
	let { size = 20 }: { size?: number } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	<path d="M3 11V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8" />
	<path d="M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" />
	<line x1="12" y1="3" x2="12" y2="11" />
	<path d="M8 15h.01" />
	<path d="M8 19h.01" />
	<path d="M16 15h.01" />
	<path d="M16 19h.01" />
	<path d="M12 19h.01" />
</svg>
