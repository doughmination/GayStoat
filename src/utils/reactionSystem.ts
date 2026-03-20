/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE in the project root for full licence information.
 *
 * Stoat reaction notes:
 *   - Standard unicode emoji: must be passed through encodeURIComponent()
 *   - Custom emoji: pass the emoji ID string directly (not the :name: syntax)
 *   - message.react(emoji) handles both cases at the API level
 */

import { Message } from 'revolt.js';
import emojiConfigData from '../configs/emoji-config.json';
import chalk from 'chalk';

interface EmojiConfig {
    emoji: string;
    title: string;
    keywords: string[];
}

interface ReactionQueueEntry {
    message: Message;
    emoji: string;
}

const emojis: EmojiConfig[] = emojiConfigData as EmojiConfig[];

/**
 * Returns true if the emoji string looks like a unicode emoji rather than a custom ID.
 * Custom emoji IDs in Revolt are ULID strings (e.g. "01ABCDEF..."), not unicode.
 * We detect unicode by checking for non-ASCII characters or known emoji sequences.
 */
function isUnicodeEmoji(emoji: string): boolean {
    // If it contains non-ASCII chars it's a unicode emoji
    return /[^\x00-\x7F]/.test(emoji);
}

/**
 * Encode an emoji for use with the Revolt reactions API.
 *   - Unicode emoji  → encodeURIComponent (required by Revolt API)
 *   - Custom ID      → pass through as-is
 */
function encodeEmoji(emoji: string): string {
    return isUnicodeEmoji(emoji) ? encodeURIComponent(emoji) : emoji;
}

export class KeywordChecker {
    private emojiMap: EmojiConfig[];

    constructor() {
        this.emojiMap = emojis;
    }

    public getMatchingEmojis(messageContent: string): string[] {
        if (!messageContent || typeof messageContent !== 'string') return [];

        const lowerMessage = messageContent.toLowerCase();
        const foundEmojis = new Set<string>();

        this.emojiMap.forEach(item => {
            const matchFound = item.keywords.some(keyword => {
                const lowerKeyword = keyword.toLowerCase();
                const escapedKeyword = lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pluralization = '(s|es)?';
                const regex = new RegExp(`\\b${escapedKeyword}${pluralization}\\b`);
                return regex.test(lowerMessage);
            });

            if (matchFound) {
                foundEmojis.add(item.emoji);
            }
        });

        return Array.from(foundEmojis);
    }
}

let isProcessing = false;

export async function processReactionQueue(queue: ReactionQueueEntry[]): Promise<void> {
    if (isProcessing || queue.length === 0) return;

    isProcessing = true;

    const entry = queue.shift();
    if (entry) {
        try {
            const encoded = encodeEmoji(entry.emoji);
            await entry.message.react(encoded);
        } catch (error) {
            console.error(chalk.redBright(`Failed to react with ${entry.emoji}:`), error);
        }
    }

    isProcessing = false;

    if (queue.length > 0) {
        setTimeout(() => processReactionQueue(queue), 500);
    }
}
