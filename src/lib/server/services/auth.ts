import { sql } from '$lib/db';
import { UsersDao } from '$lib/server/dao/users';
import { discordUserToInsert, type DiscordUser, type GuildMember } from '$lib/server/discord';
import { env } from '$env/dynamic/private';
import type { User } from '$lib/server/dao/users/types';

const { DISCORD_GOATED_ROLE_ID } = env;

export async function upsertDiscordUser(
	discordUser: DiscordUser,
	guildMember: GuildMember | null
): Promise<User> {
	const is_current_server_member = guildMember !== null;
	const has_lifetime_access = guildMember?.roles.includes(DISCORD_GOATED_ROLE_ID) ?? false;
	const insert = discordUserToInsert(discordUser, is_current_server_member, has_lifetime_access);

	return sql.begin(async (tx) => {
		const dao = new UsersDao(tx);
		const existing = await dao.findByDiscordId(discordUser.id);
		if (!existing) {
			const user = await dao.insertUser(insert);
			console.log('user created', user);
			return user;
		}
		return dao.updateUser(existing.id, {
			discord_handle: insert.discord_handle,
			is_current_server_member,
			has_lifetime_access
		});
	});
}
