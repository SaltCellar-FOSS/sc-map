import { z } from 'zod';
import type { UserInsert } from '$lib/server/dao/users/types';
import { TIMEOUT_MS } from './constants';

const TokenResponseSchema = z.object({
	access_token: z.string(),
	token_type: z.string(),
	expires_in: z.number(),
	refresh_token: z.string(),
	scope: z.string()
});

const DiscordUserSchema = z.object({
	id: z.string(),
	username: z.string(),
	discriminator: z.string(),
	avatar: z.string().nullable().optional()
});

const GuildMemberSchema = z.object({
	roles: z.array(z.string())
});

type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type DiscordUser = z.infer<typeof DiscordUserSchema>;
export type GuildMember = z.infer<typeof GuildMemberSchema>;

export class TokenExchangeError extends Error {}
export class UserFetchError extends Error {}
export class GuildMemberFetchError extends Error {}
export class GuildMemberNotFoundError extends Error {}

export async function exchangeCode(
	code: string,
	clientId: string,
	clientSecret: string,
	redirectUri: string
): Promise<TokenResponse> {
	const res = await fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		signal: AbortSignal.timeout(TIMEOUT_MS),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: 'authorization_code',
			code,
			redirect_uri: redirectUri
		})
	});
	if (!res.ok) throw new TokenExchangeError(`${res.status}`);
	return TokenResponseSchema.parse(await res.json());
}

export function discordUserToInsert(
	user: DiscordUser,
	is_current_server_member: boolean,
	has_lifetime_access: boolean
): UserInsert {
	const discord_handle =
		user.discriminator === '0' ? user.username : `${user.username}#${user.discriminator}`;
	const avatar_url = user.avatar
		? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
		: null;

	return {
		discord_id: user.id,
		discord_handle,
		avatar_url,
		google_id: null,
		has_lifetime_access,
		is_current_server_member
	};
}

export async function getGuildMember(
	token: TokenResponse,
	guildId: string
): Promise<GuildMember | null> {
	const res = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
		signal: AbortSignal.timeout(TIMEOUT_MS),
		headers: { Authorization: `${token.token_type} ${token.access_token}` }
	});
	if (res.status === 404) throw new GuildMemberNotFoundError();
	if (!res.ok) throw new GuildMemberFetchError(`${res.status}`);
	return GuildMemberSchema.parse(await res.json());
}

export async function getCurrentUser(token: TokenResponse): Promise<DiscordUser> {
	const res = await fetch('https://discord.com/api/users/@me', {
		signal: AbortSignal.timeout(TIMEOUT_MS),
		headers: { Authorization: `${token.token_type} ${token.access_token}` }
	});
	if (!res.ok) throw new UserFetchError(`${res.status}`);
	return DiscordUserSchema.parse(await res.json());
}
