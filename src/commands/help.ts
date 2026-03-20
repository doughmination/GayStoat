/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE in the project root for full licence information.
 *
 * Stoat has no interactive button components, so pagination is handled
 * with reaction-based navigation (⬅️ / ➡️).
 * A collector watches for reactions from the command author for 60 seconds.
 */

import { BotCommand, CommandContext, replyEmbed } from '../utils/commandContext';
import { buildEmbed } from '../utils/embedBuilder';
import { Message } from 'revolt.js';
import { log } from '../utils/logger';
import chalk from 'chalk';

const COMMANDS_PER_PAGE = 5;
const PAGINATION_TIMEOUT_MS = 60_000;

const PREV = encodeURIComponent('⬅️');
const NEXT = encodeURIComponent('➡️');

function buildPage(
    commandList: string[],
    page: number,
    totalPages: number
) {
    return buildEmbed({
        title: '📖 Available Commands',
        description: commandList
            .slice(page * COMMANDS_PER_PAGE, (page + 1) * COMMANDS_PER_PAGE)
            .join('\n\n'),
        colour: 0x5865F2,
    });
}

const command: BotCommand = {
    name: 'help',
    description: 'View all available commands.',

    async execute(ctx: CommandContext): Promise<void> {
        const commandList: string[] = [];
        (ctx.client as any).commands?.forEach((cmd: BotCommand) => {
            commandList.push(`**!${cmd.name}**\n└ ${cmd.description}`);
        });

        const totalPages = Math.ceil(commandList.length / COMMANDS_PER_PAGE);
        let page = 0;

        const pageEmbed = buildPage(commandList, page, totalPages);
        // Append page footer to description
        pageEmbed.description += `\n\n*Page ${page + 1} of ${totalPages}*`;

        const sent = await ctx.message.reply({ embeds: [pageEmbed as any] });
        if (!sent || totalPages <= 1) return;

        // Add navigation reactions
        await sent.react(PREV);
        await sent.react(NEXT);

        const timeout = setTimeout(async () => {
            try {
                await sent.clearReactions();
            } catch { /* message may have been deleted */ }
        }, PAGINATION_TIMEOUT_MS);

        // Listen for reaction additions
        const handler = async (reactionMessage: Message, userId: string, emoji: string) => {
            if (reactionMessage.id !== sent?.id) return;
            if (userId !== ctx.message.authorId) return;
            if (emoji !== PREV && emoji !== NEXT) return;

            // Remove the user's reaction so they can use it again
            try {
                await ctx.client.api.delete(
                    `/channels/${sent.channelId}/messages/${sent.id}/reactions/${emoji}`,
                    { user_id: userId } as any
                );
            } catch { /* ignore */ }

            if (emoji === NEXT && page < totalPages - 1) page++;
            if (emoji === PREV && page > 0) page--;

            const updated = buildPage(commandList, page, totalPages);
            updated.description += `\n\n*Page ${page + 1} of ${totalPages}*`;

            await sent.edit({ embeds: [updated as any] });
        };

        ctx.client.on('messageReactionAdd', handler);

        setTimeout(() => {
            ctx.client.removeListener('messageReactionAdd', handler);
            clearTimeout(timeout);
        }, PAGINATION_TIMEOUT_MS);
    },
};

export default command;
