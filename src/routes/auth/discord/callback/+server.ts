import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_DISCORD_CLIENT_ID } from '$env/static/public';
import { env } from '$env/dynamic/private';
const { DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, DISCORD_GUILD_ID } = env;
import {
	exchangeCode,
	getCurrentUser,
	getGuildMember,
	TokenExchangeError,
	UserFetchError,
	GuildMemberFetchError,
	GuildMemberNotFoundError
} from '$lib/server/discord';
import { createSessionCookie } from '$lib/server/cookie';
import { SESSION_COOKIE_MAX_AGE_SECONDS } from '$lib/server/constants';
import { upsertDiscordUser } from '$lib/services/auth';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	if (!code) redirect(303, '/');

	let token;
	try {
		token = await exchangeCode(
			code,
			PUBLIC_DISCORD_CLIENT_ID,
			DISCORD_CLIENT_SECRET,
			DISCORD_REDIRECT_URI
		);
	} catch (e) {
		if (e instanceof TokenExchangeError) redirect(303, '/?error=token_exchange_failed');
		throw e;
	}

	let discordUser;
	try {
		discordUser = await getCurrentUser(token);
	} catch (e) {
		if (e instanceof UserFetchError) redirect(303, '/?error=user_fetch_failed');
		throw e;
	}

	let guildMember;
	try {
		guildMember = await getGuildMember(token, DISCORD_GUILD_ID);
	} catch (e) {
		if (e instanceof GuildMemberFetchError) redirect(303, '/?error=guild_member_fetch_failed');
		else if (e instanceof GuildMemberNotFoundError) guildMember = null;
		else throw e;
	}

	const user = await upsertDiscordUser(discordUser, guildMember);

	const maxAge = SESSION_COOKIE_MAX_AGE_SECONDS;
	const sessionToken = await createSessionCookie(user.id, maxAge);
	cookies.set('session', sessionToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge
	});

	redirect(303, '/');
};
