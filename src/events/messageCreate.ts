/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE in the project root for full licence information.
 */

import { Message, Client } from 'revolt.js';
import { BotCommand, CommandContext } from '../utils/commandContext';
import { KeywordChecker } from '../utils/reactionSystem';
import { handleCommandError } from '../handlers/errorHandler';

interface ReactionQueueEntry {
    message: Message;
    emoji: string;
}

interface ExtendedClient extends Client {
    commands: Map<string, BotCommand>;
    reactionQueue: ReactionQueueEntry[];
}

const keywordChecker = new KeywordChecker();
const PREFIX = process.env.GAYBOT_PREFIX ?? '!';

export default {
    name: 'messageCreate',
    async execute(message: Message, client: ExtendedClient): Promise<void> {
        // Ignore bots
        if (message.author?.bot) return;
        if (!message.content) return;

        const content = message.content.trim();

        // ── Reaction system ──────────────────────────────────────────────────
        const matchingEmojis = keywordChecker.getMatchingEmojis(content);
        for (const emoji of matchingEmojis) {
            client.reactionQueue.push({ message, emoji });
        }

        // ── Command dispatch ─────────────────────────────────────────────────
        if (!content.startsWith(PREFIX)) return;

        const withoutPrefix = content.slice(PREFIX.length).trim();
        const [commandName, ...args] = withoutPrefix.split(/\s+/);

        if (!commandName) return;

        const command = client.commands.get(commandName.toLowerCase());
        if (!command) return;

        const ctx: CommandContext = { message, args, client };

        try {
            await command.execute(ctx);
        } catch (error) {
            await handleCommandError(error, message, commandName);
        }
    },
};
