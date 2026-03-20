/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE in the project root for full licence information.
 */

import { BotCommand, CommandContext, replyEmbed } from '../utils/commandContext';
import { buildEmbed } from '../utils/embedBuilder';

// Override map for specific user IDs (Stoat user IDs — update these once you have them)
const gaynessOverrides = new Map<string, number>([
    ['01JZ6T05BKF9JQVK62QJT2KM02', 69], // @DoughCodes#2290
]);

function calculateGayness(userId: string): number {
    if (gaynessOverrides.has(userId)) {
        return gaynessOverrides.get(userId)!;
    }
    return Math.floor(Math.random() * 101);
}

const command: BotCommand = {
    name: 'gaycounter',
    description: 'Find out how gay a user is!',
    aliases: ['gay'],

    async execute(ctx: CommandContext): Promise<void> {
        // !gaycounter [@mention]
        // Stoat mentions look like <@userId>
        let targetId: string | null = null;
        let targetName: string | null = null;

        const mentionArg = ctx.args[0];
        const mentionMatch = mentionArg?.match(/^<@([A-Z0-9]+)>$/);

        if (mentionMatch) {
            targetId = mentionMatch[1];
            // Try to resolve the display name from the server member cache
            const server = ctx.message.channel?.server;
            const member = server?.member;
            targetName = member?.nickname ?? member?.user?.username ?? targetId;
        } else {
            // Default to the command author
            targetId = ctx.message.authorId ?? '';
            targetName = ctx.message.member?.nickname ?? ctx.message.author?.username ?? 'You';
        }

        const gayness = calculateGayness(targetId ?? '');

        let description = '';
        if (gayness < 20) {
            description = `**${targetName}** is **${gayness}% gay**! Keep shining! 🌈`;
        } else if (gayness <= 80) {
            description = `**${targetName}** is **${gayness}% gay**! That's a good spectrum position! 😉`;
        } else {
            description = `**${targetName}** is **${gayness}% gay**! Congratulations, that's max gay energy! ✨`;
        }

        const embed = buildEmbed({
            title: '🏳️‍🌈 Gayness Percentage Calculator',
            description,
            colour: 0x8e44ad,
        });

        await replyEmbed(ctx, [embed]);
    },
};

export default command;
