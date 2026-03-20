/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE in the project root for full licence information.
 *
 * Stoat has no ephemeral messages, so this is visible to everyone.
 * We measure round-trip by sending a message and computing the delta.
 */

import { BotCommand, CommandContext, replyEmbed } from '../utils/commandContext';
import { buildEmbed } from '../utils/embedBuilder';

const command: BotCommand = {
    name: 'ping',
    description: 'Replies with Pong and displays latency.',

    async execute(ctx: CommandContext): Promise<void> {
        const before = Date.now();
        const sent = await ctx.message.reply('Pinging...');
        const latency = Date.now() - before;

        const embed = buildEmbed({
            title: '🌐 Latency Check Complete',
            description: `Pong! 🏓\n**Round-trip latency:** ${latency}ms`,
            colour: 0x2ecc71,
        });

        // Edit the placeholder message in-place
        await sent?.edit({
            content: '',
            embeds: [embed as any],
        });
    },
};

export default command;
