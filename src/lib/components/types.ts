type GlyphCategoryConfig = {
	label: string;
	color: string;
	glyphText: string;
};

type IconCategoryConfig = {
	label: string;
	color: string;
};

export type CategoryConfig = GlyphCategoryConfig | IconCategoryConfig;
