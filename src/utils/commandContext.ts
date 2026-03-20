/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE in the project root for full licence information.
 *
 * Because Stoat uses prefix-based commands, each command receives a
 * CommandContext instead of a Discord CommandInteraction.
 */

import { Message, Client } from 'revolt.js';
import { StoatEmbed } from './embedBuilder';

export interface CommandContext {
    /** The raw message that triggered the command */
    message: Message;
    /** Parsed arguments (everything after the command name, split by spaces) */
    args: string[];
    /** The revolt.js client */
    client: Client;
}

/** Reply with plain text, automatically replying to the triggering message */
export async function reply(ctx: CommandContext, content: string): Promise<void> {
    await ctx.message.reply(content);
}

/** Reply with one or more Stoat embeds */
export async function replyEmbed(
    ctx: CommandContext,
    embeds: StoatEmbed[],
    content?: string
): Promise<void> {
    await ctx.message.reply({
        content: content ?? '',
        embeds: embeds as any,
    });
}

/** Shape every command module must export as default */
export interface BotCommand {
    /** Command name without prefix, e.g. "gaycounter" */
    name: string;
    description: string;
    /** Optional list of aliases */
    aliases?: string[];
    execute(ctx: CommandContext): Promise<void>;
}
