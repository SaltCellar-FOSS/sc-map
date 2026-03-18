import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_DISCORD_CLIENT_ID } from '$env/static/public';
import {
	DISCORD_CLIENT_SECRET,
	DISCORD_REDIRECT_URI,
	DISCORD_GUILD_ID,
	DISCORD_GOATED_ROLE_ID
} from '$env/static/private';
import { sql } from '$lib/db';
import { UsersDao } from '$lib/dao/users';
import {
	exchangeCode,
	getCurrentUser,
	getGuildMember,
	discordUserToInsert,
	TokenExchangeError,
	UserFetchError,
	GuildMemberFetchError,
	GuildMemberNotFoundError
} from '$lib/server/discord';
import { createSessionCookie } from '$lib/server/cookie';
import { SESSION_COOKIE_MAX_AGE_SECONDS } from '$lib/server/constants';

const usersDao = new UsersDao(sql);

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
	const is_current_server_member = guildMember !== null;
	const has_lifetime_access = guildMember?.roles.includes(DISCORD_GOATED_ROLE_ID) ?? false;

	const insert = discordUserToInsert(discordUser, is_current_server_member, has_lifetime_access);

	let user = await usersDao.findByDiscordId(discordUser.id);
	if (!user) {
		user = await usersDao.insertUser(insert);
		console.log('user created', user);
	} else {
		user = await usersDao.updateUser(user.id, {
			discord_handle: insert.discord_handle,
			is_current_server_member,
			has_lifetime_access
		});
	}

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
